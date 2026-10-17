import { describe, expect, it } from 'vitest';
import { inRange, mergeScrobbles } from './scrobbleCache';
import type { Scrobble } from './types';

const row = (uts: number, track = 't'): Scrobble => ({
	uts,
	artist: 'a',
	album: '',
	track,
	mbid: ''
});

describe('mergeScrobbles', () => {
	it('puts fresh rows first and drops the boundary duplicate', () => {
		const merged = mergeScrobbles([row(30), row(20)], [row(20), row(10)]);
		expect(merged.map((s) => s.uts)).toEqual([30, 20, 10]);
	});

	it('keeps different tracks that share a timestamp', () => {
		const merged = mergeScrobbles([row(20, 'x')], [row(20, 'y')]);
		expect(merged).toHaveLength(2);
	});
});

describe('inRange', () => {
	it('treats a zero bound as open', () => {
		const rows = [row(30), row(20), row(10)];
		expect(inRange(rows, 15, 0)).toHaveLength(2);
		expect(inRange(rows, 0, 20)).toHaveLength(2);
	});
});
