export const fmt = (n: number | string): string => Number(n).toLocaleString();

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const stamp = (): string => new Date().toISOString().slice(0, 10);

export function hashHue(text: string): number {
	let h = 0;
	for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	return h % 360;
}

export function clamp(value: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, Number.isFinite(value) ? value : lo));
}

export function toCsv(rows: (string | number)[][]): string {
	const cell = (v: string | number): string => {
		const s = String(v ?? '');
		return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
	};
	return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n');
}

export function download(name: string, text: string, type: string): void {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const a = document.createElement('a');
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function topCounts<T>(rows: T[], keyFn: (row: T) => string, n: number): [string, number][] {
	const counts = new Map<string, number>();
	for (const row of rows) {
		const k = keyFn(row);
		counts.set(k, (counts.get(k) ?? 0) + 1);
	}
	return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}
