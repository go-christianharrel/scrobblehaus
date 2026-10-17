import { browser } from '$app/env';
import type { TopType } from './types';

export type ExportRecord = {
	id: string;
	user: string;
	label: string;
	/** Everything needed to run the same export again. */
	job:
		| { kind: 'scrobbles'; format: 'csv' | 'json'; from: string; to: string }
		| { kind: 'loved' }
		| { kind: 'top'; type: TopType };
	count: number;
	at: number;
};

const STORAGE_KEY = 'lfm_exports';
const MAX_RECORDS = 20;

function load(): ExportRecord[] {
	if (!browser) return [];
	try {
		const parsed: unknown = JSON.parse(
			localStorage.getItem(STORAGE_KEY) ?? '[]'
		);
		return Array.isArray(parsed) ? (parsed as ExportRecord[]) : [];
	} catch {
		return [];
	}
}

function save(records: ExportRecord[]): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
	} catch {
		// Private mode: the list just won't persist.
	}
}

/** The same user running the same export replaces the old entry, never stacks. */
export const recordKey = (r: Pick<ExportRecord, 'user' | 'job'>): string =>
	`${r.user.toLowerCase()}|${JSON.stringify(r.job)}`;

/** Only metadata is kept; files are rebuilt on demand, so nothing big is stored. */
export const exportHistory = $state<{ records: ExportRecord[] }>({
	records: load()
});

export function recordExport(entry: Omit<ExportRecord, 'id' | 'at'>): void {
	const key = recordKey(entry);
	const rest = exportHistory.records.filter((r) => recordKey(r) !== key);
	exportHistory.records = [
		{ ...entry, id: crypto.randomUUID(), at: Date.now() },
		...rest
	].slice(0, MAX_RECORDS);
	save(exportHistory.records);
}

export function removeExport(id: string): void {
	exportHistory.records = exportHistory.records.filter((r) => r.id !== id);
	save(exportHistory.records);
}

export function clearExports(user: string): void {
	exportHistory.records = exportHistory.records.filter(
		(r) => r.user.toLowerCase() !== user.toLowerCase()
	);
	save(exportHistory.records);
}
