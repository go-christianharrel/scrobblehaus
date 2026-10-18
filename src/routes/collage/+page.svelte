<script lang="ts">
	import Skeleton from '#lib/Skeleton.svelte';
	import Select from '#lib/Select.svelte';
	import PageHeader from '#lib/PageHeader.svelte';
	import { onMount } from 'svelte';
	import { fillImages, findImage, getTop } from '#lib/lastfm';
	import { loadImage, renderCollage } from '#lib/collage';
	import { settings } from '#lib/settings.svelte';
	import {
		PERIODS,
		TOP_TYPE_OPTIONS,
		type TopItem,
		type TopType
	} from '#lib/types';
	import { clamp } from '#lib/util';

	const TITLE_LABELS: Record<TopType, string> = {
		albums: 'Album name',
		artists: 'Artist name',
		tracks: 'Track name'
	};

	let type = $state<TopType>('albums');
	let period = $state('1month');
	let cols = $state(5);
	let rows = $state(5);
	let tile = $state(200);
	let gap = $state(0);
	let background = $state('#000000');
	let showName = $state(true);
	let showArtist = $state(true);
	let showPlays = $state(false);
	let showRank = $state(false);
	let textScale = $state(1);
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);
	let ready = $state(false);
	let canvas: HTMLCanvasElement;
	let items: TopItem[] = [];
	let images: (HTMLImageElement | null)[] = [];
	let shown = $state<{ cols: number; rows: number; type: TopType }>({
		cols: 5,
		rows: 5,
		type: 'albums'
	});

	const titleLabel = $derived(TITLE_LABELS[shown.type]);

	function draw(): void {
		renderCollage(canvas, items, images, {
			cols: shown.cols,
			rows: shown.rows,
			tile: clamp(tile, 60, 300),
			gap: clamp(gap, 0, 40),
			background,
			showName,
			showArtist: showArtist && shown.type !== 'artists',
			showPlays,
			showRank,
			textScale
		});
	}

	/** Artists with no usable picture get the cover of one of their albums. */
	async function fillMissingArtists(top: TopItem[]): Promise<void> {
		await Promise.all(
			top.map(async (item, idx) => {
				if (images[idx]) return;
				const url = await findImage('artists', item.name, '', true);
				images[idx] = await loadImage(url, true);
			})
		);
	}

	async function generate(): Promise<void> {
		busy = true;
		failed = false;
		try {
			const user = settings.requireUser();
			const c = clamp(cols, 1, 15);
			const r = clamp(rows, 1, 15);
			status = 'Fetching data…';
			const top = await getTop(type, period, c * r, user);
			if (!top.length) throw new Error('No data for this period.');
			await fillImages(
				top,
				type,
				(n, t) => (status = `Looking up images… ${n}/${t}`)
			);
			status = 'Loading cover art…';
			images = await Promise.all(
				top.map((i) => loadImage(i.img, type === 'artists'))
			);
			if (type === 'artists') await fillMissingArtists(top);
			items = top;
			shown = { cols: c, rows: r, type };
			draw();
			ready = true;
			status = `Done: ${top.length} items (${canvas.width}×${canvas.height}px).`;
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

	// Style options redraw instantly from cached data, no refetch needed.
	$effect(() => {
		void [tile, gap, background, showName, showArtist, showPlays];
		void [showRank, textScale];
		if (ready) draw();
	});

	onMount(() => {
		if (settings.username) void generate();
	});
</script>

<PageHeader href="/collage" />
<div class="controls">
	<label
		>Type
		<Select bind:value={type} options={TOP_TYPE_OPTIONS} />
	</label>
	<label
		>Period
		<Select bind:value={period} options={PERIODS} />
	</label>
	<label class="num"
		>Columns <input type="number" min="1" max="15" bind:value={cols} /></label
	>
	<label class="num"
		>Rows <input type="number" min="1" max="15" bind:value={rows} /></label
	>
	<button class="primary" onclick={generate} disabled={busy}>
		{busy ? 'Generating…' : 'Generate'}
	</button>
</div>

<div class="controls style">
	<fieldset class="show">
		<legend>Show on tiles</legend>
		<label class="chip-toggle">
			<input type="checkbox" bind:checked={showName} />
			<span>{titleLabel}</span>
		</label>
		<label class="chip-toggle" class:off={shown.type === 'artists'}>
			<input
				type="checkbox"
				bind:checked={showArtist}
				disabled={shown.type === 'artists'}
			/>
			<span>Artist</span>
		</label>
		<label class="chip-toggle">
			<input type="checkbox" bind:checked={showPlays} />
			<span>Playcount</span>
		</label>
		<label class="chip-toggle">
			<input type="checkbox" bind:checked={showRank} />
			<span>Rank #</span>
		</label>
	</fieldset>
	<label class="num"
		>Tile px <input
			type="number"
			min="60"
			max="300"
			step="10"
			bind:value={tile}
		/></label
	>
	<label class="num"
		>Gap px <input type="number" min="0" max="40" bind:value={gap} /></label
	>
	<label
		>Text size
		<input type="range" min="0.7" max="1.8" step="0.1" bind:value={textScale} />
	</label>
	<label>Background <input type="color" bind:value={background} /></label>
	<button onclick={savePng} disabled={!ready}>Print</button>
</div>

<div class="status" class:err={failed} class:busy>{status}</div>
<p class="muted">
	When Last.fm has no image, we look it up on Deezer and iTunes. If nothing is
	found, a colour tile with the name is shown.
</p>

{#if busy && !ready}
	<Skeleton variant="grid" rows={10} />
{/if}

<div class="wrap">
	<canvas bind:this={canvas} width="10" height="10"></canvas>
</div>

<style>
	.num input {
		width: 80px;
	}
	.show {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		border: 0;
		margin: 0;
		padding: 0;
	}
	.show legend {
		padding: 0;
		margin-bottom: 6px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.chip-toggle {
		position: relative;
		display: inline-flex;
		flex-direction: row;
		cursor: pointer;
		letter-spacing: 0;
		text-transform: none;
		font-size: 13px;
		font-weight: 500;
	}
	.chip-toggle input {
		position: absolute;
		opacity: 0;
		inset: 0;
		cursor: pointer;
	}
	.chip-toggle span {
		padding: 7px 14px;
		border-radius: 999px;
		border: 1px solid var(--line2);
		background: var(--panel2);
		color: var(--muted);
		transition: all 0.15s;
	}
	.chip-toggle input:checked + span {
		color: #fff;
		border-color: transparent;
		background: var(--grad);
		background-origin: border-box;
		box-shadow: 0 6px 18px rgba(255, 45, 85, 0.3);
	}
	.chip-toggle input:focus-visible + span {
		outline: 2px solid var(--accent2);
		outline-offset: 2px;
	}
	.chip-toggle.off {
		opacity: 0.4;
		cursor: not-allowed;
	}
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
</style>
