<script lang="ts">
	import { onMount } from 'svelte';
	import Select from '#lib/Select.svelte';
	import PageHeader from '#lib/PageHeader.svelte';
	import {
		cancelExport,
		exportJob,
		exportLoved,
		exportScrobbles,
		exportTop,
		rerunExport,
		type ExportFormat
	} from '#lib/exporter.svelte';
	import {
		clearExports,
		exportHistory,
		removeExport,
		type ExportRecord
	} from '#lib/exportHistory.svelte';
	import { settings } from '#lib/settings.svelte';
	import { fmt } from '#lib/util';

	let from = $state('');
	let to = $state('');
	const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
		{ value: 'csv', label: 'CSV' },
		{ value: 'json', label: 'JSON' }
	];

	let format = $state<ExportFormat>('csv');

	const mine = $derived(
		exportHistory.records.filter(
			(r) => r.user.toLowerCase() === settings.username.trim().toLowerCase()
		)
	);

	function describe(r: ExportRecord): string {
		const parts = [new Date(r.at).toLocaleString()];
		if (r.job.kind === 'scrobbles') {
			parts.push(r.job.format.toUpperCase());
			parts.push(
				r.job.from || r.job.to
					? `${r.job.from || 'start'} to ${r.job.to || 'today'}`
					: 'all time'
			);
		} else {
			parts.push('CSV');
		}
		parts.push(`${fmt(r.count)} rows`);
		return parts.join(' · ');
	}

	onMount(() => {
		exportJob.unseen = false;
	});
</script>

<PageHeader href="/export" />
<div class="controls">
	<label>From <input type="date" bind:value={from} /></label>
	<label>To <input type="date" bind:value={to} /></label>
	<label
		>Format
		<Select bind:value={format} options={FORMAT_OPTIONS} />
	</label>
	<button
		class="primary"
		onclick={() => exportScrobbles({ from, to, format })}
		disabled={exportJob.busy}>Export scrobbles</button
	>
	<button onclick={cancelExport} disabled={!exportJob.busy}>Cancel</button>
</div>
<div class="muted">
	Leave the dates blank to export everything. A big library can take a few
	minutes (200 scrobbles per request).
</div>
<div class="progress"><div style="width: {exportJob.percent}%"></div></div>
<div class="status" class:err={exportJob.failed} class:busy={exportJob.busy}>
	{exportJob.status}
</div>

<div class="card">
	<b>More exports</b>
	<div class="controls" style="margin: 10px 0 0">
		<button onclick={exportLoved} disabled={exportJob.busy}
			>Loved tracks (CSV)</button
		>
		<button onclick={() => exportTop('artists')} disabled={exportJob.busy}
			>All top artists (CSV)</button
		>
		<button onclick={() => exportTop('albums')} disabled={exportJob.busy}
			>All top albums (CSV)</button
		>
		<button onclick={() => exportTop('tracks')} disabled={exportJob.busy}
			>All top tracks (CSV)</button
		>
	</div>
</div>

{#if mine.length}
	<div class="card">
		<div class="head">
			<b>Past exports</b>
			<button onclick={() => clearExports(settings.username)}>Clear</button>
		</div>
		<ul class="past">
			{#each mine as r (r.id)}
				<li>
					<div>
						<b>{r.label}</b>
						<span class="muted">{describe(r)}</span>
					</div>
					<button onclick={() => rerunExport(r)} disabled={exportJob.busy}
						>Download again</button
					>
					<button onclick={() => removeExport(r.id)}>Remove</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.head button {
		padding: 4px 12px;
		font-size: 12px;
	}
	.past {
		margin: 12px 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 8px;
	}
	.past li {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		padding: 10px 12px;
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	.past li div {
		display: grid;
		gap: 2px;
		margin-right: auto;
		min-width: 0;
		font-size: 13px;
	}
	.past button {
		padding: 4px 12px;
		font-size: 12px;
	}
</style>
