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
	import {
		drawReceipt,
		RECEIPT_THEME_OPTIONS,
		RECEIPT_THEMES,
		type ReceiptTheme
	} from '#lib/receiptImage';
	import { clamp, fmt } from '#lib/util';

	let type = $state<TopType>('tracks');
	let period = $state('1month');
	let limit = $state(10);
	let theme = $state<ReceiptTheme>('classic');
	let items = $state<TopItem[]>([]);
	let user = $state('');
	let order = $state(0);
	let printedAt = $state('');
	let shownType = $state<TopType>('tracks');
	let shownPeriod = $state('1month');
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);

	let canvas: HTMLCanvasElement;

	const colors = $derived(RECEIPT_THEMES[theme]);
	const total = $derived(items.reduce((a, i) => a + i.plays, 0));

	async function make(): Promise<void> {
		busy = true;
		failed = false;
		status = 'Loading…';
		try {
			const name = settings.requireUser();
			const list = await getTop(type, period, clamp(limit, 3, 30), name);
			if (!list.length) throw new Error('No data for this period.');
			items = list;
			user = name;
			order = Math.floor(Math.random() * 9000) + 1000;
			printedAt = new Date().toLocaleString();
			shownType = type;
			shownPeriod = period;
			status = '';
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	function savePng(): void {
		drawReceipt(canvas, {
			title: `TOP ${shownType.toUpperCase()} — ${periodLabel(shownPeriod).toUpperCase()}`,
			subtitle: `ORDER #${order} FOR ${user.toUpperCase()}`,
			printedAt,
			user,
			items,
			theme
		});
		canvas.toBlob((blob) => {
			if (!blob) return;
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = `lastfm-receipt-${shownType}-${shownPeriod}-${theme}.png`;
			a.click();
			setTimeout(() => URL.revokeObjectURL(a.href), 2000);
		});
	}

	onMount(() => {
		if (settings.username) void make();
	});
</script>

<PageHeader href="/receipt" />
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
		>Theme
		<Select bind:value={theme} options={RECEIPT_THEME_OPTIONS} />
	</label>
	<label
		>Items <input
			type="number"
			min="3"
			max="30"
			bind:value={limit}
			style="width: 70px"
		/></label
	>
	<button class="primary" onclick={make} disabled={busy}
		>Print me a receipt</button
	>
	<button onclick={savePng} disabled={!items.length}>Print</button>
</div>

<div class="status" class:err={failed} class:busy>{status}</div>

<canvas bind:this={canvas} hidden></canvas>

{#if items.length}
	<div
		class="receipt"
		style="--paper: {colors.paper}; --ink: {colors.ink}; --rule: {colors.rule}; --accent: {colors.accent}"
	>
		<h2>SCROBBLEHAUS</h2>
		<div class="c">
			TOP {shownType.toUpperCase()} — {periodLabel(shownPeriod).toUpperCase()}
		</div>
		<div class="c">ORDER #{order} FOR {user.toUpperCase()}</div>
		<div class="c">{printedAt}</div>
		<hr />
		<div class="r"><b>QTY</b><b class="grow">ITEM</b><b>PLAYS</b></div>
		<hr />
		{#each items as it, i (i)}
			<div class="r">
				<span>{String(i + 1).padStart(2, '0')}</span>
				<span class="grow">{it.name}{it.artist ? ` — ${it.artist}` : ''}</span>
				<span>{fmt(it.plays)}</span>
			</div>
		{/each}
		<hr />
		<div class="r"><b>ITEM COUNT:</b><b>{items.length}</b></div>
		<div class="r"><b>TOTAL PLAYS:</b><b>{fmt(total)}</b></div>
		<hr />
		<div class="c">THANK YOU FOR LISTENING!</div>
		<div class="bc"></div>
		<div class="c">{user}</div>
	</div>
{/if}

<style>
	.receipt {
		background: var(--paper);
		color: var(--ink);
		font-family: 'Courier New', monospace;
		max-width: 380px;
		margin: 8px auto;
		padding: 28px 24px 34px;
		font-size: 13px;
		filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.55));
		--z: 10px;
		-webkit-mask:
			conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg)
				bottom / calc(var(--z) * 2) 51% repeat-x,
			linear-gradient(#000 0 0) top / 100% calc(100% - var(--z) + 1px) no-repeat;
		mask:
			conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg)
				bottom / calc(var(--z) * 2) 51% repeat-x,
			linear-gradient(#000 0 0) top / 100% calc(100% - var(--z) + 1px) no-repeat;
		animation: rise 0.5s ease both;
	}
	h2 {
		color: var(--accent);
		text-align: center;
		margin: 0 0 4px;
		font-size: 18px;
		letter-spacing: 2px;
	}
	.c {
		text-align: center;
	}
	hr {
		border: 0;
		border-top: 1px dashed var(--rule);
		margin: 10px 0;
	}
	.r {
		display: flex;
		gap: 8px;
		justify-content: space-between;
	}
	.grow {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.bc {
		height: 44px;
		margin: 12px 0 4px;
		background: repeating-linear-gradient(
			90deg,
			var(--ink) 0 2px,
			var(--paper) 2px 4px,
			var(--ink) 4px 5px,
			var(--paper) 5px 9px,
			var(--ink) 9px 12px,
			var(--paper) 12px 14px
		);
	}
</style>
