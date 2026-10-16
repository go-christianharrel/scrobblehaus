import { describe, expect, it } from 'vitest';
import { clamp, fmt, hashHue, toCsv, topCounts } from './util';

describe('util', () => {
	it('formats numbers with separators', () => {
		expect(fmt(1234567)).toBe(Number(1234567).toLocaleString());
	});

	it('clamps and handles non-finite values', () => {
		expect(clamp(5, 0, 3)).toBe(3);
		expect(clamp(-1, 0, 3)).toBe(0);
		expect(clamp(Number.NaN, 2, 3)).toBe(2);
	});

	it('keeps hashHue in 0-359 and stable', () => {
		expect(hashHue('Radiohead')).toBe(hashHue('Radiohead'));
		expect(hashHue('Radiohead')).toBeLessThan(360);
	});

	it('escapes CSV cells', () => {
		const csv = toCsv([
			['a,b', 'say "hi"'],
			[1, 2]
		]);
		expect(csv).toContain('"a,b","say ""hi"""');
		expect(csv).toContain('\r\n1,2');
	});

	it('counts and sorts the top keys', () => {
		expect(topCounts(['a', 'b', 'a', 'c', 'a', 'b'], (x) => x, 2)).toEqual([
			['a', 3],
			['b', 2]
		]);
	});
});
