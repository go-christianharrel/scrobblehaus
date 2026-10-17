import { fmt, hashHue } from './util';
import type { TopItem } from './types';

export type CollageOptions = {
	cols: number;
	rows: number;
	tile: number;
	gap: number;
	background: string;
	showName: boolean;
	showArtist: boolean;
	showPlays: boolean;
	showRank: boolean;
	/** Multiplier for label text, 1 is the default size. */
	textScale: number;
};

type LabelLine = { text: string; font: string; color: string };

/** Pixel density of the exported image, so text and art stay sharp. */
const SCALE = 2;
const HI_RES = '/i/u/600x600/';

/** Last.fm serves larger renditions of the same cover from the same URL. */
const hiResUrl = (src: string): string =>
	src.replace(/\/i\/u\/(?:\d+x\d+|\d+s)\//, HI_RES);

const loadOne = (src: string): Promise<HTMLImageElement | null> =>
	new Promise((resolve) => {
		if (!src) return resolve(null);
		const im = new Image();
		im.crossOrigin = 'anonymous';
		im.onload = () => resolve(im);
		im.onerror = () => resolve(null);
		im.src = src;
	});

export async function loadImage(src: string): Promise<HTMLImageElement | null> {
	const sharp = hiResUrl(src);
	if (sharp !== src) {
		const im = await loadOne(sharp);
		if (im) return im;
	}
	return loadOne(src);
}

function fitText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxW: number
): string {
	if (ctx.measureText(text).width <= maxW) return text;
	let t = text;
	while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW)
		t = t.slice(0, -1);
	return `${t}…`;
}

function wrapLines(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxW: number
): string[] {
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

function drawTextTile(
	ctx: CanvasRenderingContext2D,
	item: TopItem,
	x: number,
	y: number,
	tile: number
): void {
	ctx.fillStyle = `hsl(${hashHue(item.name)},45%,28%)`;
	ctx.fillRect(x, y, tile, tile);
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	const fs = Math.max(10, tile / 9);
	ctx.font = `600 ${fs}px sans-serif`;
	const lines = wrapLines(ctx, item.name, tile * 0.85).slice(0, 4);
	lines.forEach((l, i) =>
		ctx.fillText(
			l,
			x + tile / 2,
			y + tile / 2 + (i - (lines.length - 1) / 2) * fs * 1.2
		)
	);
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
}

function buildLabelLines(
	item: TopItem,
	fs: number,
	o: CollageOptions
): LabelLine[] {
	const lines: LabelLine[] = [];
	if (o.showArtist && item.artist)
		lines.push({
			text: item.artist,
			font: `${fs}px sans-serif`,
			color: '#ccc'
		});
	if (o.showName)
		lines.push({
			text: item.name,
			font: `700 ${fs}px sans-serif`,
			color: '#fff'
		});
	if (o.showPlays)
		lines.push({
			text: `${fmt(item.plays)} plays`,
			font: `${fs}px sans-serif`,
			color: '#ff8a82'
		});
	return lines;
}

function drawLabel(
	ctx: CanvasRenderingContext2D,
	item: TopItem,
	x: number,
	y: number,
	tile: number,
	o: CollageOptions
): void {
	const fs = Math.max(9, tile / 17) * o.textScale;
	const lines = buildLabelLines(item, fs, o);
	if (!lines.length) return;
	const bh = lines.length * fs * 1.25 + fs * 0.6;
	const g = ctx.createLinearGradient(0, y + tile - bh, 0, y + tile);
	g.addColorStop(0, 'rgba(0,0,0,0)');
	g.addColorStop(0.35, 'rgba(0,0,0,.75)');
	g.addColorStop(1, 'rgba(0,0,0,.9)');
	ctx.fillStyle = g;
	ctx.fillRect(x, y + tile - bh, tile, bh);

	const pad = tile * 0.04;
	ctx.shadowColor = 'rgba(0,0,0,.8)';
	ctx.shadowBlur = 3;
	// Lines are ordered top to bottom; draw from the bottom edge upwards.
	lines.reverse().forEach((line, i) => {
		ctx.font = line.font;
		ctx.fillStyle = line.color;
		const ty = y + tile - fs * 0.5 - i * fs * 1.25;
		ctx.fillText(fitText(ctx, line.text, tile - pad * 2), x + pad, ty);
	});
	ctx.shadowBlur = 0;
}

function drawRank(
	ctx: CanvasRenderingContext2D,
	rank: number,
	x: number,
	y: number,
	tile: number
): void {
	const r = Math.max(9, tile / 12);
	const cx = x + r + tile * 0.04;
	const cy = y + r + tile * 0.04;
	ctx.fillStyle = 'rgba(0,0,0,.7)';
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = '#fff';
	ctx.font = `700 ${r * 1.1}px sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(String(rank), cx, cy);
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
}

export function renderCollage(
	canvas: HTMLCanvasElement,
	items: TopItem[],
	images: (HTMLImageElement | null)[],
	o: CollageOptions
): void {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas is not supported in this browser.');
	const width = o.cols * o.tile + o.gap * (o.cols + 1);
	const height = o.rows * o.tile + o.gap * (o.rows + 1);
	canvas.width = width * SCALE;
	canvas.height = height * SCALE;
	canvas.style.width = `${width}px`;
	ctx.scale(SCALE, SCALE);
	ctx.imageSmoothingQuality = 'high';
	ctx.fillStyle = o.background;
	ctx.fillRect(0, 0, width, height);
	items.forEach((item, idx) => {
		const x = o.gap + (idx % o.cols) * (o.tile + o.gap);
		const y = o.gap + Math.floor(idx / o.cols) * (o.tile + o.gap);
		const im = images[idx];
		if (im) ctx.drawImage(im, x, y, o.tile, o.tile);
		else drawTextTile(ctx, item, x, y, o.tile);
		drawLabel(ctx, item, x, y, o.tile, o);
		if (o.showRank) drawRank(ctx, idx + 1, x, y, o.tile);
	});
}
