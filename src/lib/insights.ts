import { topCounts } from './util';
import type { Scrobble } from './types';

export type Insights = {
	hours: number[];
	weekdays: number[];
	best: { day: string; count: number };
	bestStreak: number;
	perDayAvg: number;
	topArtists: [string, number][];
	topTracks: [string, number][];
	onThisDay: { year: number; count: number; top: string }[];
};

export const dayKey = (d: Date): string =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function computeInsights(rows: Scrobble[]): Insights {
	const hours = Array<number>(24).fill(0);
	const weekdays = Array<number>(7).fill(0);
	const perDay = new Map<string, number>();
	for (const r of rows) {
		const d = new Date(r.uts * 1000);
		hours[d.getHours()]++;
		weekdays[d.getDay()]++;
		const k = dayKey(d);
		perDay.set(k, (perDay.get(k) ?? 0) + 1);
	}

	let best = { day: '-', count: 0 };
	for (const [day, count] of perDay)
		if (count > best.count) best = { day, count };

	let streak = 0;
	let bestStreak = 0;
	let prev: number | null = null;
	for (const k of [...perDay.keys()].sort()) {
		const t = new Date(`${k}T00:00:00`).getTime();
		streak =
			prev !== null && Math.round((t - prev) / 86400000) === 1 ? streak + 1 : 1;
		bestStreak = Math.max(bestStreak, streak);
		prev = t;
	}

	const newest = rows.length ? rows[0].uts : 0;
	const oldest = rows.length ? rows[rows.length - 1].uts : 0;
	const span = rows.length
		? Math.max(1, Math.round((newest - oldest) / 86400) + 1)
		: 1;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const md = `${today.getMonth()}-${today.getDate()}`;
	const byYear = new Map<number, Scrobble[]>();
	for (const r of rows) {
		const d = new Date(r.uts * 1000);
		if (
			`${d.getMonth()}-${d.getDate()}` !== md ||
			d.getFullYear() === today.getFullYear()
		)
			continue;
		const list = byYear.get(d.getFullYear()) ?? [];
		list.push(r);
		byYear.set(d.getFullYear(), list);
	}
	const onThisDay = [...byYear.entries()]
		.sort((a, b) => b[0] - a[0])
		.map(([year, list]) => ({
			year,
			count: list.length,
			top: topCounts(list, (r) => `${r.artist} — ${r.track}`, 1)[0][0]
		}));

	return {
		hours,
		weekdays,
		best,
		bestStreak,
		perDayAvg: rows.length / span,
		topArtists: topCounts(rows, (r) => r.artist, 10),
		topTracks: topCounts(rows, (r) => `${r.artist} — ${r.track}`, 10),
		onThisDay
	};
}

export type PixelDay = { day: string; count: number; level: number };

/** Null cells pad the first week so each weekday stays on its own row. */
export type PixelYear = { year: number; cells: (PixelDay | null)[] };

export type PixelGrid = { years: PixelYear[]; activeDays: number };

export function pixelGrid(rows: Scrobble[], today = new Date()): PixelGrid {
	if (!rows.length) return { years: [], activeDays: 0 };
	const perDay = new Map<string, number>();
	for (const r of rows) {
		const k = dayKey(new Date(r.uts * 1000));
		perDay.set(k, (perDay.get(k) ?? 0) + 1);
	}
	const maxDay = Math.max(1, ...perDay.values());
	const firstYear = new Date(rows[rows.length - 1].uts * 1000).getFullYear();
	const end = new Date(today);
	end.setHours(0, 0, 0, 0);

	const years: PixelYear[] = [];
	for (let year = end.getFullYear(); year >= firstYear; year--) {
		const cursor = new Date(year, 0, 1);
		const cells: (PixelDay | null)[] = Array<null>(cursor.getDay()).fill(null);
		for (; cursor.getFullYear() === year && cursor <= end;) {
			const day = dayKey(cursor);
			const count = perDay.get(day) ?? 0;
			cells.push({
				day,
				count,
				level: count ? Math.min(4, Math.ceil((count / maxDay) * 4)) : 0
			});
			cursor.setDate(cursor.getDate() + 1);
		}
		years.push({ year, cells });
	}
	return { years, activeDays: perDay.size };
}

/** Top artists inside [from, to] (unix seconds, 0 = open ended). */
export function wall(
	rows: Scrobble[],
	from = 0,
	to = 0,
	limit = 50
): [string, number][] {
	const inside = rows.filter((r) => r.uts >= from && (!to || r.uts <= to));
	return topCounts(inside, (r) => r.artist, limit);
}

export type VelocitySeries = {
	artist: string;
	total: number;
	/** Cumulative scrobbles at the end of each time bucket. */
	points: number[];
	/** Busiest bucket, as scrobbles per day. */
	peakPerDay: number;
};

export type Velocity = { start: number; end: number; series: VelocitySeries[] };

export function artistVelocity(
	rows: Scrobble[],
	artists: string[],
	buckets = 48
): Velocity {
	if (!rows.length) return { start: 0, end: 0, series: [] };
	const start = rows[rows.length - 1].uts;
	const end = rows[0].uts;
	const width = Math.max(1, (end - start) / buckets);
	const perBucket = new Map(
		artists.map((a) => [a, Array<number>(buckets).fill(0)])
	);
	for (const r of rows) {
		const counts = perBucket.get(r.artist);
		if (!counts) continue;
		counts[Math.min(buckets - 1, Math.floor((r.uts - start) / width))]++;
	}
	const bucketDays = width / 86400;
	const series = artists.map((artist) => {
		const counts = perBucket.get(artist) ?? [];
		let running = 0;
		return {
			artist,
			total: counts.reduce((sum, n) => sum + n, 0),
			points: counts.map((n) => (running += n)),
			peakPerDay: Math.max(0, ...counts) / bucketDays
		};
	});
	return { start, end, series };
}
