<script lang="ts">
	type Props = {
		variant: 'table' | 'stats' | 'receipt' | 'grid';
		rows?: number;
	};

	let { variant, rows = 8 }: Props = $props();
</script>

<div class="skeleton {variant}" aria-busy="true" aria-label="Loading">
	{#if variant === 'table'}
		<div class="card">
			{#each Array.from({ length: rows }, (_, i) => i) as i (i)}
				<div class="row">
					<span class="skel n"></span>
					<span class="skel grow"></span>
					<span class="skel bar"></span>
					<span class="skel n"></span>
				</div>
			{/each}
		</div>
	{:else if variant === 'stats'}
		<div class="stats">
			{#each [0, 1, 2, 3, 4, 5] as i (i)}
				<div class="stat">
					<span class="skel big"></span><span class="skel sm"></span>
				</div>
			{/each}
		</div>
		<div class="cols">
			<div class="card"><span class="skel block"></span></div>
			<div class="card"><span class="skel block"></span></div>
		</div>
	{:else if variant === 'receipt'}
		<div class="paper">
			<span class="skel title"></span>
			{#each Array.from({ length: rows }, (_, i) => i) as i (i)}
				<span class="skel line"></span>
			{/each}
		</div>
	{:else}
		<div class="tiles">
			{#each Array.from({ length: rows }, (_, i) => i) as i (i)}
				<span class="skel tile"></span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.skeleton {
		margin-top: 12px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 0;
	}
	.row .n {
		width: 28px;
		height: 14px;
	}
	.row .grow {
		flex: 1;
		height: 14px;
	}
	.row .bar {
		width: 22%;
		height: 10px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 12px;
		margin-bottom: 12px;
	}
	.stat {
		display: grid;
		gap: 10px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: 16px;
	}
	.big {
		height: 26px;
		width: 60%;
	}
	.sm {
		height: 12px;
		width: 40%;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 12px;
	}
	.block {
		height: 160px;
	}
	.paper {
		display: grid;
		gap: 12px;
		max-width: 380px;
		margin: 8px auto;
		padding: 28px 24px;
		border: 1px solid var(--line);
		border-radius: 8px;
	}
	.title {
		height: 20px;
		width: 55%;
		margin: 0 auto 6px;
	}
	.paper .line {
		height: 12px;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
	}
	.tile {
		aspect-ratio: 1;
		border-radius: 10px;
	}
</style>
