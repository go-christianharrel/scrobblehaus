<script lang="ts">
	import Select from '#lib/Select.svelte';
	import PageHeader from '#lib/PageHeader.svelte';
	import { api, fetchScrobbles, getTop } from '#lib/lastfm';
	import { session, settings } from '#lib/settings.svelte';
	import type { TopType } from '#lib/types';
	import { download, fmt, stamp, toCsv } from '#lib/util';

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

	let from = $state('');
	let to = $state('');
	const FORMAT_OPTIONS: { value: 'csv' | 'json'; label: string }[] = [
		{ value: 'csv', label: 'CSV' },
		{ value: 'json', label: 'JSON' }
	];

	let format = $state<'csv' | 'json'>('csv');
	let percent = $state(0);
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);
	const abort = { aborted: false };

	const iso = (uts: number): string => new Date(uts * 1000).toISOString();

	async function run(task: () => Promise<void>): Promise<void> {
		busy = true;
		failed = false;
		abort.aborted = false;
		try {
			await task();
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	const exportScrobbles = (): Promise<void> =>
		run(async () => {
			const user = settings.requireUser();
			const start = from
				? Math.floor(new Date(`${from}T00:00:00`).getTime() / 1000)
				: 0;
			const end = to
				? Math.floor(new Date(`${to}T23:59:59`).getTime() / 1000)
				: 0;
			percent = 0;
			const rows = await fetchScrobbles({
				user,
				from: start,
				to: end,
				signal: abort,
				onProgress: (p, tp, total) => {
					percent = (p / tp) * 100;
					status = `Page ${p} / ${tp} — ${fmt(total)} scrobbles total`;
				}
			});
			session.scrobbles = rows;
			if (!rows.length) throw new Error('No scrobbles in that range.');
			if (format === 'csv') {
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
			status = `${abort.aborted ? 'Cancelled. ' : 'Done! '}${fmt(rows.length)} scrobbles exported. You can now use them in Insights.`;
		});

	const exportLoved = (): Promise<void> =>
		run(async () => {
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
				status = `Loved tracks page ${page}/${total}`;
				page++;
			}
			download(
				`${user}-loved-${stamp()}.csv`,
				toCsv([['loved_at_utc', 'artist', 'track', 'url'], ...rows]),
				'text/csv'
			);
			status = `${rows.length} loved tracks exported.`;
		});

	const exportTop = (type: TopType): Promise<void> =>
		run(async () => {
			const user = settings.requireUser();
			status = 'Loading…';
			const items = await getTop(type, 'overall', 10000, user);
			download(
				`${user}-top-${type}-all-${stamp()}.csv`,
				toCsv([
					['rank', 'name', 'artist', 'playcount', 'url'],
					...items.map((r, i) => [i + 1, r.name, r.artist, r.plays, r.url])
				]),
				'text/csv'
			);
			status = `${items.length} ${type} exported.`;
		});
</script>

<PageHeader href="/export" />
<div class="controls">
	<label>From <input type="date" bind:value={from} /></label>
	<label>To <input type="date" bind:value={to} /></label>
	<label
		>Format
		<Select bind:value={format} options={FORMAT_OPTIONS} />
	</label>
	<button class="primary" onclick={exportScrobbles} disabled={busy}
		>Export scrobbles</button
	>
	<button onclick={() => (abort.aborted = true)} disabled={!busy}>Cancel</button
	>
</div>
<div class="muted">
	Leave the dates blank to export everything. A big library can take a few
	minutes (200 scrobbles per request).
</div>
<div class="progress"><div style="width: {percent}%"></div></div>
<div class="status" class:err={failed} class:busy>{status}</div>

<div class="card">
	<b>More exports</b>
	<div class="controls" style="margin: 10px 0 0">
		<button onclick={exportLoved} disabled={busy}>Loved tracks (CSV)</button>
		<button onclick={() => exportTop('artists')} disabled={busy}
			>All top artists (CSV)</button
		>
		<button onclick={() => exportTop('albums')} disabled={busy}
			>All top albums (CSV)</button
		>
		<button onclick={() => exportTop('tracks')} disabled={busy}
			>All top tracks (CSV)</button
		>
	</div>
</div>
