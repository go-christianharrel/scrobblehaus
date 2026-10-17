<script lang="ts" generics="T extends string">
	import { tick } from 'svelte';

	type Option = { value: T; label: string };

	let {
		value = $bindable(),
		options,
		ariaLabel
	}: { value: T; options: Option[]; ariaLabel?: string } = $props();

	let open = $state(false);
	let openUp = $state(false);
	let active = $state(0);
	let root: HTMLDivElement | undefined;
	let list = $state<HTMLUListElement>();

	const selected = $derived(options.find((o) => o.value === value));

	async function show(): Promise<void> {
		const rect = root?.getBoundingClientRect();
		openUp = rect
			? innerHeight - rect.bottom < 280 && rect.top > innerHeight - rect.bottom
			: false;
		active = Math.max(
			0,
			options.findIndex((o) => o.value === value)
		);
		open = true;
		await tick();
		scrollActive();
	}

	function scrollActive(): void {
		list?.children[active]?.scrollIntoView({ block: 'nearest' });
	}

	function choose(index: number): void {
		value = options[index].value;
		open = false;
	}

	function move(step: number): void {
		active = (active + step + options.length) % options.length;
		scrollActive();
	}

	function onKeydown(e: KeyboardEvent): void {
		if (!open) {
			if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
				e.preventDefault();
				void show();
			}
			return;
		}
		const handlers: Record<string, () => void> = {
			ArrowDown: () => move(1),
			ArrowUp: () => move(-1),
			Home: () => ((active = 0), scrollActive()),
			End: () => ((active = options.length - 1), scrollActive()),
			Enter: () => choose(active),
			' ': () => choose(active),
			Escape: () => (open = false),
			Tab: () => (open = false)
		};
		const handler = handlers[e.key];
		if (!handler) return;
		if (e.key !== 'Tab') e.preventDefault();
		handler();
	}

	function onWindowPointerDown(e: PointerEvent): void {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onpointerdown={onWindowPointerDown} />

<div class="select" bind:this={root}>
	<button
		type="button"
		class="trigger"
		class:open
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label={ariaLabel}
		onclick={() => (open ? (open = false) : show())}
		onkeydown={onKeydown}
	>
		<span class="current">{selected?.label ?? ''}</span>
		<svg
			class="chev"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg
		>
	</button>
	{#if open}
		<ul class="menu" class:up={openUp} role="listbox" bind:this={list}>
			{#each options as option, i (option.value)}
				<li
					role="option"
					aria-selected={option.value === value}
					class:active={i === active}
					class:chosen={option.value === value}
					onpointerenter={() => (active = i)}
					onclick={() => choose(i)}
					onkeydown={null}
				>
					<span>{option.label}</span>
					{#if option.value === value}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.6"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg
						>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.select {
		position: relative;
		display: inline-block;
		min-width: 130px;
	}
	.trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		text-align: left;
		font-weight: 500;
	}
	.trigger.open {
		border-color: var(--accent2);
		box-shadow: 0 0 0 3px rgba(255, 122, 89, 0.2);
	}
	.current {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.chev {
		flex: none;
		color: var(--muted);
		transition: transform 0.2s;
	}
	.trigger.open .chev {
		transform: rotate(180deg);
	}
	.menu {
		position: absolute;
		z-index: 40;
		top: calc(100% + 6px);
		left: 0;
		min-width: 100%;
		width: max-content;
		max-width: min(320px, 90vw);
		max-height: 280px;
		overflow-y: auto;
		margin: 0;
		padding: 6px;
		list-style: none;
		background: var(--menu-bg);
		backdrop-filter: blur(18px);
		border: 1px solid var(--line2);
		border-radius: 14px;
		box-shadow: var(--shadow);
		animation: pop 0.14s ease both;
		transform-origin: top left;
	}
	.menu.up {
		top: auto;
		bottom: calc(100% + 6px);
		transform-origin: bottom left;
	}
	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 9px 12px;
		border-radius: 10px;
		font-size: 14px;
		letter-spacing: 0;
		text-transform: none;
		font-weight: 500;
		color: var(--text);
		cursor: pointer;
	}
	li.active {
		background: var(--hover);
	}
	li.chosen {
		color: var(--accent2);
		font-weight: 600;
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.97);
		}
	}
</style>
