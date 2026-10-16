import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface DeezerAlbum {
	cover_xl?: string;
	cover_big?: string;
}
interface DeezerHit extends DeezerAlbum {
	picture_xl?: string;
	picture_big?: string;
	album?: DeezerAlbum;
}
interface DeezerResponse {
	data?: DeezerHit[];
}
interface ItunesResponse {
	results?: { artworkUrl100?: string }[];
}

const BLANK_DEEZER = 'd41d8cd98f00b204e9800998ecf8427e';
const MAX_CACHE = 5000;
const cache = new Map<string, string>();

async function deezer(type: string, name: string, artist: string): Promise<string> {
	const base = 'https://api.deezer.com/search';
	let endpoint = `${base}/artist?limit=1&q=${encodeURIComponent(name)}`;
	if (type !== 'artists') {
		const field = type === 'tracks' ? 'track' : 'album';
		const q = `artist:"${artist}" ${field}:"${name}"`;
		endpoint = `${base}/${field}?limit=1&q=${encodeURIComponent(q)}`;
	}
	const res = await fetch(endpoint);
	const hit = ((await res.json()) as DeezerResponse).data?.[0];
	if (!hit) return '';
	const cover = hit.album ?? hit;
	return hit.picture_xl ?? hit.picture_big ?? cover.cover_xl ?? cover.cover_big ?? '';
}

async function itunes(type: string, name: string, artist: string): Promise<string> {
	const entity = type === 'tracks' ? 'song' : 'album';
	const term = encodeURIComponent(`${artist} ${name}`);
	const res = await fetch(`https://itunes.apple.com/search?limit=1&entity=${entity}&term=${term}`);
	const art = ((await res.json()) as ItunesResponse).results?.[0]?.artworkUrl100;
	return art ? art.replace('100x100', '600x600') : '';
}

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type') ?? 'albums';
	const name = url.searchParams.get('name') ?? '';
	const artist = url.searchParams.get('artist') ?? '';
	if (!name) return json({ url: '' });

	const key = `${type}|${name}|${artist}`;
	const cached = cache.get(key);
	if (cached !== undefined) return json({ url: cached });

	let found = '';
	try {
		found = await deezer(type, name, artist);
		if (!found && type !== 'artists') found = await itunes(type, name, artist);
	} catch {
		found = '';
	}
	if (found.includes(BLANK_DEEZER)) found = '';

	if (cache.size >= MAX_CACHE) cache.clear();
	cache.set(key, found);
	return json({ url: found });
};
