export type TopType = 'albums' | 'artists' | 'tracks';

export interface Period {
	value: string;
	label: string;
}

export const PERIODS: Period[] = [
	{ value: '7day', label: 'Last 7 days' },
	{ value: '1month', label: 'Last month' },
	{ value: '3month', label: 'Last 3 months' },
	{ value: '6month', label: 'Last 6 months' },
	{ value: '12month', label: 'Last year' },
	{ value: 'overall', label: 'All time' }
];

export const periodLabel = (value: string): string =>
	PERIODS.find((p) => p.value === value)?.label ?? value;

export interface TopItem {
	name: string;
	artist: string;
	plays: number;
	dur: number;
	img: string;
	url: string;
}

export interface Scrobble {
	uts: number;
	artist: string;
	album: string;
	track: string;
	mbid: string;
}

export interface RawImage {
	'#text': string;
}

export interface RawItem {
	name: string;
	playcount: string;
	duration?: string;
	url?: string;
	image?: RawImage[];
	artist?: { name?: string; '#text'?: string };
}

export interface RawWrap {
	'@attr': { totalPages: string; total: string };
	[key: string]: unknown;
}

export interface RawRecentTrack {
	name: string;
	mbid?: string;
	artist: { '#text': string };
	album?: { '#text': string };
	image?: RawImage[];
	date?: { uts: string };
	'@attr'?: { nowplaying?: string };
}

export interface RawRecent {
	recenttracks: {
		track?: RawRecentTrack | RawRecentTrack[];
		'@attr': { totalPages: string; total: string };
	};
}
