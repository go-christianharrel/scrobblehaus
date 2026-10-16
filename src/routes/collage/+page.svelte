<script lang="ts">
	import PageHeader from '#lib/PageHeader.svelte';
	import { onMount } from 'svelte';
	import { fillImages, getTop } from '#lib/lastfm';
	import { loadImage, renderCollage } from '#lib/collage';
	import { settings } from '#lib/settings.svelte';
	import { PERIODS, type TopType } from '#lib/types';
	import { clamp } from '#lib/util';

	let type = $state<TopType>('albums');
	let period = $state('1month');
	let cols = $state(5);
	let rows = $state(5);
	let tile = $state(200);
	let gap = $state(0);
	let background = $state('#000000');
	let labels = $state(true);
	let plays = $state(false);
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);
	let ready = $state(false);
	let canvas: HTMLCanvasElement;

	async function generate(): Promise<void> {
		busy = true;
		failed = false;
		try {
			const user = settings.requireUser();
			const c = clamp(cols, 1, 15);
			const r = clamp(rows, 1, 15);
			status = 'Fetching data…';
			const items = await getTop(type, period, c * r, user);
			if (!items.length) throw new Error('No data for this period.');
			await fillImages(
				items,
				type,
				(n, t) => (status = `Looking up images… ${n}/${t}`)
			);
			status = 'Loading cover art…';
			const images = await Promise.all(items.map((i) => loadImage(i.img)));
			renderCollage(canvas, items, images, {
				cols: c,
				rows: r,
				tile: clamp(tile, 60, 300),
				gap: clamp(gap, 0, 40),
				background,
				labels,
				plays
			});
			ready = true;
			status = `Done: ${items.length} items (${canvas.width}×${canvas.height}px).`;
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	function savePng(): void {
		canvas.toBlob((blob) => {
			if (!blob) return;
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = `lastfm-${type}-${period}-${cols}x${rows}.png`;
			a.click();
			setTimeout(() => URL.revokeObjectURL(a.href), 2000);
		});
	}

	onMount(() => {
		if (settings.username) void generate();
	});
</script>

<PageHeader href="/collage" />
<div class="controls">
	<label
		>Type
		<select bind:value={type}>
			<option value="albums">Albums</option>
			<option value="artists">Artists</option>
			<option value="tracks">Tracks</option>
		</select>
	</label>
	<label
		>Period
		<select bind:value={period}>
			{#each PERIODS as p (p.value)}<option value={p.value}>{p.label}</option
				>{/each}
		</select>
	</label>
	<label
		>Columns <input
			type="number"
			min="1"
			max="15"
			bind:value={cols}
			style="width: 70px"
		/></label
	>
	<label
		>Rows <input
			type="number"
			min="1"
			max="15"
			bind:value={rows}
			style="width: 70px"
		/></label
	>
	<label
		>Tile px <input
			type="number"
			min="60"
			max="300"
			step="10"
			bind:value={tile}
			style="width: 80px"
		/></label
	>
	<label
		>Gap px <input
			type="number"
			min="0"
			max="40"
			bind:value={gap}
			style="width: 70px"
		/></label
	>
	<label>Background <input type="color" bind:value={background} /></label>
	<label
		>Labels
		<select bind:value={labels}>
			<option value={true}>Overlay</option>
			<option value={false}>None</option>
		</select>
	</label>
	<label
		>Playcount
		<select bind:value={plays}>
			<option value={false}>Hide</option>
			<option value={true}>Show</option>
		</select>
	</label>
	<button class="primary" onclick={generate} disabled={busy}>Generate</button>
	<button onclick={savePng} disabled={!ready}>Download PNG</button>
	<button onclick={() => window.print()} disabled={!ready}>Print</button>
</div>

<div class="status" class:err={failed} class:busy>{status}</div>
<p class="muted noprint">
	When Last.fm has no image, we look it up on Deezer and iTunes. If nothing is
	found, a colour tile with the name is shown.
</p>

<div class="wrap">
	<canvas bind:this={canvas} width="10" height="10"></canvas>
</div>

<style>
	.wrap {
		overflow: auto;
		background: #000;
		border-radius: 8px;
		padding: 8px;
		text-align: center;
	}
	canvas {
		max-width: 100%;
		height: auto;
	}
	@media print {
		.wrap {
			background: #fff;
			padding: 0;
		}
		canvas {
			width: 100% !important;
		}
	}
</style>
