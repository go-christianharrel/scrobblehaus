import type { TopItem } from '#lib/types';
import { fmt } from '#lib/util';

export type ReceiptData = {
	title: string;
	subtitle: string;
	printedAt: string;
	user: string;
	items: TopItem[];
};

const SCALE = 2;
const WIDTH = 380;
const MARGIN = 24;
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

const rowCount = (items: TopItem[]): number => items.length + 17;

export function drawReceipt(
	canvas: HTMLCanvasElement,
	data: ReceiptData
): void {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas is not supported in this browser.');
	const height = rowCount(data.items) * LINE + PAD * 2 + TOOTH;
	canvas.width = (WIDTH + MARGIN * 2) * SCALE;
	canvas.height = (height + MARGIN * 2) * SCALE;
	ctx.scale(SCALE, SCALE);
	ctx.fillStyle = '#0d0d12';
	ctx.fillRect(0, 0, WIDTH + MARGIN * 2, height + MARGIN * 2);
	ctx.translate(MARGIN, MARGIN);

	ctx.fillStyle = '#fff';
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

	ctx.fillStyle = '#111';
	ctx.strokeStyle = '#444';
	ctx.font = FONT;
	ctx.textBaseline = 'middle';
	const inner = WIDTH - PAD * 2;
	let y = PAD + LINE / 2;

	const center = (text: string, font = FONT): void => {
		ctx.font = font;
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
		const itemX = PAD + ctx.measureText('00').width + 8;
		const itemMax = inner - (itemX - PAD) - ctx.measureText(plays).width - 8;
		ctx.fillText(fitText(ctx, item, itemMax), itemX, y);
		y += LINE;
	};
	const bold = `bold ${FONT}`;

	center('LAST.FM', 'bold 18px "Courier New", monospace');
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
		if (i % 2 === 0) ctx.fillRect(x, y, w, 44);
		x += w;
		i++;
	}
	y += 44 + LINE / 2;
	center(data.user);
}
