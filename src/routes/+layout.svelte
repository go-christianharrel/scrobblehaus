<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { api } from '#lib/lastfm';
	import Icon from '#lib/Icon.svelte';
	import { settings } from '#lib/settings.svelte';
	import { TOOLS } from '#lib/tools';
	import { fmt } from '#lib/util';
	import { tick } from 'svelte';
	import type { LayoutProps } from './$types';

	interface RawUser {
		user: {
			name: string;
			realname?: string;
			playcount: string;
			artist_count: string;
			album_count: string;
			track_count: string;
			registered: { unixtime: string };
			image?: { size: string; '#text': string }[];
		};
	}

	let { data, children }: LayoutProps = $props();
	let draft = $state(settings.username);
	let avatarOk = $state(true);
	let menuOpen = $state(false);
	let switching = $state(false);

	const HOME_SEO = {
		title: 'Scrobblehaus – Free Last.fm Tools: Collage, Charts, Receipt & Exporter',
		desc: 'Free Last.fm tools. Make album collages, top charts, listening receipts, taste and compatibility reports, and export your scrobbles to CSV or JSON. Just enter your username.'
	};
	const tool = $derived(TOOLS.find((t) => page.url.pathname.startsWith(t.href)));
	const seo = $derived(tool ? { title: tool.seoTitle, desc: tool.seoDesc } : HOME_SEO);
	const canonical = $derived(`${page.url.origin}${tool ? tool.href : '/'}`);
	const faqLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: (tool?.faq ?? []).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
		}).replace(/</g, '\\u003c')
	);
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: tool ? `Scrobblehaus ${tool.label}` : 'Scrobblehaus',
			url: canonical,
			description: seo.desc,
			applicationCategory: 'MultimediaApplication',
			operatingSystem: 'Any',
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
		}).replace(/</g, '\\u003c')
	);
	let nameInput = $state<HTMLInputElement>();
	const showForm = $derived(switching || !settings.username);

	async function toggleSwitch(): Promise<void> {
		switching = !switching;
		draft = settings.username;
		if (switching) {
			await tick();
			nameInput?.select();
		}
	}

	function toggleMenu(): void {
		menuOpen = !menuOpen;
		switching = menuOpen;
	}

	function closeMenu(): void {
		menuOpen = false;
		switching = false;
	}

	$effect(() => {
		settings.serverKey = data.serverKey;
	});

	$effect(() => {
		const name = settings.username.trim();
		if (!name || !data.serverKey) {
			settings.profile = null;
			return;
		}
		api<RawUser>('user.getinfo', { user: name })
			.then(({ user }) => {
				const img = (user.image ?? []).find((i) => i.size === 'extralarge') ?? (user.image ?? []).at(-1);
				settings.profile = {
					name: user.name,
					realname: user.realname ?? '',
					avatar: img?.['#text'] ?? '',
					scrobbles: Number(user.playcount),
					artists: Number(user.artist_count),
					albums: Number(user.album_count),
					tracks: Number(user.track_count),
					since: new Date(Number(user.registered.unixtime) * 1000).getFullYear()
				};
			})
			.catch(() => (settings.profile = null));
	});

	function apply(): void {
		const name = draft.trim();
		if (!name || name === settings.username) return;
		settings.username = name;
		settings.save();
		// Reload so the open tool re-runs for the new user.
		location.reload();
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<title>{seo.title}</title>
	<meta name="description" content={seo.desc} />
	<link rel="canonical" href={canonical} />
	<meta property="og:site_name" content="Scrobblehaus" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.desc} />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.desc} />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
	{#if tool}{@html `<script type="application/ld+json">${faqLd}</script>`}{/if}
</svelte:head>

<div class="shell">
	<aside class="noprint">
		<div class="top">
			<a class="logo" href="/">Scrobble<span>haus</span></a>
			<button class="menu" onclick={toggleMenu} aria-expanded={menuOpen} aria-label="Account">
				{#if settings.profile?.avatar && avatarOk}
					<img src={settings.profile.avatar} alt="" />
				{:else}
					<span>{(settings.username || '?').slice(0, 1).toUpperCase()}</span>
				{/if}
			</button>
		</div>

		<div class="account" class:open={menuOpen}>
		{#if settings.profile}
			<button type="button" class="me" onclick={toggleSwitch} aria-expanded={showForm} title="Switch user">
				{#if settings.profile.avatar && avatarOk}
					<img src={settings.profile.avatar} alt="" onerror={() => (avatarOk = false)} />
				{:else}
					<span class="fallback">{settings.profile.name.slice(0, 1).toUpperCase()}</span>
				{/if}
				<div>
					<b>{settings.profile.name}</b>
					<span class="muted">{fmt(settings.profile.scrobbles)} scrobbles</span>
				</div>
				<span class="chev" class:up={showForm} aria-hidden="true">⌄</span>
			</button>
		{/if}

		{#if showForm}
			<form onsubmit={(e) => { e.preventDefault(); apply(); }}>
				<label>
					{settings.username ? 'Switch to another user' : 'Last.fm username'}
					<input bind:this={nameInput} bind:value={draft} onkeydown={(e) => { if (e.key === 'Escape' && settings.username) closeMenu(); }} placeholder="Your Last.fm username" autocomplete="off" autocapitalize="off" spellcheck="false" />
				</label>
				<button class="primary" disabled={!draft.trim() || draft.trim() === settings.username}>
					{settings.username ? 'Switch user' : "Let's go"}
				</button>
			</form>
		{/if}
		</div>

		<nav onclick={closeMenu} role="presentation">
			<a href="/" class:active={page.url.pathname === '/'}><span class="ic"><Icon name="home" size={18} /></span>Home</a>
			<div class="label">Tools</div>
			{#each TOOLS as tool (tool.href)}
				<a href={tool.href} class:active={page.url.pathname.startsWith(tool.href)} style="--h: {tool.hue}">
					<span class="ic"><Icon name={tool.icon} size={18} /></span>{tool.label}
				</a>
			{/each}
		</nav>

		<p class="credit">Powered by Last.fm data</p>
	</aside>

	<main>
		{#if !data.serverKey}
			<div class="setup noprint">
				<b>Almost there — one-time owner setup.</b>
				Add your free Last.fm API key to <code>.env</code> as <code>LASTFM_API_KEY=…</code> and restart the server.
				Get one at <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener">last.fm/api/account/create</a>.
				Visitors are never asked for a key.
			</div>
		{/if}
		{#if !settings.username && page.url.pathname !== '/'}
			<div class="hint noprint">Type your Last.fm username in the sidebar to start.</div>
		{/if}
		{@render children()}
		{#if tool}
			<section class="about noprint">
				<h2>About {tool.label}</h2>
				<p class="muted">{tool.seoDesc}</p>
				{#each tool.faq as [q, a] (q)}
					<h3>{q}</h3>
					<p class="muted">{a}</p>
				{/each}
			</section>
		{/if}
	</main>
</div>

<style>
	.shell { display: grid; grid-template-columns: 276px 1fr; min-height: 100vh; }
	aside { position: sticky; top: 0; height: 100vh; overflow-y: auto; padding: 22px 16px; background: rgba(12, 14, 20, 0.72); backdrop-filter: blur(20px); border-right: 1px solid var(--line); display: flex; flex-direction: column; gap: 18px; }
	.logo { display: flex; align-items: center; gap: 0; font-family: var(--display); font-weight: 700; font-size: 17px; letter-spacing: -0.02em; color: var(--text); text-decoration: none; padding: 0 6px; }
	.logo span { background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
	.credit { margin: auto 6px 0; font-size: 12px; color: var(--muted); }
	.top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
	.account { display: flex; flex-direction: column; gap: 18px; }
	.menu { display: none; padding: 0; width: 38px; height: 38px; border-radius: 50%; overflow: hidden; place-items: center; background: var(--grad); border: 0; }
	.menu img { width: 100%; height: 100%; object-fit: cover; }
	.me { width: 100%; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 16px; background: var(--grad-soft); border: 1px solid rgba(255, 122, 89, 0.25); animation: rise 0.4s ease both; }
	.me img, .fallback { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; flex-shrink: 0; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15); }
	.fallback { display: grid; place-items: center; background: var(--grad); font-weight: 700; }
	.me:hover { border-color: rgba(255, 122, 89, 0.5); }
	.chev { margin-left: auto; color: var(--muted); font-size: 18px; line-height: 1; transition: transform 0.2s; }
	.chev.up { transform: rotate(180deg); }
	.me div { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
	.me b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.me span.muted { font-size: 12px; }
	form { display: flex; flex-direction: column; gap: 10px; }
	.label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); padding: 12px 10px 4px; }
	nav { display: flex; flex-direction: column; gap: 3px; }
	nav a { display: flex; align-items: center; gap: 12px; padding: 9px 10px; color: var(--muted); text-decoration: none; border-radius: 12px; font-weight: 500; transition: background 0.15s, color 0.15s, transform 0.15s; }
	nav a:hover { color: var(--text); background: var(--panel2); transform: translateX(2px); }
	nav a.active { color: var(--text); background: var(--panel2); box-shadow: inset 0 0 0 1px var(--line2); }
	.ic { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; background: var(--panel); color: var(--muted); transition: all 0.15s; }
	nav a.active .ic { color: #fff; background: linear-gradient(135deg, hsl(var(--h, 8) 90% 60%), hsl(calc(var(--h, 8) + 30) 90% 52%)); box-shadow: 0 6px 16px hsl(var(--h, 8) 90% 55% / 0.45); }
	main { padding: 28px 34px 64px; min-width: 0; max-width: 1240px; width: 100%; }
	.about { margin-top: 40px; padding-top: 22px; border-top: 1px solid var(--line); max-width: 680px; }
	.about h2 { font-size: 18px; margin: 0 0 6px; }
	.about h3 { font-size: 14px; margin: 16px 0 2px; }
	.about p { margin: 0; font-size: 14px; line-height: 1.55; }
	.setup { background: var(--grad-soft); border: 1px solid rgba(255, 122, 89, 0.4); padding: 14px 18px; border-radius: 14px; margin-bottom: 18px; }
	code { background: var(--panel2); padding: 1px 7px; border-radius: 6px; }
	@media (max-width: 860px) {
		.shell { grid-template-columns: minmax(0, 1fr); }
		aside { position: sticky; top: 0; z-index: 20; height: auto; overflow: visible; border-right: 0; border-bottom: 1px solid var(--line); gap: 10px; padding: 10px 14px; background: rgba(9, 11, 16, 0.88); }
		.menu { display: grid; }
		.account { display: none; padding: 4px 0 8px; }
		.account.open { display: flex; }
		nav { flex-direction: row; overflow-x: auto; gap: 6px; padding-bottom: 2px; scrollbar-width: none; }
		nav::-webkit-scrollbar { display: none; }
		nav a { white-space: nowrap; padding: 6px 12px 6px 6px; border: 1px solid var(--line); border-radius: 999px; flex-shrink: 0; }
		nav a:hover { transform: none; }
		.ic { width: 26px; height: 26px; border-radius: 50%; }
		.label { display: none; }
		main { padding: 18px 14px 48px; }
	}
	@media print { .shell { display: block; } main { padding: 0; max-width: none; } }
</style>
