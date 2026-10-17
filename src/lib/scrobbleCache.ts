import { fetchScrobbles, type FetchOptions } from './lastfm';
import type { Scrobble } from './types';

const DB_NAME = 'scrobblehaus';
const STORE = 'scrobbles';
const PAGE_SIZE = 200;

const keyOf = (s: Scrobble): string => `${s.uts}|${s.artist}|${s.track}`;

/** Fresh rows are newer, so only the overlap at the boundary needs dropping. */
export function mergeScrobbles(
	fresh: Scrobble[],
	cached: Scrobble[]
): Scrobble[] {
	const seen = new Set(fresh.map(keyOf));
	return [...fresh, ...cached.filter((s) => !seen.has(keyOf(s)))];
}

export function inRange(rows: Scrobble[], from = 0, to = 0): Scrobble[] {
	return rows.filter((s) => s.uts >= from && (!to || s.uts <= to));
}

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => req.result.createObjectStore(STORE);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function readCache(user: string): Promise<Scrobble[] | null> {
	try {
		const db = await openDb();
		return await new Promise((resolve, reject) => {
			const req = db
				.transaction(STORE)
				.objectStore(STORE)
				.get(user.toLowerCase());
			req.onsuccess = () => resolve((req.result as Scrobble[]) ?? null);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return null;
	}
}

async function writeCache(user: string, rows: Scrobble[]): Promise<void> {
	try {
		const db = await openDb();
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE, 'readwrite');
			tx.objectStore(STORE).put(rows, user.toLowerCase());
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch {
		// Storage can be blocked (private mode, quota); the cache is optional.
	}
}

/**
 * Same as fetchScrobbles, but full-history fetches are saved in the browser
 * and later runs only fetch what is newer than the newest saved scrobble.
 */
export async function loadScrobbles(opts: FetchOptions): Promise<Scrobble[]> {
	const { user, from = 0, to = 0, maxPages = Infinity, signal } = opts;
	const cached = await readCache(user);

	if (!cached?.length) {
		const rows = await fetchScrobbles(opts);
		const isFullHistory = !from && !to && maxPages === Infinity;
		if (isFullHistory && !signal?.aborted) await writeCache(user, rows);
		return rows;
	}

	const fresh = await fetchScrobbles({
		user,
		signal,
		onProgress: opts.onProgress,
		from: cached[0].uts
	});
	const merged = mergeScrobbles(fresh, cached);
	// An aborted sync may have gaps, so it must not become the new cache.
	if (!signal?.aborted) await writeCache(user, merged);
	const rows = inRange(merged, from, to);
	return maxPages === Infinity ? rows : rows.slice(0, maxPages * PAGE_SIZE);
}
