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

export interface Profile {
	name: string;
	realname: string;
	avatar: string;
	scrobbles: number;
	artists: number;
	albums: number;
	tracks: number;
	since: number;
}

class Settings {
	username = $state(read('lfm_user'));
	/** Loaded by the layout once a username is known. */
	profile = $state<Profile | null>(null);
	/** False when the server has no LASTFM_API_KEY yet; only the site owner ever sees this. */
	serverKey = $state(true);

	save(): void {
		write('lfm_user', this.username.trim());
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
