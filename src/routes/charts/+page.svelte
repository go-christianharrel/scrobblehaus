<script lang="ts">
	import Select from '#lib/Select.svelte';
	import PageHeader from '#lib/PageHeader.svelte';
	import { onMount } from 'svelte';
	import { getTop } from '#lib/lastfm';
	import { settings } from '#lib/settings.svelte';
	import {
		PERIODS,
		periodLabel,
		TOP_TYPE_OPTIONS,
		type TopItem,
		type TopType
	} from '#lib/types';
	import { clamp, download, fmt, stamp, toCsv } from '#lib/util';

	const METRIC_OPTIONS: { value: 'plays' | 'minutes'; label: string }[] = [
		{ value: 'plays', label: 'Plays' },
		{ value: 'minutes', label: 'Minutes listened (artists/tracks)' }
	];

	let type = $state<TopType>('artists');
	let period = $state('overall');
	let metric = $state<'plays' | 'minutes'>('plays');
	let limit = $state(50);
	let rows = $state<TopItem[]>([]);
	let unit = $state('Plays');
	let title = $state('');
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);

	const max = $derived(Math.max(1, ...rows.map((r) => r.plays)));

	async function load(): Promise<void> {
		busy = true;
		failed = false;
		status = 'Loading…';
		try {
			const user = settings.requireUser();
			const n = clamp(limit, 5, 500);
			let estimated = false;
			if (metric === 'minutes') {
				if (type === 'albums')
					throw new Error('Minutes mode is for Artists or Tracks only.');
				const tracks = await getTop('tracks', period, 1000, user);
				const mins = (t: TopItem): number => {
					if (!t.dur) estimated = true;
					return (t.plays * (t.dur || 210)) / 60;
				};
				let list: TopItem[];
				if (type === 'tracks')
					list = tracks.map((t) => ({ ...t, plays: Math.round(mins(t)) }));
				else {
					const byArtist = new Map<string, number>();
					for (const t of tracks)
						byArtist.set(t.artist, (byArtist.get(t.artist) ?? 0) + mins(t));
					list = [...byArtist].map(([name, v]) => ({
						name,
						artist: '',
						plays: Math.round(v),
						dur: 0,
						img: '',
						url: ''
					}));
				}
				rows = list.sort((a, b) => b.plays - a.plays).slice(0, n);
				unit = 'Minutes';
			} else {
				rows = await getTop(type, period, n, user);
				unit = 'Plays';
			}
			title = `${user} — Top ${type} by ${unit.toLowerCase()} (${periodLabel(period)})`;
			status =
				`${rows.length} results.` +
				(estimated
					? ' Minutes are estimated (3.5 min per track when Last.fm has no duration), based on your top 1,000 tracks.'
					: '');
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	function exportCsv(): void {
		const header = ['rank', 'name', 'artist', unit.toLowerCase(), 'url'];
		download(
			`lastfm-top-${type}-${period}-${stamp()}.csv`,
			toCsv([
				header,
				...rows.map((r, i) => [i + 1, r.name, r.artist, r.plays, r.url])
			]),
			'text/csv'
		);
	}

	onMount(() => {
		if (settings.username) void load();
	});
</script>

<PageHeader href="/charts" />
<div class="controls">
	<label
		>Type
		<Select bind:value={type} options={TOP_TYPE_OPTIONS} />
	</label>
	<label
		>Period
		<Select bind:value={period} options={PERIODS} />
	</label>
	<label
		>Metric
		<Select bind:value={metric} options={METRIC_OPTIONS} />
	</label>
	<label
		>Limit <input
			type="number"
			min="5"
			max="500"
			bind:value={limit}
			style="width: 80px"
		/></label
	>
	<button class="primary" onclick={load} disabled={busy}>Load</button>
	<button onclick={exportCsv} disabled={!rows.length}>Export CSV</button>
	<button onclick={() => window.print()} disabled={!rows.length}>Print</button>
</div>

<div class="status" class:err={failed} class:busy>{status}</div>

{#if rows.length}
	<div class="card">
		<div class="printtitle">{title}</div>
		<table>
			<thead>
				<tr
					><th>#</th><th>{type.slice(0, -1)}</th>{#if type !== 'artists'}<th
							>Artist</th
						>{/if}<th class="bar"></th><th class="num">{unit}</th></tr
				>
			</thead>
			<tbody>
				{#each rows as r, i (i)}
					<tr>
						<td class="rank" class:top={i < 3}>{i + 1}</td>
						<td>{r.name}</td>
						{#if type !== 'artists'}<td class="muted">{r.artist}</td>{/if}
						<td class="bar"
							><div
								class="barfill"
								style="width: {((r.plays / max) * 100).toFixed(1)}%"
							></div></td
						>
						<td class="num">{fmt(r.plays)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.rank {
		width: 44px;
		font-family: var(--display);
		font-weight: 700;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	.rank.top {
		color: var(--accent2);
		font-size: 18px;
	}
</style>
