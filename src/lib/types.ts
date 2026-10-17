export type TopType = 'albums' | 'artists' | 'tracks';

export const TOP_TYPE_OPTIONS: { value: TopType; label: string }[] = [
	{ value: 'artists', label: 'Artists' },
	{ value: 'albums', label: 'Albums' },
	{ value: 'tracks', label: 'Tracks' }
];

export type Period = {
	value: string;
	label: string;
};

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

export type TopItem = {
	name: string;
	artist: string;
	plays: number;
	dur: number;
	img: string;
	url: string;
};

export type Scrobble = {
	uts: number;
	artist: string;
	album: string;
	track: string;
	mbid: string;
};

export type RawImage = {
	'#text': string;
};

export type RawItem = {
	name: string;
	playcount: string;
	duration?: string;
	url?: string;
	image?: RawImage[];
	artist?: { name?: string; '#text'?: string };
};

export type RawWrap = {
	'@attr': { totalPages: string; total: string };
	[key: string]: unknown;
};

export type RawRecentTrack = {
	name: string;
	mbid?: string;
	artist: { '#text': string };
	album?: { '#text': string };
	image?: RawImage[];
	date?: { uts: string };
	'@attr'?: { nowplaying?: string };
};

export type RawRecent = {
	recenttracks: {
		track?: RawRecentTrack | RawRecentTrack[];
		'@attr': { totalPages: string; total: string };
	};
};

export type TrackDetails = {
	listeners: number;
	plays: number;
	mine: number;
	loved: boolean;
	durationMs: number;
	tags: string[];
};

export type TrackHistory = {
	firstUts: number;
	week: number;
	month: number;
};

export type ArtistTrack = {
	name: string;
	mine: number;
};

export type RawTrackInfo = {
	track: {
		listeners?: string;
		playcount?: string;
		userplaycount?: string;
		userloved?: string;
		duration?: string;
		toptags?: { tag?: { name: string }[] };
	};
};

export type RawTrackScrobbles = {
	trackscrobbles: {
		track?: { date?: { uts: string } } | { date?: { uts: string } }[];
		'@attr': { totalPages: string };
	};
};

export type RawArtistTopTracks = {
	toptracks: { track?: { name: string }[] };
};
