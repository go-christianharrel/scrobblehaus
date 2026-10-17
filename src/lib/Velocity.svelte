<script lang="ts">
	import { artistVelocity } from './insights';
	import { fmt, topCounts } from './util';
	import type { Scrobble } from './types';

	let { rows }: { rows: Scrobble[] } = $props();

	const COLORS = [
		'#ff5a4d',
		'#5b8cff',
		'#2fb98d',
		'#e8a317',
		'#a56bff',
		'#ff6fb5'
	];
	const W = 640;
	const H = 240;
	const PAD = { left: 6, right: 6, top: 10, bottom: 22 };

	let picked = $state<string[] | null>(null);

	const choices = $derived(
		topCounts(rows, (r) => r.artist, 12).map(([artist]) => artist)
	);
	const active = $derived(picked ?? choices.slice(0, 4));
	const velocity = $derived(artistVelocity(rows, active));
	const top = $derived(
		Math.max(1, ...velocity.series.map((s) => s.points.at(-1) ?? 0))
	);

	const colorOf = (artist: string): string =>
		COLORS[active.indexOf(artist) % COLORS.length];

	function path(points: number[]): string {
		const step = (W - PAD.left - PAD.right) / Math.max(1, points.length - 1);
		return points
			.map((v, i) => {
				const x = PAD.left + i * step;
				const y = PAD.top + (1 - v / top) * (H - PAD.top - PAD.bottom);
				return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	function toggle(artist: string): void {
		const next = active.includes(artist)
			? active.filter((a) => a !== artist)
			: [...active, artist].slice(-COLORS.length);
		picked = next;
	}

	const year = (uts: number): string =>
		String(new Date(uts * 1000).getFullYear());
</script>

<div class="card">
	<b>Artist velocity</b>
	<p class="muted">
		Cumulative scrobbles over time. A steeper line means you were playing that
		artist faster.
	</p>
	<div class="chips">
		{#each choices as artist (artist)}
			<button
				class="pick"
				class:on={active.includes(artist)}
				style={active.includes(artist) ? `--c: ${colorOf(artist)}` : ''}
				onclick={() => toggle(artist)}>{artist}</button
			>
		{/each}
	</div>
	{#if velocity.series.length}
		<svg viewBox="0 0 {W} {H}" role="img" aria-label="Artist velocity chart">
			<line
				class="base"
				x1={PAD.left}
				x2={W - PAD.right}
				y1={H - PAD.bottom}
				y2={H - PAD.bottom}
			/>
			{#each velocity.series as s (s.artist)}
				<path d={path(s.points)} stroke={colorOf(s.artist)} />
			{/each}
			<text x={PAD.left} y={H - 5}>{year(velocity.start)}</text>
			<text x={W - PAD.right} y={H - 5} text-anchor="end"
				>{year(velocity.end)}</text
			>
		</svg>
		<table>
			<tbody>
				{#each velocity.series as s (s.artist)}
					<tr>
						<td><i class="dot" style="background: {colorOf(s.artist)}"></i></td>
						<td>{s.artist}</td>
						<td class="num">{fmt(s.total)}</td>
						<td class="num muted">peak {s.peakPerDay.toFixed(1)}/day</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="muted">Pick at least one artist.</p>
	{/if}
</div>

<style>
	p {
		margin: 4px 0 12px;
		font-size: 13px;
	}
	.pick {
		padding: 4px 12px;
		font-size: 12px;
	}
	.pick.on {
		color: #fff;
		background: var(--c);
		border-color: var(--c);
	}
	svg {
		width: 100%;
		height: auto;
		margin-top: 14px;
		overflow: visible;
	}
	path {
		fill: none;
		stroke-width: 2.2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.base {
		stroke: var(--line2);
	}
	text {
		fill: var(--muted);
		font-size: 11px;
	}
	.dot {
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	td:first-child {
		width: 18px;
	}
</style>
