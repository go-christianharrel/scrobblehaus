export type Tag = {
	name: string;
	count: number;
};

/** Each axis runs 0..1. */
export type Vibe = {
	energy: number;
	dark: number;
	mainstream: number;
	nostalgia: number;
	experimental: number;
};

export type Category = 'Anime' | 'Movie' | 'Real life';

export type Character = {
	name: string;
	from: string;
	category: Category;
	vibe: Vibe;
	blurb: string;
};

export type Match = {
	character: Character;
	percent: number;
};

const v = (energy: number, dark: number, mainstream: number, nostalgia: number, experimental: number): Vibe => ({
	energy,
	dark,
	mainstream,
	nostalgia,
	experimental
});

export const CHARACTERS: Character[] = [
	{ name: 'Levi Ackerman', from: 'Attack on Titan', category: 'Anime', vibe: v(0.8, 0.8, 0.4, 0.3, 0.3), blurb: 'Intense, precise, not a single wasted note.' },
	{ name: 'Satoru Gojo', from: 'Jujutsu Kaisen', category: 'Anime', vibe: v(0.9, 0.4, 0.7, 0.1, 0.5), blurb: 'Confident, flashy, knows exactly who the main character is.' },
	{ name: 'Spike Spiegel', from: 'Cowboy Bebop', category: 'Anime', vibe: v(0.5, 0.6, 0.3, 0.8, 0.8), blurb: 'Jazz-soaked loner with a long playlist of the past.' },
	{ name: 'Naruto Uzumaki', from: 'Naruto', category: 'Anime', vibe: v(0.9, 0.3, 0.8, 0.3, 0.2), blurb: 'Loud, hopeful, every song is an anthem.' },
	{ name: 'Light Yagami', from: 'Death Note', category: 'Anime', vibe: v(0.5, 0.9, 0.5, 0.3, 0.4), blurb: 'Calculated, dark taste with a plan behind every track.' },
	{ name: 'Violet Evergarden', from: 'Violet Evergarden', category: 'Anime', vibe: v(0.1, 0.5, 0.4, 0.6, 0.3), blurb: 'Soft and emotional, piano and strings are home.' },
	{ name: 'Kaneki Ken', from: 'Tokyo Ghoul', category: 'Anime', vibe: v(0.6, 0.95, 0.4, 0.1, 0.5), blurb: 'Brooding and melancholic, with pain in the playlist.' },
	{ name: 'Anya Forger', from: 'Spy x Family', category: 'Anime', vibe: v(0.6, 0.1, 0.9, 0.1, 0.3), blurb: 'Pop, cute, chaotic and always happy.' },
	{ name: 'Tanjiro Kamado', from: 'Demon Slayer', category: 'Anime', vibe: v(0.6, 0.3, 0.7, 0.4, 0.1), blurb: 'Wholesome but brave, with an epic chorus.' },
	{ name: 'Lain Iwakura', from: 'Serial Experiments Lain', category: 'Anime', vibe: v(0.3, 0.8, 0.1, 0.3, 0.95), blurb: 'Deep-web playlist, electronic and weird.' },
	{ name: 'Arthur Fleck', from: 'Joker', category: 'Movie', vibe: v(0.5, 0.95, 0.4, 0.5, 0.6), blurb: 'Dark and theatrical, with a stage all his own.' },
	{ name: 'Ferris Bueller', from: "Ferris Bueller's Day Off", category: 'Movie', vibe: v(0.8, 0.05, 0.8, 0.8, 0.2), blurb: 'Feel-good classics, always a parade somewhere.' },
	{ name: 'Andy Dufresne', from: 'The Shawshank Redemption', category: 'Movie', vibe: v(0.2, 0.5, 0.4, 0.8, 0.3), blurb: 'Quiet and patient, opera in the middle of a prison.' },
	{ name: 'Furiosa', from: 'Mad Max: Fury Road', category: 'Movie', vibe: v(0.9, 0.7, 0.5, 0.4, 0.4), blurb: 'Full throttle, heavy riffs, no brakes.' },
	{ name: 'Barbie', from: 'Barbie', category: 'Movie', vibe: v(0.7, 0.05, 0.95, 0.1, 0.1), blurb: 'Pop princess energy, everything is a chart-topper.' },
	{ name: 'Peter Quill', from: 'Guardians of the Galaxy', category: 'Movie', vibe: v(0.7, 0.2, 0.6, 0.95, 0.3), blurb: 'Awesome Mix vibes, 70s and 80s hits.' },
	{ name: 'Tyler Durden', from: 'Fight Club', category: 'Movie', vibe: v(0.9, 0.8, 0.3, 0.6, 0.5), blurb: 'Rebellious and raw, alternative all the way down.' },
	{ name: 'Amélie Poulain', from: 'Amélie', category: 'Movie', vibe: v(0.3, 0.15, 0.3, 0.5, 0.8), blurb: 'Whimsical and indie, songs that feel like tiny stories.' },
	{ name: 'Elle Woods', from: 'Legally Blonde', category: 'Movie', vibe: v(0.7, 0.05, 0.9, 0.3, 0.1), blurb: 'Bubbly pop with confidence in every chorus.' },
	{ name: 'Neo', from: 'The Matrix', category: 'Movie', vibe: v(0.7, 0.7, 0.4, 0.3, 0.6), blurb: 'Electronic, industrial and a little mysterious.' },
	{ name: 'Forrest Gump', from: 'Forrest Gump', category: 'Movie', vibe: v(0.3, 0.2, 0.8, 0.8, 0.1), blurb: 'Simple, classic, songs everyone knows.' },
	{ name: 'Wednesday Addams', from: 'Wednesday', category: 'Movie', vibe: v(0.5, 0.9, 0.5, 0.2, 0.6), blurb: 'Goth-ish and deadpan, with a cello at night.' },
	{ name: 'Jack Sparrow', from: 'Pirates of the Caribbean', category: 'Movie', vibe: v(0.7, 0.3, 0.6, 0.6, 0.5), blurb: 'Rum-drenched folk-rock, odd but charming.' },
	{ name: 'Freddie Mercury', from: 'Real life', category: 'Real life', vibe: v(0.9, 0.3, 0.7, 0.7, 0.7), blurb: 'Dramatic and grand, never afraid to be too much.' },
	{ name: 'Bob Ross', from: 'Real life', category: 'Real life', vibe: v(0.05, 0.05, 0.6, 0.7, 0.3), blurb: 'Calm and soft, perfect for happy little playlists.' },
	{ name: 'Keanu Reeves', from: 'Real life', category: 'Real life', vibe: v(0.6, 0.4, 0.6, 0.5, 0.4), blurb: 'Chill with rock in the heart, genuine taste.' },
	{ name: 'David Bowie', from: 'Real life', category: 'Real life', vibe: v(0.6, 0.4, 0.5, 0.6, 0.95), blurb: 'Eclectic and shape-shifting, impossible to box in.' }
];

type Bucket = { up: string[]; down: string[] };

const BUCKETS: Record<'energy' | 'dark' | 'nostalgia', Bucket> = {
	energy: {
		up: ['metal', 'punk', 'hardcore', 'rock', 'hip-hop', 'hip hop', 'rap', 'trap', 'edm', 'dance', 'electronic', 'house', 'techno', 'drum and bass', 'k-pop', 'kpop', 'j-rock', 'pop punk', 'grunge'],
		down: ['ambient', 'acoustic', 'folk', 'lo-fi', 'lofi', 'chill', 'jazz', 'classical', 'singer-songwriter', 'piano', 'sleep', 'easy listening', 'bossa nova', 'soft', 'instrumental', 'soundtrack']
	},
	dark: {
		up: ['metal', 'goth', 'dark', 'post-punk', 'industrial', 'emo', 'sad', 'melancholy', 'doom', 'darkwave', 'trip-hop', 'grunge', 'shoegaze', 'depressive', 'black metal'],
		down: ['happy', 'pop', 'dance', 'funk', 'disco', 'reggae', 'summer', 'feel good', 'upbeat', 'k-pop', 'kpop', 'sunshine']
	},
	nostalgia: {
		up: ['60s', '70s', '80s', '90s', 'classic rock', 'oldies', 'soul', 'motown', 'blues', 'new wave', 'synthpop', 'classic', 'vintage', 'britpop', 'old school'],
		down: ['2000s', '2010s', '2020s', 'trap', 'hyperpop', 'bedroom pop', 'drill', 'modern']
	}
};

const EXPERIMENTAL = ['experimental', 'avant-garde', 'noise', 'psychedelic', 'progressive', 'math rock', 'idm', 'post-rock', 'art rock', 'free jazz', 'glitch', 'vaporwave', 'hyperpop', 'shoegaze'];

const hits = (tag: string, words: string[]): boolean => words.some((w) => tag.includes(w));

function axis(tags: Tag[], bucket: Bucket): number {
	let up = 0;
	let down = 0;
	for (const t of tags) {
		const name = t.name.toLowerCase();
		if (hits(name, bucket.up)) up += t.count;
		if (hits(name, bucket.down)) down += t.count;
	}
	return up + down === 0 ? 0.5 : up / (up + down);
}

/** `mainstream` is the 0..100 score from the Taste page. */
export function buildVibe(tags: Tag[], mainstream: number): Vibe {
	const total = tags.reduce((a, t) => a + t.count, 0) || 1;
	const exp = tags.filter((t) => hits(t.name.toLowerCase(), EXPERIMENTAL)).reduce((a, t) => a + t.count, 0) / total;
	const m = mainstream / 100;
	return {
		energy: axis(tags, BUCKETS.energy),
		dark: axis(tags, BUCKETS.dark),
		mainstream: m,
		nostalgia: axis(tags, BUCKETS.nostalgia),
		experimental: Math.min(1, exp * 2 + (1 - m) * 0.5)
	};
}

const KEYS: (keyof Vibe)[] = ['energy', 'dark', 'mainstream', 'nostalgia', 'experimental'];

export function matchCharacters(vibe: Vibe, limit = 5): Match[] {
	return CHARACTERS.map((character) => {
		const dist = Math.sqrt(KEYS.reduce((s, k) => s + (vibe[k] - character.vibe[k]) ** 2, 0));
		return { character, percent: Math.max(1, Math.round((1 - dist / Math.sqrt(KEYS.length)) * 100)) };
	})
		.sort((a, b) => b.percent - a.percent)
		.slice(0, limit);
}

export function bestPerCategory(vibe: Vibe): Match[] {
	const all = matchCharacters(vibe, CHARACTERS.length);
	return (['Anime', 'Movie', 'Real life'] as Category[]).map((c) => all.find((m) => m.character.category === c)).filter((m): m is Match => Boolean(m));
}

const LABELS: Record<keyof Vibe, [string, string]> = {
	energy: ['calm and mellow', 'high-energy'],
	dark: ['bright and happy', 'dark and moody'],
	mainstream: ['underground', 'mainstream'],
	nostalgia: ['modern', 'nostalgic / classic'],
	experimental: ['straightforward', 'experimental']
};

export function describeVibe(vibe: Vibe): string[] {
	return KEYS.map((k) => ({ k, strength: Math.abs(vibe[k] - 0.5) }))
		.sort((a, b) => b.strength - a.strength)
		.slice(0, 3)
		.map(({ k }) => LABELS[k][vibe[k] >= 0.5 ? 1 : 0]);
}

export type TypeAxis = {
	left: string;
	right: string;
	/** 0..1, how far toward `right`. */
	value: number;
	letter: string;
	/** Strength (50-100) of the winning side. */
	percent: number;
};

export type MusicType = {
	code: string;
	name: string;
	tagline: string;
	axes: TypeAxis[];
};

const TYPES: Record<string, [string, string]> = {
	EDMN: ['The Arena Rebel', 'Big-stage rock and metal anthems, played loud and proud.'],
	EDMF: ['The Hype Villain', 'Dark, heavy-hitting bangers that everyone secretly knows.'],
	EDUN: ['The Basement Legend', 'Loud, moody deep cuts from decades past.'],
	EDUF: ['The Glitch Goblin', 'Intense underground sounds nobody has heard of yet.'],
	ELMN: ['The Stadium Sunshine', 'Feel-good singalongs from every era.'],
	ELMF: ['The Chart Chaser', 'Upbeat current pop, always first to the hook.'],
	ELUN: ['The Vintage Raver', 'Funk, disco and rare grooves that still make you move.'],
	ELUF: ['The Festival Explorer', 'Bright, fresh and a little bit unknown.'],
	CDMN: ['The Midnight Crooner', 'Moody classics and sad songs in great taste.'],
	CDMF: ['The Rainy-Day Mainstream', 'Melancholy pop for staring out of windows.'],
	CDUN: ['The Vinyl Philosopher', 'Slow, dark and rare records with a story.'],
	CDUF: ['The Bedroom Poet', 'Lo-fi, sad and brand-new indie that feels like a secret.'],
	CLMN: ['The Golden-Hour Classic', 'Warm, mellow favourites everyone can share.'],
	CLMF: ['The Cozy Hitmaker', 'Soft, chill modern pop for good company.'],
	CLUN: ['The Record-Store Sage', 'Gentle folk and jazz deep cuts, curated with care.'],
	CLUF: ['The Dreamy Wanderer', 'Soft, bright and unusual sounds from tomorrow.']
};

/** Four axes, one letter each: Energetic/Chill, Dark/Light, Mainstream/Underground, Nostalgic/Fresh. */
export function musicType(vibe: Vibe): MusicType {
	const underground = Math.min(1, (1 - vibe.mainstream) * 0.65 + vibe.experimental * 0.35);
	const raw: { left: string; right: string; value: number; letters: [string, string] }[] = [
		{ left: 'Chill', right: 'Energetic', value: vibe.energy, letters: ['C', 'E'] },
		{ left: 'Light', right: 'Dark', value: vibe.dark, letters: ['L', 'D'] },
		{ left: 'Mainstream', right: 'Underground', value: underground, letters: ['M', 'U'] },
		{ left: 'Fresh', right: 'Nostalgic', value: vibe.nostalgia, letters: ['F', 'N'] }
	];
	const axes: TypeAxis[] = raw.map((a) => {
		const right = a.value >= 0.5;
		return {
			left: a.left,
			right: a.right,
			value: a.value,
			letter: a.letters[right ? 1 : 0],
			percent: Math.round(50 + Math.abs(a.value - 0.5) * 100)
		};
	});
	const code = axes.map((a) => a.letter).join('');
	const [name, tagline] = TYPES[code];
	return { code, name, tagline, axes };
}
