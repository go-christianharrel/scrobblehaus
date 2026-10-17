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
		type ExportFormat
	} from '#lib/exporter.svelte';

	let from = $state('');
	let to = $state('');
	const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
		{ value: 'csv', label: 'CSV' },
		{ value: 'json', label: 'JSON' }
	];

	let format = $state<ExportFormat>('csv');

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
