export function toggleFullscreen(el: HTMLElement | undefined): void {
	if (!el) return;
	if (document.fullscreenElement) void document.exitFullscreen();
	else void el.requestFullscreen();
}
