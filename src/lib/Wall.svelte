<script lang="ts">
	import { wall } from './insights';
	import { toggleFullscreen } from './fullscreen';
	import { fmt } from './util';
	import type { Scrobble } from './types';

	let { rows }: { rows: Scrobble[] } = $props();

	let from = $state('');
	let to = $state('');
	let card = $state<HTMLDivElement>();

	const toUnix = (date: string, time: string): number =>
		date ? Math.floor(new Date(`${date}T${time}`).getTime() / 1000) : 0;

	const list = $derived(
		wall(rows, toUnix(from, '00:00:00'), toUnix(to, '23:59:59'))
	);
	const peak = $derived(Math.max(1, list[0]?.[1] ?? 1));
</script>

<div class="card wall" bind:this={card}>
	<div class="head">
		<b>The Wall</b>
		<span class="muted">Top 50 artists</span>
		<button class="noprint" onclick={() => toggleFullscreen(card)}
			>Fullscreen</button
		>
	</div>
	<div class="range noprint">
		<label>From <input type="date" bind:value={from} /></label>
		<label>To <input type="date" bind:value={to} /></label>
		{#if from || to}
			<button
				onclick={() => {
					from = '';
					to = '';
				}}>All time</button
			>
		{/if}
	</div>
	{#if list.length}
		<ol>
			{#each list as [artist, count], i (artist)}
				<li style="--w: {(count / peak) * 100}%">
					<span class="rank">{i + 1}</span>
					<span class="name" title={artist}>{artist}</span>
					<span class="num muted">{fmt(count)}</span>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="muted">No scrobbles in that range.</p>
	{/if}
</div>

<style>
	.wall:fullscreen {
		background: var(--bg);
		padding: 28px;
		overflow: auto;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.head button {
		margin-left: auto;
		padding: 4px 12px;
		font-size: 12px;
	}
	.range {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin: 12px 0;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
		gap: 4px 20px;
	}
	li {
		position: relative;
		display: grid;
		grid-template-columns: 26px 1fr auto;
		gap: 8px;
		align-items: center;
		padding: 6px 8px;
		border-radius: 8px;
		font-size: 13px;
		background: linear-gradient(
			90deg,
			var(--panel2) var(--w),
			transparent var(--w)
		);
	}
	.rank {
		color: var(--muted);
		font-size: 12px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.num {
		font-variant-numeric: tabular-nums;
	}
</style>
