<script lang="ts">
	import { pixelGrid } from './insights';
	import { toggleFullscreen } from './fullscreen';
	import { fmt } from './util';
	import type { Scrobble } from './types';

	let { rows }: { rows: Scrobble[] } = $props();

	let card = $state<HTMLDivElement>();
	const grid = $derived(pixelGrid(rows));
</script>

<div class="card pixel" bind:this={card}>
	<div class="head">
		<b>Pixel grid</b>
		<span class="muted">{fmt(grid.activeDays)} days with scrobbles</span>
		<button class="noprint" onclick={() => toggleFullscreen(card)}
			>Fullscreen</button
		>
	</div>
	{#each grid.years as y (y.year)}
		<div class="year">
			<span class="label muted">{y.year}</span>
			<div class="heat">
				{#each y.cells as c, i (i)}
					{#if c}<i
							class={c.level ? `l${c.level}` : ''}
							title="{c.day}: {fmt(c.count)}"
						></i>{:else}<i class="pad"></i>{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.pixel {
		--cell: 13px;
	}
	.pixel:fullscreen {
		--cell: 17px;
		background: var(--bg);
		padding: 28px;
		overflow: auto;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 10px;
	}
	.head button {
		margin-left: auto;
		padding: 4px 12px;
		font-size: 12px;
	}
	.year {
		display: grid;
		grid-template-columns: 40px 1fr;
		align-items: start;
		margin-top: 8px;
	}
	.label {
		font-size: 12px;
		padding-top: 2px;
	}
	.pixel :global(.heat) {
		grid-template-rows: repeat(7, var(--cell));
		grid-auto-columns: var(--cell);
		padding-bottom: 4px;
	}
	.pixel :global(.heat i) {
		width: var(--cell);
		height: var(--cell);
	}
	.pixel :global(.heat i.pad) {
		background: transparent;
		box-shadow: none;
	}
</style>
