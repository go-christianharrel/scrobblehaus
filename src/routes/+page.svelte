<script lang="ts">
	import { onMount } from 'svelte';
	import { api, findImage, PLACEHOLDER } from '#lib/lastfm';
	import Icon from '#lib/Icon.svelte';
	import NowPlaying from '#lib/NowPlaying.svelte';
	import { settings } from '#lib/settings.svelte';
	import { TOOLS } from '#lib/tools';
	import { fmt } from '#lib/util';
	import type { RawRecent, RawRecentTrack } from '#lib/types';

	interface Recent {
		name: string;
		artist: string;
		art: string;
		live: boolean;
	}

	let recent = $state<Recent[]>([]);

	const hour = new Date().getHours();
	const greeting = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

	async function loadRecent(): Promise<void> {
		if (!settings.username) return;
		try {
			const data = await api<RawRecent>('user.getrecenttracks', { user: settings.username, limit: 12 });
			const tracks = ([] as RawRecentTrack[]).concat(data.recenttracks.track ?? []);
			recent = await Promise.all(
				tracks.map(async (t) => {
					const artist = t.artist['#text'];
					const img = (t.image ?? []).slice().reverse().find((i) => i['#text'] && !i['#text'].includes(PLACEHOLDER));
					return { name: t.name, artist, art: img ? img['#text'] : await findImage('tracks', t.name, artist), live: Boolean(t['@attr']?.nowplaying) };
				})
			);
		} catch {
			recent = [];
		}
	}

	onMount(loadRecent);
</script>

<section class="hero">
	{#if settings.username}
		<p class="eyebrow">{greeting}</p>
		<h1><span>{settings.profile?.name ?? settings.username}</span></h1>
		<p class="muted">Pick a tool — it runs straight away with your data.</p>
	{:else}
		<h1>Your Last.fm, <span>beautifully</span> used.</h1>
		<p class="muted">Type your Last.fm username in the sidebar, then pick a tool. No keys, no sign-in.</p>
	{/if}
</section>

{#if settings.profile}
	<div class="stats">
		<div class="stat"><b>{fmt(settings.profile.scrobbles)}</b><span class="muted">Scrobbles</span></div>
		<div class="stat"><b>{fmt(settings.profile.artists)}</b><span class="muted">Artists</span></div>
		<div class="stat"><b>{fmt(settings.profile.albums)}</b><span class="muted">Albums</span></div>
		<div class="stat"><b>{fmt(settings.profile.tracks)}</b><span class="muted">Tracks</span></div>
		<div class="stat"><b>{settings.profile.since}</b><span class="muted">Scrobbling since</span></div>
	</div>
{/if}

{#if settings.username}
	<h3>Now playing</h3>
	<NowPlaying />
{/if}

{#if recent.length}
	<h3>Recently played</h3>
	<div class="recent">
		{#each recent as r, i (i)}
			<div class="rec" title="{r.name} — {r.artist}">
				<div class="art">
					{#if r.art}<img src={r.art} alt="" loading="lazy" />{:else}<span class="ph"></span>{/if}
					{#if r.live}<span class="live">LIVE</span>{/if}
				</div>
				<b>{r.name}</b>
				<span class="muted">{r.artist}</span>
			</div>
		{/each}
	</div>
{/if}

<h3>Tools</h3>
<div class="tiles">
	{#each TOOLS as tool (tool.href)}
		<a class="tile" href={tool.href} style="--h: {tool.hue}">
			<span class="icon"><Icon name={tool.icon} size={24} /></span>
			<b>{tool.label}</b>
			<span class="muted">{tool.blurb}</span>
		</a>
	{/each}
</div>

<style>
	.hero { padding: 8px 0 24px; }
	.eyebrow { margin: 0 0 4px; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent2); }
	h1 { font-size: clamp(34px, 6vw, 60px); letter-spacing: -0.04em; line-height: 1.05; margin: 0 0 10px; }
	h1 span { background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
	p { margin: 0; max-width: 560px; }
	h3 { margin: 28px 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
	.recent { display: grid; grid-auto-flow: column; grid-auto-columns: 148px; gap: 16px; overflow-x: auto; padding-bottom: 10px; scroll-snap-type: x proximity; }
	.rec { display: flex; flex-direction: column; gap: 2px; scroll-snap-align: start; min-width: 0; }
	.rec b, .rec .muted { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
	.rec .muted { font-size: 12px; }
	.art { position: relative; width: 148px; height: 148px; border-radius: 14px; overflow: hidden; margin-bottom: 8px; background: var(--panel2); box-shadow: var(--shadow); transition: transform 0.2s; }
	.rec:hover .art { transform: translateY(-4px) scale(1.02); }
	.art img { width: 100%; height: 100%; object-fit: cover; display: block; }
	.ph { display: block; width: 100%; height: 100%; background: var(--grad-soft); }
	.live { position: absolute; top: 8px; left: 8px; background: var(--grad); font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 2px 8px; border-radius: 999px; }
	.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
	.tile { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 4px; background: var(--glass); backdrop-filter: blur(16px); border: 1px solid var(--line); border-radius: 20px; padding: 20px; text-decoration: none; color: var(--text); transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
	.tile::after { content: ''; position: absolute; inset: auto -30% -60% auto; width: 200px; height: 200px; background: radial-gradient(circle, hsl(var(--h) 90% 60% / 0.28), transparent 65%); transition: transform 0.4s; }
	.tile:hover { transform: translateY(-4px); border-color: hsl(var(--h) 90% 60% / 0.6); box-shadow: 0 18px 44px hsl(var(--h) 90% 50% / 0.2); }
	.tile:hover::after { transform: scale(1.4); }
	.icon { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 10px; color: #fff; background: linear-gradient(135deg, hsl(var(--h) 90% 60%), hsl(calc(var(--h) + 30) 90% 52%)); box-shadow: 0 8px 20px hsl(var(--h) 90% 55% / 0.4); }
	.tile b { font-family: var(--display); font-size: 17px; }
</style>
