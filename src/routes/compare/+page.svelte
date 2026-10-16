<script lang="ts">
	import PageHeader from '#lib/PageHeader.svelte';
	import { getTop } from '#lib/lastfm';
	import { settings } from '#lib/settings.svelte';
	import { PERIODS } from '#lib/types';
	import { fmt } from '#lib/util';

	interface Shared {
		name: string;
		mine: number;
		theirs: number;
	}

	let other = $state('');
	let period = $state('overall');
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);
	let shared = $state<Shared[]>([]);
	let score = $state<number | null>(null);
	let me = $state('');
	let them = $state('');

	const verdict = $derived(
		score === null ? '' : score >= 70 ? 'Musical soulmates' : score >= 45 ? 'Very much in sync' : score >= 20 ? 'Some common ground' : score > 0 ? 'Different wavelengths' : 'Total opposites'
	);
	const peak = $derived(Math.max(1, ...shared.slice(0, 25).flatMap((x) => [x.mine, x.theirs])));

	async function compare(): Promise<void> {
		busy = true;
		failed = false;
		status = 'Comparing…';
		score = null;
		shared = [];
		try {
			const user = settings.requireUser();
			const friend = other.trim();
			if (!friend) throw new Error("Type your friend's Last.fm username first.");
			const [a, b] = await Promise.all([getTop('artists', period, 500, user), getTop('artists', period, 500, friend)]);
			const theirs = new Map(b.map((x) => [x.name.toLowerCase(), x.plays]));
			shared = a
				.filter((x) => theirs.has(x.name.toLowerCase()))
				.map((x) => ({ name: x.name, mine: x.plays, theirs: theirs.get(x.name.toLowerCase()) ?? 0 }))
				.sort((x, y) => Math.min(y.mine, y.theirs) - Math.min(x.mine, x.theirs));
			const overlap = shared.reduce((s, x) => s + Math.min(x.mine, x.theirs), 0);
			const base = Math.min(a.reduce((s, x) => s + x.plays, 0), b.reduce((s, x) => s + x.plays, 0)) || 1;
			score = Math.min(100, Math.round((overlap / base) * 100));
			me = user;
			them = friend;
			status = '';
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

<PageHeader href="/compare" />
<form class="controls" onsubmit={(e) => { e.preventDefault(); compare(); }}>
	<label class="grow">Compare with
		<input bind:value={other} placeholder="Their Last.fm username" autocomplete="off" autocapitalize="off" spellcheck="false" />
	</label>
	<label>Period
		<select bind:value={period}>
			{#each PERIODS as p (p.value)}<option value={p.value}>{p.label}</option>{/each}
		</select>
	</label>
	<button class="primary" type="submit" disabled={busy}>{busy ? 'Comparing…' : 'Compare'}</button>
</form>
<div class="status" class:err={failed} class:busy={busy}>{status}</div>

{#if score === null && !busy && !failed}
	<div class="card empty">
		<div class="emoji">🎧</div>
		<b>See how well your ears match</b>
		<p class="muted">Enter a friend's username and we'll compare your top artists to find what you both love.</p>
	</div>
{/if}

{#if score !== null}
	<div class="card hero">
		<div class="who"><span class="av">{me.slice(0, 1).toUpperCase()}</span><span class="nm">{me}</span></div>
		<div class="mid">
			<div class="big">{score}%</div>
			<div class="verdict">{verdict}</div>
			<div class="muted sm">{shared.length} shared artist{shared.length === 1 ? '' : 's'}</div>
		</div>
		<div class="who"><span class="av alt">{them.slice(0, 1).toUpperCase()}</span><span class="nm">{them}</span></div>
	</div>

	{#if shared.length}
		<div class="card">
			<b>What you both love</b>
			<div class="chips top">
				{#each shared.slice(0, 12) as s (s.name)}<span class="chip">{s.name}</span>{/each}
			</div>
		</div>
		<div class="card">
			<b>Head to head</b>
			<div class="h2h">
				<div class="legend"><span><i class="dot a"></i>{me}</span><span>{them}<i class="dot b"></i></span></div>
				{#each shared.slice(0, 25) as s, i (s.name)}
					<div class="row">
						<span class="rank">{i + 1}</span>
						<span class="an" title={s.name}>{s.name}</span>
						<div class="bars">
							<div class="side l"><em>{fmt(s.mine)}</em><div class="fill a" style="width: {(s.mine / peak) * 100}%"></div></div>
							<div class="side r"><div class="fill b" style="width: {(s.theirs / peak) * 100}%"></div><em>{fmt(s.theirs)}</em></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="card empty">
			<div class="emoji">🫥</div>
			<b>No shared artists</b>
			<p class="muted">Try a longer period like "Overall" to find some overlap.</p>
		</div>
	{/if}
{/if}

<style>
	.grow { flex: 2 1 220px; }
	.grow input { width: 100%; }
	.empty { text-align: center; padding: 36px 20px; }
	.empty .emoji { font-size: 34px; margin-bottom: 6px; }
	.empty p { margin: 6px auto 0; max-width: 380px; }
	.hero { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; text-align: center; }
	.mid .verdict { font-family: var(--display); font-weight: 700; margin-top: 2px; }
	.sm { font-size: 12px; margin-top: 2px; }
	.who { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; }
	.av { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; font: 800 22px var(--display); color: #fff; background: var(--grad); box-shadow: 0 8px 24px rgba(255, 45, 85, 0.35); }
	.av.alt { background: linear-gradient(135deg, #5b8cff, #9b5cff); box-shadow: 0 8px 24px rgba(110, 100, 255, 0.35); }
	.nm { font-weight: 600; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.chips.top { margin-top: 12px; }
	.h2h { margin-top: 12px; display: grid; gap: 8px; }
	.legend { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
	.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin: 0 6px; }
	.dot.a, .fill.a { background: var(--grad); }
	.dot.b, .fill.b { background: linear-gradient(135deg, #5b8cff, #9b5cff); }
	.row { display: grid; grid-template-columns: 22px minmax(70px, 140px) 1fr; align-items: center; gap: 10px; }
	.rank { color: var(--muted); font-size: 12px; text-align: right; font-variant-numeric: tabular-nums; }
	.an { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
	.bars { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
	.side { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); }
	.side.l { justify-content: flex-end; }
	.side em { font-style: normal; font-variant-numeric: tabular-nums; min-width: 28px; }
	.side.l em { text-align: right; }
	.fill { height: 8px; border-radius: 6px; min-width: 3px; transition: width 0.5s ease; }
	@media (max-width: 560px) {
		.hero { grid-template-columns: 1fr; }
		.row { grid-template-columns: 18px 1fr; }
		.bars { grid-column: 1 / -1; }
	}
</style>
