<script lang="ts">
	import PageHeader from '#lib/PageHeader.svelte';
	import { onMount } from 'svelte';
	import { api, getTop } from '#lib/lastfm';
	import { bestPerCategory, buildVibe, describeVibe, matchCharacters, musicType, type Match, type MusicType, type Tag } from '#lib/persona';
	import { settings } from '#lib/settings.svelte';
	import { PERIODS } from '#lib/types';
	import { clamp, fmt, hashHue } from '#lib/util';

	type Result = {
		user: string;
		score: number;
		verdict: string;
		tags: Tag[];
		deep: { name: string; listeners: number; plays: number }[];
		traits: string[];
		type: MusicType;
		top: Match[];
		categories: Match[];
	};

	let period = $state('overall');
	let count = $state(50);
	let status = $state('');
	let failed = $state(false);
	let busy = $state(false);
	let result = $state<Result | null>(null);

	const maxTag = $derived(Math.max(1, ...(result?.tags ?? []).map((t) => t.count)));

	async function analyse(): Promise<void> {
		busy = true;
		failed = false;
		try {
			const user = settings.requireUser();
			status = 'Fetching tags and artists…';
			const [tagData, artists] = await Promise.all([
				api<{ toptags: { tag?: { name: string; count: string }[] } }>('user.gettoptags', { user, limit: 60 }),
				getTop('artists', period, clamp(count, 10, 100), user)
			]);
			const ownTags: Tag[] = (tagData.toptags.tag ?? []).map((t) => ({ name: t.name, count: Number(t.count) || 0 }));

			const info: { name: string; plays: number; listeners: number; tags: string[] }[] = [];
			let next = 0;
			const worker = async (): Promise<void> => {
				while (next < artists.length) {
					const a = artists[next++];
					try {
						const r = await api<{ artist: { stats: { listeners: string }; tags?: { tag?: { name: string }[] } } }>('artist.getinfo', { artist: a.name });
						info.push({ name: a.name, plays: a.plays, listeners: Number(r.artist.stats.listeners) || 0, tags: (r.artist.tags?.tag ?? []).map((t) => t.name.toLowerCase()) });
					} catch {
						// skip artists Last.fm cannot resolve
					}
					status = `Scanning artists… ${info.length}/${artists.length}`;
				}
			};
			await Promise.all(Array.from({ length: 5 }, worker));
			if (!info.length) throw new Error("Couldn't get any artist data.");

			const scale = (l: number): number => Math.min(1, Math.max(0, (Math.log10(Math.max(l, 1)) - 4) / 3));
			const weight = info.reduce((a, x) => a + x.plays, 0) || 1;
			const score = Math.round((info.reduce((a, x) => a + scale(x.listeners) * x.plays, 0) / weight) * 100);
			// Most listeners have no personal tags, so derive genre tags from their top artists, weighted by plays.
			const weights = new Map<string, number>();
			for (const x of info) for (const t of x.tags) weights.set(t, (weights.get(t) ?? 0) + x.plays);
			const top = Math.max(1, ...weights.values());
			const artistTags: Tag[] = [...weights.entries()]
				.sort((a, b) => b[1] - a[1])
				.slice(0, 40)
				.map(([name, w]) => ({ name, count: Math.round((w / top) * 100) }));
			const tags = ownTags.length >= 10 ? ownTags : artistTags;
			const vibe = buildVibe(tags, score);

			result = {
				user,
				score,
				verdict: score >= 70 ? 'Mainstream' : score >= 40 ? 'Balanced' : 'Underground',
				tags,
				deep: info.slice().sort((a, b) => a.listeners - b.listeners).slice(0, 15),
				traits: describeVibe(vibe),
				type: musicType(vibe),
				top: matchCharacters(vibe, 5),
				categories: bestPerCategory(vibe)
			};
			status = '';
		} catch (e) {
			failed = true;
			status = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	onMount(() => {
		if (settings.username) void analyse();
	});
</script>

<PageHeader href="/taste" />
<div class="controls">
	<label>Period
		<select bind:value={period}>
			{#each PERIODS as p (p.value)}<option value={p.value}>{p.label}</option>{/each}
		</select>
	</label>
	<label>Artists to scan <input type="number" min="10" max="100" bind:value={count} style="width: 80px" /></label>
	<button class="primary" onclick={analyse} disabled={busy}>Analyse taste</button>
	<button onclick={() => window.print()} disabled={!result}>Print</button>
</div>
<div class="status" class:err={failed} class:busy={busy}>{status}</div>

{#if result}
	<div class="printtitle">{result.user} — Taste profile</div>

	<div class="card type">
		<div class="type-head">
			<div class="code">
				{#each result.type.code.split('') as letter, i (i)}<span>{letter}</span>{/each}
			</div>
			<div>
				<div class="eyebrow">Your music type</div>
				<h2>{result.type.name}</h2>
				<p class="muted">{result.type.tagline}</p>
			</div>
		</div>
		<div class="axes">
			{#each result.type.axes as a (a.left)}
				<div class="axis-row">
					<span class:win={a.value < 0.5}>{a.left}</span>
					<div class="track"><i style="left: calc({(a.value * 100).toFixed(0)}% - 7px)"></i></div>
					<span class:win={a.value >= 0.5}>{a.right}</span>
					<em>{a.percent}%</em>
				</div>
			{/each}
		</div>
	</div>

	<div class="card">
		<b>Character match</b>
		<div class="muted">Your vibe: {result.traits.join(' • ')}. Just for fun, based on your tags and mainstream score.</div>
		<div class="chars">
			{#each result.categories as m (m.character.name)}
				<div class="char">
					<span class="cat">{m.character.category === 'Anime' ? '🌸' : m.character.category === 'Movie' ? '🎬' : '⭐'} {m.character.category}</span>
					<div class="pct">{m.percent}%</div>
					<b>{m.character.name}</b>
					{#if m.character.category !== 'Real life' && m.character.from !== m.character.name}<span class="muted">{m.character.from}</span>{/if}
					<p>{m.character.blurb}</p>
				</div>
			{/each}
		</div>
		<table>
			<tbody>
				{#each result.top as m (m.character.name)}
					<tr>
						<td>{m.character.name} <span class="muted">({m.character.from})</span></td>
						<td class="num">{m.percent}%</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="card">
		<div class="big">{result.score}/100 — {result.verdict}</div>
		<div class="muted">Mainstream factor (weighted by plays and global listeners).</div>
		<div class="pill"><i style="left: calc({result.score}% - 2px)"></i></div>
		<div class="axis"><span style="text-align: left">Underground</span><span style="text-align: right">Mainstream</span></div>
	</div>

	<div class="card">
		<b>Genre / tag cloud</b>
		<div class="cloud">
			{#each result.tags as t (t.name)}
				<span style="font-size: {(12 + (t.count / maxTag) * 30).toFixed(0)}px; color: hsl({hashHue(t.name)}, 65%, 65%)">{t.name}</span>
			{:else}
				<span class="muted">No tags.</span>
			{/each}
		</div>
	</div>

	<div class="card">
		<b>Iceberg — your deepest cuts</b>
		<div class="muted">The least-known artists in your top list, deepest first.</div>
		<table>
			<tbody>
				{#each result.deep as x (x.name)}
					<tr><td>{x.name}</td><td class="num">{fmt(x.listeners)} listeners</td><td class="num">{fmt(x.plays)} plays</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.type { background: linear-gradient(135deg, rgba(255, 45, 85, 0.16), rgba(120, 80, 255, 0.14)), var(--glass); }
	.type-head { display: flex; gap: 22px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
	.code { display: flex; gap: 8px; }
	.code span { width: 56px; height: 72px; display: grid; place-items: center; border-radius: 16px; font-family: var(--display); font-size: 38px; font-weight: 800; color: #fff; background: var(--grad); box-shadow: 0 10px 28px rgba(255, 45, 85, 0.35); }
	.code span:nth-child(2) { background: linear-gradient(135deg, #7c5cff, #c04bff); box-shadow: 0 10px 28px rgba(124, 92, 255, 0.4); }
	.code span:nth-child(3) { background: linear-gradient(135deg, #16c5a0, #2f9cff); box-shadow: 0 10px 28px rgba(22, 197, 160, 0.35); }
	.code span:nth-child(4) { background: linear-gradient(135deg, #ffb020, #ff6a3d); box-shadow: 0 10px 28px rgba(255, 176, 32, 0.35); }
	.eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent2); }
	.type-head h2 { margin: 2px 0 4px; font-size: 30px; }
	.type-head p { margin: 0; }
	.axes { display: grid; gap: 12px; }
	.axis-row { display: grid; grid-template-columns: 96px 1fr 96px 44px; gap: 12px; align-items: center; font-size: 13px; color: var(--muted); }
	.axis-row span:nth-child(3) { text-align: left; }
	.axis-row span:first-child { text-align: right; }
	.axis-row .win { color: var(--text); font-weight: 600; }
	.axis-row em { font-style: normal; font-variant-numeric: tabular-nums; color: var(--accent2); font-weight: 600; text-align: right; }
	.track { position: relative; height: 8px; border-radius: 6px; background: var(--panel2); }
	.track i { position: absolute; top: -4px; width: 14px; height: 16px; border-radius: 6px; background: var(--grad); box-shadow: 0 0 12px rgba(255, 90, 77, 0.7); }
	@media (max-width: 640px) {
		.axis-row { grid-template-columns: 1fr 1fr; grid-template-areas: 'l r' 't t' 'p p'; row-gap: 6px; }
		.axis-row span:first-child { grid-area: l; text-align: left; }
		.axis-row span:nth-child(3) { grid-area: r; text-align: right; }
		.axis-row .track { grid-area: t; }
		.axis-row em { grid-area: p; text-align: left; }
		.code span { width: 44px; height: 58px; font-size: 30px; }
	}
	.chars { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 14px 0; }
	.char { position: relative; overflow: hidden; background: var(--grad-soft); border: 1px solid rgba(255, 122, 89, 0.28); border-radius: 18px; padding: 18px; transition: transform 0.2s; }
	.char:hover { transform: translateY(-3px); }
	.char p { margin: 8px 0 0; }
	.cat { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent2); }
	.pct { font-family: var(--display); font-size: 46px; font-weight: 800; letter-spacing: -0.04em; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1.1; }
	.cloud { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: baseline; justify-content: center; line-height: 1.1; margin-top: 12px; }
	.pill { height: 10px; border-radius: 5px; background: linear-gradient(90deg, #3ecf8e, #f5c542, #ff4d42); position: relative; margin: 14px 0 6px; }
	.pill i { position: absolute; top: -5px; width: 4px; height: 20px; background: #fff; border-radius: 2px; }
	.axis { display: flex; font-size: 11px; color: var(--muted); }
	.axis span { flex: 1; }
	@media print { .pct { color: #000; background: none; } .cloud span { color: #000 !important; } .char { background: #fff; border: 1px solid #ccc; } }
</style>
