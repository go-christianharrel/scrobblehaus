<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { api, findImage, PLACEHOLDER } from './lastfm';
	import { settings } from './settings.svelte';
	import { fmt } from './util';
	import type { RawRecent, RawRecentTrack } from './types';

	interface Now {
		name: string;
		artist: string;
		album: string;
		art: string;
		live: boolean;
		when: string;
		mine: number;
	}

	let now = $state<Now | null>(null);
	let error = $state('');
	let timer: ReturnType<typeof setInterval> | undefined;
	let lastKey = '';

	async function refresh(): Promise<void> {
		if (!settings.username || document.hidden) return;
		try {
			const user = settings.requireUser();
			const data = await api<RawRecent>('user.getrecenttracks', { user, limit: 1 });
			const t: RawRecentTrack | undefined = ([] as RawRecentTrack[]).concat(data.recenttracks.track ?? [])[0];
			if (!t) {
				now = null;
				return;
			}
			const live = Boolean(t['@attr']?.nowplaying);
			const key = `${t.name}|${t.artist['#text']}|${live}`;
			error = '';
			// Same track as last poll: nothing to refetch, avoids image/plays lookups every 15s.
			if (key === lastKey && now) return;
			lastKey = key;

			const artist = t.artist['#text'];
			const lfmArt = (t.image ?? []).slice().reverse().find((i) => i['#text'] && !i['#text'].includes(PLACEHOLDER));
			const art = lfmArt ? lfmArt['#text'] : await findImage('tracks', t.name, artist);
			let mine = 0;
			try {
				const info = await api<{ track: { userplaycount?: string } }>('track.getinfo', { artist, track: t.name, username: user });
				mine = Number(info.track.userplaycount) || 0;
			} catch {
				mine = 0;
			}
			now = {
				name: t.name,
				artist,
				album: t.album?.['#text'] ?? '',
				art,
				live,
				when: !live && t.date ? new Date(Number(t.date.uts) * 1000).toLocaleString() : '',
				mine
			};
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	onMount(() => {
		void refresh();
		timer = setInterval(refresh, 15000);
	});
	onDestroy(() => clearInterval(timer));
</script>

{#if error}
	<div class="status err">{error}</div>
{:else if now}
	<div class="stage" style={now.art ? `--art: url('${now.art}')` : ''}>
		<div class="bg"></div>
		<div class="inner">
			{#if now.art}<img src={now.art} alt="" />{:else}<div class="ph"></div>{/if}
			<div class="meta">
				<span class="badge" class:off={!now.live}>
					{#if now.live}<span class="eq"><i></i><i></i><i></i><i></i></span> Now playing{:else}Last played {now.when}{/if}
				</span>
				<h2>{now.name}</h2>
				<div class="artist">{now.artist}</div>
				<div class="muted">{now.album}</div>
				{#if now.mine}<p class="plays"><b>{fmt(now.mine)}</b> plays by you</p>{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.stage { position: relative; overflow: hidden; border-radius: 26px; border: 1px solid var(--line); box-shadow: var(--shadow); animation: rise 0.5s ease both; margin-bottom: 8px; }
	.bg { position: absolute; inset: -40px; background: var(--art, var(--grad-soft)) center / cover; filter: blur(50px) saturate(1.5); opacity: 0.55; }
	.stage::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7, 8, 12, 0.2), rgba(7, 8, 12, 0.75)); }
	.inner { position: relative; z-index: 1; display: flex; gap: 28px; align-items: center; flex-wrap: wrap; padding: 28px; }
	img, .ph { width: 220px; height: 220px; border-radius: 18px; object-fit: cover; background: var(--panel2); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6); }
	.meta { min-width: 200px; flex: 1; }
	h2 { font-size: clamp(24px, 3.4vw, 40px); line-height: 1.08; margin: 12px 0 6px; }
	.artist { font-size: 18px; font-weight: 500; }
	.plays { margin: 14px 0 0; color: var(--muted); }
	.plays b { color: var(--text); font-family: var(--display); font-size: 22px; }
	.badge { display: inline-flex; align-items: center; gap: 8px; background: var(--grad); border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
	.badge.off { background: rgba(255, 255, 255, 0.1); color: var(--muted); }
	.eq { display: inline-flex; align-items: end; gap: 2px; height: 12px; }
	.eq i { width: 3px; background: #fff; border-radius: 2px; animation: eq 0.9s ease-in-out infinite alternate; }
	.eq i:nth-child(1) { animation-delay: -0.2s; }
	.eq i:nth-child(2) { animation-delay: -0.5s; }
	.eq i:nth-child(3) { animation-delay: -0.1s; }
	.eq i:nth-child(4) { animation-delay: -0.7s; }
	@keyframes eq { from { height: 3px; } to { height: 12px; } }
	@media (max-width: 640px) { .inner { padding: 18px; gap: 18px; } img, .ph { width: 100%; height: auto; aspect-ratio: 1; } }
</style>
