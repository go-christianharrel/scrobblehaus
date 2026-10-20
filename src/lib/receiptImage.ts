import type { TopItem } from '#lib/types';
import { fmt } from '#lib/util';

export type ReceiptTheme = 'classic' | 'dark' | 'thermal' | 'sunset';

type ThemeColors = {
	paper: string;
	ink: string;
	rule: string;
	accent: string;
};

export const RECEIPT_THEMES: Record<ReceiptTheme, ThemeColors> = {
	classic: {
		paper: '#ffffff',
		ink: '#111111',
		rule: '#444444',
		accent: '#111111'
	},
	dark: {
		paper: '#16161d',
		ink: '#f1f1f4',
		rule: '#6b6b7a',
		accent: '#ff5a4d'
	},
	thermal: {
		paper: '#f4ecd8',
		ink: '#2b2b2b',
		rule: '#7a6f58',
		accent: '#2b2b2b'
	},
	sunset: {
		paper: '#fff1ea',
		ink: '#3a1510',
		rule: '#c4665a',
		accent: '#e8343f'
	}
};

export const RECEIPT_THEME_OPTIONS: { value: ReceiptTheme; label: string }[] = [
	{ value: 'classic', label: 'Classic' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'thermal', label: 'Thermal' },
	{ value: 'sunset', label: 'Sunset' }
];

export type ReceiptData = {
	title: string;
	subtitle: string;
	printedAt: string;
	user: string;
	items: TopItem[];
	theme: ReceiptTheme;
};

const SCALE = 2;
const WIDTH = 380;
const PAD = 24;
const FONT = '13px "Courier New", monospace';
const LINE = 20;
const TOOTH = 10;

const fitText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number
): string => {
	if (ctx.measureText(text).width <= maxWidth) return text;
	let cut = text.length;
	while (cut > 1 && ctx.measureText(`${text.slice(0, cut)}…`).width > maxWidth)
		cut--;
	return `${text.slice(0, cut)}…`;
};

const BARCODE = 44;
const FIXED_ROWS = 12;

const receiptHeight = (items: TopItem[]): number =>
	PAD * 2 + LINE / 2 + (items.length + FIXED_ROWS) * LINE + BARCODE + LINE;

export function drawReceipt(
	canvas: HTMLCanvasElement,
	data: ReceiptData
): void {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas is not supported in this browser.');
	const height = receiptHeight(data.items);
	canvas.width = WIDTH * SCALE;
	canvas.height = height * SCALE;
	ctx.scale(SCALE, SCALE);

	const colors = RECEIPT_THEMES[data.theme];
	ctx.fillStyle = colors.paper;
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(WIDTH, 0);
	ctx.lineTo(WIDTH, height - TOOTH);
	for (let x = WIDTH; x > 0; x -= TOOTH * 2) {
		ctx.lineTo(x - TOOTH, height);
		ctx.lineTo(x - TOOTH * 2, height - TOOTH);
	}
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = colors.ink;
	ctx.strokeStyle = colors.rule;
	ctx.font = FONT;
	ctx.textBaseline = 'middle';
	const bold = `bold ${FONT}`;
	const inner = WIDTH - PAD * 2;
	ctx.font = bold;
	const qtyWidth = ctx.measureText('QTY').width;
	ctx.font = FONT;
	let y = PAD + LINE / 2;

	const center = (text: string, font = FONT, color = colors.ink): void => {
		ctx.font = font;
		ctx.fillStyle = color;
		ctx.textAlign = 'center';
		ctx.fillText(text, WIDTH / 2, y);
		y += LINE;
	};
	const rule = (): void => {
		ctx.setLineDash([4, 3]);
		ctx.beginPath();
		ctx.moveTo(PAD, y);
		ctx.lineTo(WIDTH - PAD, y);
		ctx.stroke();
		y += LINE;
	};
	const row = (qty: string, item: string, plays: string, font = FONT): void => {
		ctx.font = font;
		ctx.textAlign = 'left';
		ctx.fillText(qty, PAD, y);
		ctx.textAlign = 'right';
		ctx.fillText(plays, WIDTH - PAD, y);
		ctx.textAlign = 'left';
		const itemX = PAD + qtyWidth + 8;
		const itemMax = inner - (itemX - PAD) - ctx.measureText(plays).width - 8;
		ctx.fillText(fitText(ctx, item, itemMax), itemX, y);
		y += LINE;
	};

	center('SCROBBLEHAUS', 'bold 18px "Courier New", monospace', colors.accent);
	center(data.title);
	center(data.subtitle);
	center(data.printedAt);
	rule();
	row('QTY', 'ITEM', 'PLAYS', bold);
	rule();
	data.items.forEach((it, i) => {
		const name = it.artist ? `${it.name} — ${it.artist}` : it.name;
		row(String(i + 1).padStart(2, '0'), name, fmt(it.plays));
	});
	rule();
	const total = data.items.reduce((a, i) => a + i.plays, 0);
	row('', 'ITEM COUNT:', String(data.items.length), bold);
	row('', 'TOTAL PLAYS:', fmt(total), bold);
	rule();
	center('THANK YOU FOR LISTENING!');

	const bars = [2, 2, 1, 4, 3, 2];
	let x = PAD;
	let i = 0;
	while (x < WIDTH - PAD) {
		const w = bars[i % bars.length];
		if (i % 2 === 0) ctx.fillRect(x, y, w, BARCODE);
		x += w;
		i++;
	}
	y += BARCODE + LINE / 2;
	center(data.user);
}
