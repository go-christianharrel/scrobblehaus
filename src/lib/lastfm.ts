import type { Profile } from './settings.svelte';
import { sleep } from './util';
import type {
	RawItem,
	RawRecent,
	RawRecentTrack,
	RawWrap,
	Scrobble,
	TopItem,
	TopType
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
