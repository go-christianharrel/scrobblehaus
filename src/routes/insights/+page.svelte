<script lang="ts">
	import Skeleton from '#lib/Skeleton.svelte';
	import Select from '#lib/Select.svelte';
	import PageHeader from '#lib/PageHeader.svelte';
	import { onMount } from 'svelte';
	import { saveElementAsPng } from '#lib/saveImage';
	import { api } from '#lib/lastfm';
	import { computeInsights, type Insights } from '#lib/insights';
	import { session, settings } from '#lib/settings.svelte';
	import { fmt } from '#lib/util';
	import type { Scrobble } from '#lib/types';

	const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const HOURS = Array.from({ length: 24 }, (_, i) => String(i));

	type Profile = {
		name: string;
		playcount: number;
		since: number;
		artists: string;
	};

	const DEPTH_OPTIONS: { value: string; label: string }[] = [
		{ value: '1000', label: 'Last 1,000' },
		{ value: '2000', label: 'Last 2,000 (fast)' },
		{ value: '5000', label: 'Last 5,000' },
		{ value: '10000', label: 'Last 10,000' },
		{ value: '25000', label: 'Last 25,000' },
		{ value: '50000', label: 'Last 50,000' },
		{ value: 'all', label: 'Everything (all-time)' }
	];

	let depth = $state('2000');
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);
	let profile = $state<Profile | null>(null);
	let data = $state<Insights | null>(null);
	let sampleSize = $state(0);
	const abort = { aborted: false };

	async function loadProfile(user: string): Promise<Profile> {
		const info = await api<{
			user: {
				name: string;
				playcount: string;
				registered: { unixtime: string };
			};
		}>('user.getinfo', { user });
		let artists = '-';
		try {
			const a = await api<{ topartists: { '@attr': { total: string } } }>(
				'user.gettopartists',
				{ user, limit: 1 }
			);
			artists = fmt(a.topartists['@attr'].total);
		} catch {
			// optional stat
		}
		return {
			name: info.user.name,
			playcount: Number(info.user.playcount),
			since: new Date(
				Number(info.user.registered.unixtime) * 1000
			).getFullYear(),
			artists
		};
	}

	function render(rows: Scrobble[]): void {
		data = computeInsights(rows);
		sampleSize = rows.length;
	}

	async function show(rows: Scrobble[]): Promise<void> {
		profile = await loadProfile(settings.requireUser());
		render(rows);
		status = '';
	}

	async function load(): Promise<void> {
		busy = true;
		failed = false;
		abort.aborted = false;
		try {
			const user = settings.requireUser();
			const maxPages =
				depth === 'all' ? Infinity : Math.ceil(Number(depth) / 200);
			const { loadScrobbles } = await import('#lib/scrobbleCache');
			// Needed before the first partial result can be shown.
			profile = await loadProfile(user);
			const rows = await loadScrobbles({
				user,
				maxPages,
				signal: abort,
				onPartial: render,
				onProgress: (p, tp, total) =>
					(status = `Page ${p}/${tp} — ${fmt(Math.min(p * 200, total))} of ${fmt(total)} scrobbles…`)
			});
			session.scrobbles = rows;
			render(rows);
			status = '';
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	async function useExported(): Promise<void> {
		failed = false;
		try {
			if (!session.scrobbles.length)
				throw new Error(
					"No exported data yet. Export from the Exporter first, or click 'Load'."
				);
			await show(session.scrobbles);
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		}
	}

	const peak = (values: number[]): number => Math.max(1, ...values);

	let shot = $state<HTMLElement>();

	function printImage(): void {
		if (shot) void saveElementAsPng(shot, 'lastfm-insights.png');
	}

	onMount(() => {
		if (settings.username) void load();
	});
</script>

<PageHeader href="/insights" />
<div class="controls">
	<label
		>Scrobbles to analyse
		<Select bind:value={depth} options={DEPTH_OPTIONS} />
	</label>
	<button class="primary" onclick={load} disabled={busy}
		>Load profile + scrobbles</button
	>
	<button onclick={() => (abort.aborted = true)} disabled={!busy}
		>Stop &amp; analyse so far</button
	>
	<button onclick={useExported}>Use exported data</button>
	<button onclick={printImage} disabled={!data}>Print</button>
</div>
<div class="status" class:err={failed} class:busy>{status}</div>

{#if busy && !data}
	<Skeleton variant="stats" />
{:else if data && profile}
	<div bind:this={shot}>
		<div class="stats">
			<div class="stat">
				<b>{fmt(profile.playcount)}</b><span class="muted">Total scrobbles</span
				>
			</div>
			<div class="stat">
				<b>{profile.since}</b><span class="muted">Member since</span>
			</div>
			<div class="stat">
				<b>{profile.artists}</b><span class="muted">Artists</span>
			</div>
			<div class="stat">
				<b>{fmt(sampleSize)}</b><span class="muted">Scrobbles analysed</span>
			</div>
			<div class="stat">
				<b>{data.perDayAvg.toFixed(1)}</b><span class="muted"
					>Avg per day (sample)</span
				>
			</div>
			<div class="stat">
				<b>{data.best.count || '-'}</b><span class="muted"
					>Busiest day · {data.best.day}</span
				>
			</div>
			<div class="stat">
				<b>{data.bestStreak} days</b><span class="muted"
					>Longest streak (sample)</span
				>
			</div>
		</div>

		<div class="cols">
			<div class="card">
				<b>By hour of day</b>
				<div class="bars">
					{#each data.hours as v, i (i)}<div
							style="height: {((v / peak(data.hours)) * 100).toFixed(1)}%"
							title="{i}: {fmt(v)}"
						></div>{/each}
				</div>
				<div class="axis">
					{#each HOURS as h, i (i)}<span>{i % 3 ? '' : h}</span>{/each}
				</div>
			</div>
			<div class="card">
				<b>By weekday</b>
				<div class="bars">
					{#each data.weekdays as v, i (i)}<div
							style="height: {((v / peak(data.weekdays)) * 100).toFixed(1)}%"
							title="{DAYS[i]}: {fmt(v)}"
						></div>{/each}
				</div>
				<div class="axis">
					{#each DAYS as d (d)}<span>{d}</span>{/each}
				</div>
			</div>
		</div>

		<div class="card">
			<b>Last 12 months</b>
			<div class="heat" style="margin-top: 10px">
				{#each data.heat as h (h.day)}<i
						class={h.level ? `l${h.level}` : ''}
						title="{h.day}: {h.count}"
					></i>{/each}
			</div>
		</div>

		{#if data.onThisDay.length}
			<div class="card">
				<b>On this day</b>
				<table>
					<tbody
						>{#each data.onThisDay as o (o.year)}<tr
								><td>{o.year}</td><td>{o.count} scrobbles</td><td class="muted"
									>{o.top}</td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
		{/if}

		<div class="cols">
			<div class="card">
				<b>Top artists in sample</b>
				<table>
					<tbody
						>{#each data.topArtists as [k, v] (k)}<tr
								><td>{k}</td><td class="num">{fmt(v)}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<div class="card">
				<b>Top tracks in sample</b>
				<table>
					<tbody
						>{#each data.topTracks as [k, v] (k)}<tr
								><td>{k}</td><td class="num">{fmt(v)}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
		</div>
	</div>
{/if}
