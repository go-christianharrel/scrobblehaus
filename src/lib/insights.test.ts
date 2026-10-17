import { describe, expect, it } from 'vitest';
import { artistVelocity, pixelGrid, wall } from './insights';
import type { Scrobble } from './types';

const DAY = 86400;
const at = (uts: number, artist: string): Scrobble => ({
	uts,
	artist,
	album: '',
	track: 't',
	mbid: ''
});

// Newest first, like the real data.
const rows: Scrobble[] = [
	at(10 * DAY, 'B'),
	at(5 * DAY, 'A'),
	at(4 * DAY, 'A'),
	at(1 * DAY, 'B')
];

describe('wall', () => {
	it('counts artists inside the date range only', () => {
		expect(wall(rows, 4 * DAY, 6 * DAY)).toEqual([['A', 2]]);
		expect(wall(rows)).toHaveLength(2);
	});
});

describe('artistVelocity', () => {
	it('builds cumulative points ending at the total', () => {
		const { series } = artistVelocity(rows, ['A'], 4);
		expect(series[0].points).toHaveLength(4);
		expect(series[0].points.at(-1)).toBe(2);
		expect(series[0].total).toBe(2);
	});

	it('handles no scrobbles', () => {
		expect(artistVelocity([], ['A']).series).toEqual([]);
	});
});

describe('pixelGrid', () => {
	it('covers every year back to the first scrobble', () => {
		const today = new Date(2026, 5, 15);
		const old = at(new Date(2024, 2, 1).getTime() / 1000, 'A');
		const { years, activeDays } = pixelGrid([old], today);
		expect(years.map((y) => y.year)).toEqual([2026, 2025, 2024]);
		expect(activeDays).toBe(1);
		const active = years[2].cells.filter((c) => c && c.count > 0);
		expect(active).toHaveLength(1);
	});
});
