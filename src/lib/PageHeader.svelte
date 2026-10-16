<script lang="ts">
	import Icon from './Icon.svelte';
	import { TOOLS } from './tools';

	let { href }: { href: string } = $props();
	const tool = $derived(TOOLS.find((t) => t.href === href));
</script>

{#if tool}
	<header class="ph noprint" style="--h: {tool.hue}">
		<span class="ico"><Icon name={tool.icon} size={24} /></span>
		<div>
			<h1>{tool.label}</h1>
			<p class="muted">{tool.blurb}</p>
		</div>
	</header>
{/if}

<style>
	.ph {
		display: flex;
		align-items: center;
		gap: 16px;
		margin: 4px 0 22px;
	}
	.ico {
		width: 52px;
		height: 52px;
		border-radius: 16px;
		display: grid;
		place-items: center;
		color: #fff;
		background: linear-gradient(
			135deg,
			hsl(var(--h) 90% 60%),
			hsl(calc(var(--h) + 30) 90% 52%)
		);
		box-shadow: 0 10px 28px hsl(var(--h) 90% 55% / 0.4);
		flex-shrink: 0;
	}
	h1 {
		margin: 0;
		font-size: 28px;
		line-height: 1.15;
	}
	p {
		margin: 2px 0 0;
	}
</style>
