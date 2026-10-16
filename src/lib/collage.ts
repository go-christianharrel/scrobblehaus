import { fmt, hashHue } from './util';
import type { TopItem } from './types';

export interface CollageOptions {
	cols: number;
	rows: number;
	tile: number;
	gap: number;
	background: string;
	labels: boolean;
	plays: boolean;
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (!src) return resolve(null);
		const im = new Image();
		im.crossOrigin = 'anonymous';
		im.onload = () => resolve(im);
		im.onerror = () => resolve(null);
		im.src = src;
	});
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
	if (ctx.measureText(text).width <= maxW) return text;
	let t = text;
	while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
	return `${t}…`;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
	const lines: string[] = [];
	let cur = '';
	for (const word of text.split(/\s+/)) {
		const test = cur ? `${cur} ${word}` : word;
		if (ctx.measureText(test).width > maxW && cur) {
			lines.push(cur);
			cur = word;
		} else cur = test;
	}
	if (cur) lines.push(cur);
	return lines;
}

function drawTextTile(ctx: CanvasRenderingContext2D, item: TopItem, x: number, y: number, tile: number): void {
	ctx.fillStyle = `hsl(${hashHue(item.name)},45%,28%)`;
	ctx.fillRect(x, y, tile, tile);
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	const fs = Math.max(10, tile / 9);
	ctx.font = `600 ${fs}px sans-serif`;
	const lines = wrapLines(ctx, item.name, tile * 0.85).slice(0, 4);
	lines.forEach((l, i) => ctx.fillText(l, x + tile / 2, y + tile / 2 + (i - (lines.length - 1) / 2) * fs * 1.2));
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
}

function drawLabel(ctx: CanvasRenderingContext2D, item: TopItem, x: number, y: number, tile: number, o: CollageOptions): void {
	const fs = Math.max(9, tile / 17);
	const lineCount = (o.labels ? (item.artist ? 2 : 1) : 0) + (o.plays ? 1 : 0);
	const bh = lineCount * fs * 1.25 + fs * 0.6;
	const g = ctx.createLinearGradient(0, y + tile - bh, 0, y + tile);
	g.addColorStop(0, 'rgba(0,0,0,0)');
	g.addColorStop(0.35, 'rgba(0,0,0,.75)');
	g.addColorStop(1, 'rgba(0,0,0,.9)');
	ctx.fillStyle = g;
	ctx.fillRect(x, y + tile - bh, tile, bh);

	const pad = tile * 0.04;
	const maxW = tile - pad * 2;
	let ty = y + tile - fs * 0.5;
	ctx.shadowColor = 'rgba(0,0,0,.8)';
	ctx.shadowBlur = 3;
	if (o.plays) {
		ctx.font = `${fs}px sans-serif`;
		ctx.fillStyle = '#ff8a82';
		ctx.fillText(`${fmt(item.plays)} plays`, x + pad, ty);
		ty -= fs * 1.25;
	}
	if (o.labels) {
		ctx.fillStyle = '#fff';
		ctx.font = `700 ${fs}px sans-serif`;
		ctx.fillText(fitText(ctx, item.name, maxW), x + pad, ty);
		if (item.artist) {
			ctx.font = `${fs}px sans-serif`;
			ctx.fillStyle = '#ccc';
			ctx.fillText(fitText(ctx, item.artist, maxW), x + pad, ty - fs * 1.25);
		}
	}
	ctx.shadowBlur = 0;
}

export function renderCollage(canvas: HTMLCanvasElement, items: TopItem[], images: (HTMLImageElement | null)[], o: CollageOptions): void {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas is not supported in this browser.');
	canvas.width = o.cols * o.tile + o.gap * (o.cols + 1);
	canvas.height = o.rows * o.tile + o.gap * (o.rows + 1);
	ctx.fillStyle = o.background;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	items.forEach((item, idx) => {
		const x = o.gap + (idx % o.cols) * (o.tile + o.gap);
		const y = o.gap + Math.floor(idx / o.cols) * (o.tile + o.gap);
		const im = images[idx];
		if (im) ctx.drawImage(im, x, y, o.tile, o.tile);
		else drawTextTile(ctx, item, x, y, o.tile);
		if (o.labels || o.plays) drawLabel(ctx, item, x, y, o.tile, o);
	});
}
