import { api, getTop } from './lastfm';
import { session, settings } from './settings.svelte';
import type { TopType } from './types';
import { download, fmt, stamp, toCsv } from './util';

type Loved = {
	lovedtracks: {
		track?: {
			name: string;
			url: string;
			artist: { name: string };
			date?: { uts: string };
		}[];
		'@attr': { totalPages: string };
	};
};

export type ExportFormat = 'csv' | 'json';

export type ScrobbleExportOptions = {
	from: string;
	to: string;
	format: ExportFormat;
};

/** Lives outside the page so an export keeps running while you browse. */
export const exportJob = $state({
	busy: false,
	label: '',
	percent: 0,
	status: '',
	failed: false,
	unseen: false
});

const abort = { aborted: false };

const iso = (uts: number): string => new Date(uts * 1000).toISOString();

const toUnix = (date: string, time: string): number =>
	date ? Math.floor(new Date(`${date}T${time}`).getTime() / 1000) : 0;

export const cancelExport = (): void => {
	abort.aborted = true;
};

async function run(label: string, task: () => Promise<void>): Promise<void> {
	if (exportJob.busy) return;
	exportJob.busy = true;
	exportJob.label = label;
	exportJob.failed = false;
	exportJob.unseen = false;
	abort.aborted = false;
	try {
		await task();
	} catch (e) {
		exportJob.failed = true;
		exportJob.status = e instanceof Error ? e.message : String(e);
	} finally {
		exportJob.busy = false;
		exportJob.unseen = true;
	}
}

export const exportScrobbles = (opts: ScrobbleExportOptions): Promise<void> =>
	run('Exporting scrobbles', async () => {
		const user = settings.requireUser();
		exportJob.percent = 0;
		// Loaded on demand so the cache code stays out of every page's bundle.
		const { loadScrobbles } = await import('./scrobbleCache');
		const rows = await loadScrobbles({
			user,
			from: toUnix(opts.from, '00:00:00'),
			to: toUnix(opts.to, '23:59:59'),
			signal: abort,
			onProgress: (p, tp, total) => {
				exportJob.percent = (p / tp) * 100;
				exportJob.status = `Page ${p} / ${tp} — ${fmt(total)} scrobbles total`;
			}
		});
		session.scrobbles = rows;
		if (!rows.length) throw new Error('No scrobbles in that range.');
		if (opts.format === 'csv') {
			const header = [
				'timestamp',
				'datetime_utc',
				'artist',
				'album',
				'track',
				'mbid'
			];
			download(
				`${user}-scrobbles-${stamp()}.csv`,
				toCsv([
					header,
					...rows.map((r) => [
						r.uts,
						iso(r.uts),
						r.artist,
						r.album,
						r.track,
						r.mbid
					])
				]),
				'text/csv'
			);
		} else {
			download(
				`${user}-scrobbles-${stamp()}.json`,
				JSON.stringify(
					rows.map((r) => ({ ...r, datetime_utc: iso(r.uts) })),
					null,
					1
				),
				'application/json'
			);
		}
		exportJob.status = `${abort.aborted ? 'Cancelled. ' : 'Done! '}${fmt(rows.length)} scrobbles exported. You can now use them in Insights.`;
	});

export const exportLoved = (): Promise<void> =>
	run('Exporting loved tracks', async () => {
		const user = settings.requireUser();
		const rows: string[][] = [];
		let page = 1;
		let total = 1;
		while (page <= total) {
			const d = await api<Loved>('user.getlovedtracks', {
				user,
				limit: 200,
				page
			});
			total = Number(d.lovedtracks['@attr'].totalPages) || 1;
			for (const t of d.lovedtracks.track ?? [])
				rows.push([
					t.date ? iso(Number(t.date.uts)) : '',
					t.artist.name,
					t.name,
					t.url
				]);
			exportJob.percent = (page / total) * 100;
			exportJob.status = `Loved tracks page ${page}/${total}`;
			page++;
		}
		download(
			`${user}-loved-${stamp()}.csv`,
			toCsv([['loved_at_utc', 'artist', 'track', 'url'], ...rows]),
			'text/csv'
		);
		exportJob.status = `${rows.length} loved tracks exported.`;
	});

export const exportTop = (type: TopType): Promise<void> =>
	run(`Exporting top ${type}`, async () => {
		const user = settings.requireUser();
		exportJob.percent = 0;
		exportJob.status = 'Loading…';
		const items = await getTop(type, 'overall', 10000, user);
		download(
			`${user}-top-${type}-all-${stamp()}.csv`,
			toCsv([
				['rank', 'name', 'artist', 'playcount', 'url'],
				...items.map((r, i) => [i + 1, r.name, r.artist, r.plays, r.url])
			]),
			'text/csv'
		);
		exportJob.status = `${items.length} ${type} exported.`;
	});
