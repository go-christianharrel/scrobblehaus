import { browser } from '$app/env';
import type { Scrobble } from './types';

const read = (key: string): string => {
	if (!browser) return '';
	try {
		return localStorage.getItem(key) ?? '';
	} catch {
		return '';
	}
};

const write = (key: string, value: string): void => {
	if (!browser) return;
	try {
		localStorage.setItem(key, value);
	} catch {
		// storage can be blocked; the app still works without it
	}
};

export type Profile = {
	name: string;
	realname: string;
	avatar: string;
	scrobbles: number;
	artists: number;
	albums: number;
	tracks: number;
	since: number;
};

const readProfile = (name: string): Profile | null => {
	try {
		const cached = JSON.parse(read('lfm_profile') || 'null') as Profile | null;
		return cached && cached.name.toLowerCase() === name.toLowerCase()
			? cached
			: null;
	} catch {
		return null;
	}
};

class Settings {
	username = $state(read('lfm_user'));
	/** Cached copy shows instantly on reload, then the layout refreshes it. */
	profile = $state<Profile | null>(readProfile(read('lfm_user')));
	/** True while the profile request is in flight. */
	profileLoading = $state(false);
	/** False on the server and during hydration, so saved-user UI never flashes the signed-out state. */
	ready = $state(false);
	/** False when the server has no LASTFM_API_KEY yet; only the site owner ever sees this. */
	serverKey = $state(true);

	save(): void {
		write('lfm_user', this.username.trim());
	}

	cacheProfile(profile: Profile | null): void {
		write('lfm_profile', profile ? JSON.stringify(profile) : '');
	}

	requireUser(): string {
		const user = this.username.trim();
		if (!user) throw new Error('Enter your Last.fm username first.');
		return user;
	}
}

export const settings = new Settings();

/** Scrobbles loaded by the Exporter or Insights, shared between pages. */
export const session = $state<{ scrobbles: Scrobble[] }>({ scrobbles: [] });
