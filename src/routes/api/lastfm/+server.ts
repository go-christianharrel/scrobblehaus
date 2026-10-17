import { error, json } from '@sveltejs/kit';
import { LASTFM_API_KEY } from '$app/env/private';
import type { RequestHandler } from './$types';

const API = 'https://ws.audioscrobbler.com/2.0/';
const ALLOWED = new Set([
	'user.getinfo',
	'user.getrecenttracks',
	'user.gettopalbums',
	'user.gettopartists',
	'user.gettoptracks',
	'user.gettoptags',
	'user.getlovedtracks',
	'artist.getinfo',
	'artist.gettoptracks',
	'track.getinfo',
	'user.gettrackscrobbles'
]);
const CACHE_MS = 5 * 60 * 1000;
const MAX_CACHE = 2000;

const cache = new Map<string, { at: number; body: unknown }>();

export const GET: RequestHandler = async ({ url }) => {
	const method = (url.searchParams.get('method') ?? '').toLowerCase();
	if (!ALLOWED.has(method)) error(400, 'Method not allowed');

	// The key only ever lives on the server, so visitors never see or enter it.
	if (!LASTFM_API_KEY) error(401, 'No Last.fm API key configured');

	const params = new URLSearchParams(url.searchParams);
	params.set('method', method);
	params.set('format', 'json');
	params.delete('api_key');

	// Recent tracks power the live "now playing" view, so they are never cached.
	const cacheable = method !== 'user.getrecenttracks';
	const cacheKey = params.toString();
	const hit = cache.get(cacheKey);
	if (cacheable && hit && Date.now() - hit.at < CACHE_MS) return json(hit.body);

	params.set('api_key', LASTFM_API_KEY);
	const res = await fetch(`${API}?${params}`);
	const body: unknown = await res.json();

	const isError = typeof body === 'object' && body !== null && 'error' in body;
	if (cacheable && !isError) {
		if (cache.size >= MAX_CACHE) cache.clear();
		cache.set(cacheKey, { at: Date.now(), body });
	}
	return json(body);
};
