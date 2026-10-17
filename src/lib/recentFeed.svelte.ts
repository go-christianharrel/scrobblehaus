import { api } from './lastfm';
import { settings } from './settings.svelte';
import type { RawRecent, RawRecentTrack } from './types';

const POLL_MS = 8000;

/** One shared poll, so Now Playing and Recently played always agree. */
export const recentFeed = $state<{ tracks: RawRecentTrack[]; error: string }>({
	tracks: [],
	error: ''
});

let timer: ReturnType<typeof setInterval> | undefined;
let watchers = 0;

async function poll(): Promise<void> {
	if (!settings.username || document.hidden) return;
	try {
		const data = await api<RawRecent>('user.getrecenttracks', {
			user: settings.requireUser(),
			limit: 12
		});
		recentFeed.tracks = ([] as RawRecentTrack[]).concat(
			data.recenttracks.track ?? []
		);
		recentFeed.error = '';
	} catch (e) {
		recentFeed.error = e instanceof Error ? e.message : String(e);
	}
}

/** Starts polling while at least one component is watching; returns the stop function. */
export function watchRecent(): () => void {
	if (watchers++ === 0) {
		void poll();
		timer = setInterval(poll, POLL_MS);
	}
	return () => {
		if (--watchers === 0) clearInterval(timer);
	};
}
