import { toBlob } from 'html-to-image';

export async function saveElementAsPng(
	node: HTMLElement,
	filename: string
): Promise<void> {
	const background = getComputedStyle(document.body).backgroundColor;
	const blob = await toBlob(node, {
		pixelRatio: 2,
		backgroundColor: background
	});
	if (!blob) throw new Error('Could not create the image.');
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
