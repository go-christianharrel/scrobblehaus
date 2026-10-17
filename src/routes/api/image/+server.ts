import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type DeezerAlbum = {
	cover_xl?: string;
	cover_big?: string;
};
type DeezerHit = DeezerAlbum & {
	name?: string;
	picture_xl?: string;
	picture_big?: string;
	album?: DeezerAlbum;
};
type DeezerResponse = {
	data?: DeezerHit[];
};
type ItunesResponse = {
	results?: { artworkUrl100?: string }[];
};

const BLANK_DEEZER = 'd41d8cd98f00b204e9800998ecf8427e';
const MAX_CACHE = 5000;
const cache = new Map<string, string>();

type ItunesAlbumResponse = {
	results?: { artistName?: string; artworkUrl100?: string }[];
};

/** Deezer redirects to a shared grey silhouette when it has no picture. */
async function hasPicture(url: string): Promise<boolean> {
	if (!url || url.includes(BLANK_DEEZER)) return false;
	const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
	return res.status === 200 && res.headers.get('content-length') !== '0';
}

async function deezer(
	type: string,
	name: string,
	artist: string
): Promise<string> {
	const base = 'https://api.deezer.com/search';
	let endpoint = `${base}/artist?limit=5&q=${encodeURIComponent(name)}`;
	if (type !== 'artists') {
		const field = type === 'tracks' ? 'track' : 'album';
		const q = `artist:"${artist}" ${field}:"${name}"`;
		endpoint = `${base}/${field}?limit=1&q=${encodeURIComponent(q)}`;
	}
	const res = await fetch(endpoint);
	const hits = ((await res.json()) as DeezerResponse).data ?? [];
	for (const hit of hits.slice(0, type === 'artists' ? 5 : 1)) {
		if (type === 'artists' && hit.name?.toLowerCase() !== name.toLowerCase())
			continue;
		const cover = hit.album ?? hit;
		const picture =
			hit.picture_xl ??
			hit.picture_big ??
			cover.cover_xl ??
			cover.cover_big ??
			'';
		if (await hasPicture(picture)) return picture;
	}
	return '';
}

/** Cover of one of the artist's albums, for artists with no picture. */
async function itunesArtistAlbum(name: string): Promise<string> {
	const term = encodeURIComponent(name);
	const res = await fetch(
		`https://itunes.apple.com/search?limit=5&entity=album&attribute=artistTerm&term=${term}`
	);
	const hits = ((await res.json()) as ItunesAlbumResponse).results ?? [];
	const art = hits.find(
		(h) => h.artistName?.toLowerCase() === name.toLowerCase()
	)?.artworkUrl100;
	return art ? art.replace('100x100', '600x600') : '';
}

async function itunes(
	type: string,
	name: string,
	artist: string
): Promise<string> {
	const entity = type === 'tracks' ? 'song' : 'album';
	const term = encodeURIComponent(`${artist} ${name}`);
	const res = await fetch(
		`https://itunes.apple.com/search?limit=1&entity=${entity}&term=${term}`
	);
	const art = ((await res.json()) as ItunesResponse).results?.[0]
		?.artworkUrl100;
	return art ? art.replace('100x100', '600x600') : '';
}

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type') ?? 'albums';
	const name = url.searchParams.get('name') ?? '';
	const artist = url.searchParams.get('artist') ?? '';
	if (!name) return json({ url: '' });

	const fallback = url.searchParams.get('fallback') === '1';
	const key = `${type}|${name}|${artist}|${fallback}`;
	const cached = cache.get(key);
	if (cached !== undefined) return json({ url: cached });

	let found = '';
	try {
		if (fallback && type === 'artists') found = await itunesArtistAlbum(name);
		else found = await deezer(type, name, artist);
		if (!found && type !== 'artists') found = await itunes(type, name, artist);
	} catch {
		found = '';
	}
	if (found.includes(BLANK_DEEZER)) found = '';

	if (cache.size >= MAX_CACHE) cache.clear();
	cache.set(key, found);
	return json({ url: found });
};
