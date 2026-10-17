<script lang="ts">
	import { onMount } from 'svelte';
	import { findImage, PLACEHOLDER } from '#lib/lastfm';
	import Icon from '#lib/Icon.svelte';
	import NowPlaying from '#lib/NowPlaying.svelte';
	import { recentFeed, watchRecent } from '#lib/recentFeed.svelte';
	import { settings } from '#lib/settings.svelte';
	import { TOOLS } from '#lib/tools';
	import { fmt } from '#lib/util';
	import type { RawRecentTrack } from '#lib/types';

	type Recent = {
		name: string;
		artist: string;
		art: string;
		live: boolean;
	};

	let recent = $state<Recent[]>([]);

	const hour = new Date().getHours();
	const greeting =
		hour < 5
			? 'Still up'
			: hour < 12
				? 'Good morning'
				: hour < 18
					? 'Good afternoon'
					: 'Good evening';

	const artOf = (t: RawRecentTrack): string =>
		(t.image ?? [])
			.slice()
			.reverse()
			.find((i) => i['#text'] && !i['#text'].includes(PLACEHOLDER))?.[
			'#text'
		] ?? '';

	onMount(watchRecent);

	// Show the list right away, then fill in missing artwork as it resolves.
	$effect(() => {
		const tracks = recentFeed.tracks;
		// Built from a plain array so this effect never reads state it writes.
		const list: Recent[] = tracks.map((t) => ({
			name: t.name,
			artist: t.artist['#text'],
			art: artOf(t),
			live: Boolean(t['@attr']?.nowplaying)
		}));
		recent = list;
		tracks.forEach((t, i) => {
			if (list[i].art) return;
			void findImage('tracks', t.name, t.artist['#text']).then((art) => {
				if (recent[i]?.name === t.name) recent[i].art = art;
			});
		});
	});
</script>

<section class="hero">
	{#if !settings.ready}
		<span class="skel line eyebrow-skel"></span>
		<span class="skel line title-skel"></span>
	{:else if settings.username}
		<p class="eyebrow">{greeting}</p>
		<h1><span>{settings.profile?.name ?? settings.username}</span></h1>
		<p class="muted">Pick a tool — it runs straight away with your data.</p>
	{:else}
		<h1>Your Last.fm, <span>beautifully</span> used.</h1>
		<p class="muted">
			Type your Last.fm username in the sidebar, then pick a tool. No keys, no
			sign-in.
		</p>
	{/if}
</section>

{#if settings.ready && settings.username && !settings.profile && settings.profileLoading}
	<div class="stats">
		{#each [0, 1, 2, 3, 4] as i (i)}<div class="stat">
				<span class="skel line big-skel"></span><span class="skel line w40"
				></span>
			</div>{/each}
	</div>
{:else if settings.ready && settings.profile}
	<div class="stats">
		<div class="stat">
			<b>{fmt(settings.profile.scrobbles)}</b><span class="muted"
				>Scrobbles</span
			>
		</div>
		<div class="stat">
			<b>{fmt(settings.profile.artists)}</b><span class="muted">Artists</span>
		</div>
		<div class="stat">
			<b>{fmt(settings.profile.albums)}</b><span class="muted">Albums</span>
		</div>
		<div class="stat">
			<b>{fmt(settings.profile.tracks)}</b><span class="muted">Tracks</span>
		</div>
		<div class="stat">
			<b>{settings.profile.since}</b><span class="muted">Scrobbling since</span>
		</div>
	</div>
{/if}

{#if settings.ready && settings.username}
	<h3>Now playing</h3>
	<NowPlaying />
{/if}

{#if recent.length}
	<h3>Recently played</h3>
	<div class="recent">
		{#each recent as r, i (i)}
			<div class="rec" title="{r.name} — {r.artist}">
				<div class="art">
					{#if r.art}<img src={r.art} alt="" loading="lazy" />{:else}<span
							class="ph"
						></span>{/if}
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
		<a
			class="tile"
			href={tool.href}
			title={tool.seoTitle.split(' | ')[0]}
			style="--h: {tool.hue}"
		>
			<span class="icon"><Icon name={tool.icon} size={24} /></span>
			<b>{tool.label}</b>
			<span class="muted">{tool.blurb}</span>
		</a>
	{/each}
</div>

<details class="about noprint">
	<summary>About Scrobblehaus</summary>
	<p class="muted">
		Scrobblehaus is a free set of Last.fm tools: make a Last.fm collage, see
		your top artists, albums and tracks, print a Last.fm receipt, check how
		mainstream your music taste is, explore your listening stats, compare with a
		friend and export your scrobbles to CSV or JSON. No login, just your
		username.
	</p>
</details>

<style>
	.about {
		margin-top: 40px;
		padding-top: 18px;
		border-top: 1px solid var(--line);
		font-size: 13px;
		color: var(--muted);
	}
	.about summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.about summary:hover {
		color: var(--text);
	}
	.about p {
		max-width: 860px;
		margin-top: 12px;
		line-height: 1.6;
	}
	.eyebrow-skel {
		width: 120px;
		height: 14px;
		display: block;
		margin: 4px 0 12px;
	}
	.title-skel {
		width: min(320px, 70%);
		height: 44px;
		display: block;
		border-radius: 12px;
	}
	.big-skel {
		width: 90px;
		height: 28px;
		display: block;
		margin-bottom: 8px;
		border-radius: 8px;
	}
	.w40 {
		width: 70px;
		display: block;
	}
	.hero {
		padding: 8px 0 24px;
	}
	.eyebrow {
		margin: 0 0 4px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent2);
	}
	h1 {
		font-size: clamp(34px, 6vw, 60px);
		letter-spacing: -0.04em;
		line-height: 1.05;
		margin: 0 0 10px;
	}
	h1 span {
		background: var(--grad);
		background-origin: border-box;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	p {
		margin: 0;
		max-width: 560px;
	}
	h3 {
		margin: 28px 0 14px;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
	}
	.recent {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 148px;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 10px;
		scroll-snap-type: x proximity;
	}
	.rec {
		display: flex;
		flex-direction: column;
		gap: 2px;
		scroll-snap-align: start;
		min-width: 0;
	}
	.rec b,
	.rec .muted {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 13px;
	}
	.rec .muted {
		font-size: 12px;
	}
	.art {
		position: relative;
		width: 148px;
		height: 148px;
		border-radius: 14px;
		overflow: hidden;
		margin-bottom: 8px;
		background: var(--panel2);
		box-shadow: var(--shadow);
		transition: transform 0.2s;
	}
	.rec:hover .art {
		transform: translateY(-4px) scale(1.02);
	}
	.art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.ph {
		display: block;
		width: 100%;
		height: 100%;
		background: var(--grad-soft);
	}
	.live {
		position: absolute;
		top: 8px;
		left: 8px;
		background: var(--grad);
		background-origin: border-box;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 2px 8px;
		border-radius: 999px;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;
	}
	.tile {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 4px;
		background: var(--glass);
		backdrop-filter: blur(16px);
		border: 1px solid var(--line);
		border-radius: 20px;
		padding: 20px;
		text-decoration: none;
		color: var(--text);
		transition:
			transform 0.2s,
			border-color 0.2s,
			box-shadow 0.2s;
	}
	.tile::after {
		content: '';
		position: absolute;
		inset: auto -30% -60% auto;
		width: 200px;
		height: 200px;
		background: radial-gradient(
			circle,
			hsl(var(--h) 90% 60% / 0.28),
			transparent 65%
		);
		transition: transform 0.4s;
	}
	.tile:hover {
		transform: translateY(-4px);
		border-color: hsl(var(--h) 90% 60% / 0.6);
		box-shadow: 0 18px 44px hsl(var(--h) 90% 50% / 0.2);
	}
	.tile:hover::after {
		transform: scale(1.4);
	}
	.icon {
		width: 46px;
		height: 46px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		margin-bottom: 10px;
		color: #fff;
		background: linear-gradient(
			135deg,
			hsl(var(--h) 90% 60%),
			hsl(calc(var(--h) + 30) 90% 52%)
		);
		box-shadow: 0 8px 20px hsl(var(--h) 90% 55% / 0.4);
	}
	.tile b {
		font-family: var(--display);
		font-size: 17px;
	}
</style>
