import type { Profile } from './settings.svelte';
import { sleep } from './util';
import type {
	ArtistTrack,
	RawArtistTopTracks,
	RawItem,
	RawRecent,
	RawRecentTrack,
	RawTrackInfo,
	RawTrackScrobbles,
	RawWrap,
	Scrobble,
	TopItem,
	TopType,
	TrackDetails,
	TrackHistory
} from './types';

type RawUser = {
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
};

export async function getProfile(name: string): Promise<Profile> {
	const { user } = await api<RawUser>('user.getinfo', { user: name });
	const img =
		(user.image ?? []).find((i) => i.size === 'extralarge') ??
		(user.image ?? []).at(-1);
	return {
		name: user.name,
		realname: user.realname ?? '',
		avatar: img?.['#text'] ?? '',
		scrobbles: Number(user.playcount),
		artists: Number(user.artist_count),
		albums: Number(user.album_count),
		tracks: Number(user.track_count),
		since: new Date(Number(user.registered.unixtime) * 1000).getFullYear()
	};
}

export const PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f';

export async function api<T>(
	method: string,
	params: Record<string, string | number> = {}
): Promise<T> {
	const query = new URLSearchParams({ method });
	for (const [k, v] of Object.entries(params)) query.set(k, String(v));
	const res = await fetch(`/api/lastfm?${query}`);
	if (res.status === 401)
		throw new Error(
			'This site is not set up yet: the owner needs to add LASTFM_API_KEY on the server.'
		);
	const data = (await res.json()) as T & { error?: number; message?: string };
	if (data.error)
		throw new Error(data.message ?? `Last.fm error ${data.error}`);
	return data;
}

const SINGULAR: Record<TopType, string> = {
	albums: 'album',
	artists: 'artist',
	tracks: 'track'
};

function bestImage(images: RawItem['image']): string {
	const found = (images ?? [])
		.slice()
		.reverse()
		.find((i) => i['#text'] && !i['#text'].includes(PLACEHOLDER));
	return found ? found['#text'] : '';
}

export async function getTop(
	type: TopType,
	period: string,
	limit: number,
	user: string
): Promise<TopItem[]> {
	const out: TopItem[] = [];
	const perPage = Math.min(limit, 200);
	let page = 1;
	let totalPages = 1;
	while (out.length < limit && page <= totalPages) {
		const data = await api<Record<string, RawWrap>>(`user.gettop${type}`, {
			user,
			period,
			limit: perPage,
			page
		});
		const wrap = data[`top${type}`];
		totalPages = Number(wrap['@attr'].totalPages) || 1;
		const list = (wrap[SINGULAR[type]] as RawItem[] | undefined) ?? [];
		if (!list.length) break;
		for (const it of list) {
			out.push({
				name: it.name,
				artist:
					type === 'artists'
						? ''
						: (it.artist?.name ?? it.artist?.['#text'] ?? ''),
				plays: Number(it.playcount) || 0,
				dur: Number(it.duration) || 0,
				img: bestImage(it.image),
				url: it.url ?? ''
			});
		}
		page++;
	}
	return out.slice(0, limit);
}

type FetchOptions = {
	user: string;
	from?: number;
	to?: number;
	maxPages?: number;
	signal?: { aborted: boolean };
	onProgress?: (page: number, totalPages: number, total: number) => void;
};

export async function fetchScrobbles(opts: FetchOptions): Promise<Scrobble[]> {
	const { user, from, to, maxPages = Infinity, signal, onProgress } = opts;
	const out: Scrobble[] = [];
	let page = 1;
	let totalPages = 1;
	while (page <= totalPages && page <= maxPages && !signal?.aborted) {
		const params: Record<string, string | number> = { user, limit: 200, page };
		if (from) params.from = from;
		if (to) params.to = to;
		let data: RawRecent | undefined;
		for (let attempt = 0; !data; attempt++) {
			try {
				data = await api<RawRecent>('user.getrecenttracks', params);
			} catch (e) {
				if (attempt >= 3) throw e;
				await sleep(1500 * (attempt + 1));
			}
		}
		const rt = data.recenttracks;
		totalPages = Number(rt['@attr'].totalPages) || 1;
		const tracks: RawRecentTrack[] = ([] as RawRecentTrack[]).concat(
			rt.track ?? []
		);
		for (const t of tracks) {
			const uts = Number(t.date?.uts);
			if (t['@attr']?.nowplaying || !uts) continue;
			out.push({
				uts,
				artist: t.artist['#text'],
				album: t.album?.['#text'] ?? '',
				track: t.name,
				mbid: t.mbid ?? ''
			});
		}
		onProgress?.(
			page,
			Math.min(totalPages, maxPages),
			Number(rt['@attr'].total)
		);
		page++;
		await sleep(120);
	}
	return out;
}

const imageCache = new Map<string, string>();

export async function findImage(
	type: TopType,
	name: string,
	artist: string
): Promise<string> {
	const key = `${type}|${name}|${artist}`;
	const cached = imageCache.get(key);
	if (cached !== undefined) return cached;
	let url = '';
	try {
		const q = new URLSearchParams({ type, name, artist });
		const res = await fetch(`/api/image?${q}`);
		url = ((await res.json()) as { url: string }).url;
	} catch {
		url = '';
	}
	imageCache.set(key, url);
	return url;
}

/** Fills in missing artwork for items, a few lookups at a time. */
export async function fillImages(
	items: TopItem[],
	type: TopType,
	onProgress?: (done: number, total: number) => void
): Promise<void> {
	const todo = items.filter((i) => !i.img);
	let next = 0;
	let done = 0;
	const worker = async (): Promise<void> => {
		while (next < todo.length) {
			const item = todo[next++];
			item.img = await findImage(type, item.name, item.artist);
			onProgress?.(++done, todo.length);
		}
	};
	await Promise.all(Array.from({ length: 5 }, worker));
}

const DAY_SECONDS = 86400;

export async function getTrackDetails(
	artist: string,
	track: string,
	user: string
): Promise<TrackDetails> {
	const { track: t } = await api<RawTrackInfo>('track.getinfo', {
		artist,
		track,
		username: user
	});
	return {
		listeners: Number(t.listeners) || 0,
		plays: Number(t.playcount) || 0,
		mine: Number(t.userplaycount) || 0,
		loved: t.userloved === '1',
		durationMs: Number(t.duration) || 0,
		tags: (t.toptags?.tag ?? []).slice(0, 3).map((tag) => tag.name)
	};
}

async function getTrackScrobbleDates(
	artist: string,
	track: string,
	user: string,
	page: number
): Promise<{ uts: number[]; totalPages: number }> {
	const data = await api<RawTrackScrobbles>('user.gettrackscrobbles', {
		artist,
		track,
		user,
		limit: 200,
		page
	});
	const rows = ([] as { date?: { uts: string } }[]).concat(
		data.trackscrobbles.track ?? []
	);
	return {
		uts: rows.map((r) => Number(r.date?.uts)).filter(Boolean),
		totalPages: Number(data.trackscrobbles['@attr'].totalPages) || 1
	};
}

/** Newest page gives the recent counts, the last page gives the first play. */
export async function getTrackHistory(
	artist: string,
	track: string,
	user: string
): Promise<TrackHistory | null> {
	const latest = await getTrackScrobbleDates(artist, track, user, 1);
	if (!latest.uts.length) return null;
	const oldest =
		latest.totalPages > 1
			? await getTrackScrobbleDates(artist, track, user, latest.totalPages)
			: latest;
	const now = Date.now() / 1000;
	const since = (days: number): number =>
		latest.uts.filter((uts) => uts >= now - days * DAY_SECONDS).length;
	return {
		firstUts: Math.min(...oldest.uts),
		week: since(7),
		month: since(30)
	};
}

/** Other popular tracks by the artist, each with the user's own play count. */
export async function getArtistTracks(
	artist: string,
	exclude: string,
	user: string
): Promise<ArtistTrack[]> {
	const data = await api<RawArtistTopTracks>('artist.gettoptracks', {
		artist,
		limit: 6
	});
	// Drops edits of the current track too ("Song - Radio Edit").
	const base = (name: string): string => name.split(' - ')[0].toLowerCase();
	const names = (data.toptracks.track ?? [])
		.map((t) => t.name)
		.filter((name) => base(name) !== base(exclude))
		.slice(0, 3);
	return Promise.all(
		names.map(async (name): Promise<ArtistTrack> => {
			try {
				return { name, mine: (await getTrackDetails(artist, name, user)).mine };
			} catch {
				return { name, mine: 0 };
			}
		})
	);
}
