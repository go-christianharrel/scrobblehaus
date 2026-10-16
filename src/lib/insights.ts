import { topCounts } from './util';
import type { Scrobble } from './types';

export interface Insights {
	hours: number[];
	weekdays: number[];
	best: { day: string; count: number };
	bestStreak: number;
	perDayAvg: number;
	heat: { day: string; count: number; level: number }[];
	topArtists: [string, number][];
	topTracks: [string, number][];
	onThisDay: { year: number; count: number; top: string }[];
}

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
	for (const [day, count] of perDay) if (count > best.count) best = { day, count };

	let streak = 0;
	let bestStreak = 0;
	let prev: number | null = null;
	for (const k of [...perDay.keys()].sort()) {
		const t = new Date(`${k}T00:00:00`).getTime();
		streak = prev !== null && Math.round((t - prev) / 86400000) === 1 ? streak + 1 : 1;
		bestStreak = Math.max(bestStreak, streak);
		prev = t;
	}

	const newest = rows.length ? rows[0].uts : 0;
	const oldest = rows.length ? rows[rows.length - 1].uts : 0;
	const span = rows.length ? Math.max(1, Math.round((newest - oldest) / 86400) + 1) : 1;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const start = new Date(today);
	start.setDate(start.getDate() - (52 * 7 + today.getDay()));
	const maxDay = Math.max(1, ...perDay.values());
	const heat: Insights['heat'] = [];
	for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
		const day = dayKey(d);
		const count = perDay.get(day) ?? 0;
		heat.push({ day, count, level: count ? Math.min(4, Math.ceil((count / maxDay) * 4)) : 0 });
	}

	const md = `${today.getMonth()}-${today.getDate()}`;
	const byYear = new Map<number, Scrobble[]>();
	for (const r of rows) {
		const d = new Date(r.uts * 1000);
		if (`${d.getMonth()}-${d.getDate()}` !== md || d.getFullYear() === today.getFullYear()) continue;
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
		heat,
		topArtists: topCounts(rows, (r) => r.artist, 10),
		topTracks: topCounts(rows, (r) => `${r.artist} — ${r.track}`, 10),
		onThisDay
	};
}
