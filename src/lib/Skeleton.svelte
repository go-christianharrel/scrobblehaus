<script lang="ts">
	type Props = {
		variant: 'table' | 'stats' | 'receipt' | 'grid';
		rows?: number;
	};

	let { variant, rows = 8 }: Props = $props();
</script>

<div class="skeleton" aria-busy="true" aria-label="Loading">
	{#if variant === 'table'}
		<div class="card">
			{#each Array.from({ length: rows }, (_, i) => i) as i (i)}
				<div class="sk-row">
					<span class="skel sk-n"></span>
					<span class="skel sk-grow"></span>
					<span class="skel sk-bar"></span>
					<span class="skel sk-n"></span>
				</div>
			{/each}
		</div>
	{:else if variant === 'stats'}
		<div class="sk-stats">
			{#each [0, 1, 2, 3, 4, 5] as i (i)}
				<div class="sk-stat">
					<span class="skel sk-big"></span><span class="skel sk-sm"></span>
				</div>
			{/each}
		</div>
		<div class="sk-cols">
			<div class="card"><span class="skel sk-block"></span></div>
			<div class="card"><span class="skel sk-block"></span></div>
		</div>
	{:else if variant === 'receipt'}
		<div class="sk-paper">
			<span class="skel sk-title"></span>
			{#each Array.from({ length: rows }, (_, i) => i) as i (i)}
				<span class="skel sk-line"></span>
			{/each}
		</div>
	{:else}
		<div class="sk-tiles">
			{#each Array.from({ length: rows }, (_, i) => i) as i (i)}
				<span class="skel sk-tile"></span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.skeleton {
		margin-top: 12px;
	}
	.sk-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 0;
	}
	.sk-row .sk-n {
		width: 28px;
		height: 14px;
	}
	.sk-row .sk-grow {
		flex: 1;
		height: 14px;
	}
	.sk-row .sk-bar {
		width: 22%;
		height: 10px;
	}
	.sk-stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 12px;
		margin-bottom: 12px;
	}
	.sk-stat {
		display: grid;
		gap: 10px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: 16px;
	}
	.sk-big {
		height: 26px;
		width: 60%;
	}
	.sk-sm {
		height: 12px;
		width: 40%;
	}
	.sk-cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 12px;
	}
	.sk-block {
		height: 160px;
	}
	.sk-paper {
		display: grid;
		gap: 12px;
		max-width: 380px;
		margin: 8px auto;
		padding: 28px 24px;
		border: 1px solid var(--line);
		border-radius: 8px;
	}
	.sk-title {
		height: 20px;
		width: 55%;
		margin: 0 auto 6px;
	}
	.sk-paper .sk-line {
		height: 12px;
	}
	.sk-tiles {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
	}
	.sk-tile {
		aspect-ratio: 1;
		border-radius: 10px;
	}
</style>
