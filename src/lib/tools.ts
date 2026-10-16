export type Tool = {
	href: string;
	label: string;
	/** Key into Icon.svelte */
	icon: string;
	/** Accent hue (0-360) used for the tool's gradient tile. */
	hue: number;
	blurb: string;
	/** <title> for search results. */
	seoTitle: string;
	/** Meta description for search results. */
	seoDesc: string;
	/** Short Q&A shown under the tool and exposed as FAQ structured data. */
	faq: [string, string][];
};

export const TOOLS: Tool[] = [
	{
		href: '/collage',
		label: 'Collage',
		icon: 'collage',
		hue: 350,
		blurb: 'Album, artist and track grids with PNG download and print.',
		seoTitle: 'Last.fm Album Collage Maker – Top Albums Grid | Scrobblehaus',
		seoDesc:
			'Free Last.fm collage maker. Turn your top albums, artists or tracks into a shareable grid (3x3, 4x4, 5x5) and download it as a PNG.',
		faq: [
			[
				'How do I make a Last.fm collage?',
				'Enter your Last.fm username, pick albums, artists or tracks, choose a period and grid size, then download the result as a PNG.'
			],
			[
				'Is the collage maker free?',
				'Yes. It is free and needs no login or API key, only your public Last.fm username.'
			]
		]
	},
	{
		href: '/charts',
		label: 'Top Charts',
		icon: 'charts',
		hue: 20,
		blurb: 'Ranked lists by plays or minutes, with CSV export.',
		seoTitle:
			'Last.fm Top Charts – Top Artists, Albums & Tracks | Scrobblehaus',
		seoDesc:
			'See your Last.fm top artists, albums and tracks by plays or minutes for any period, and export them as CSV.',
		faq: [
			[
				'Can I see my Last.fm top artists for a specific period?',
				'Yes. Choose 7 days, 1 month, 3 months, 6 months, 12 months or overall, and rank by plays or minutes.'
			],
			[
				'Can I download my charts?',
				'Yes, every chart can be exported as a CSV file.'
			]
		]
	},
	{
		href: '/receipt',
		label: 'Receipt',
		icon: 'receipt',
		hue: 45,
		blurb: 'Your listening history, styled as a receipt.',
		seoTitle:
			'Last.fm Receipt – Your Listening History as a Receipt | Scrobblehaus',
		seoDesc:
			'Generate a Last.fm receipt of your top tracks and artists. A free, shareable receipt-style image of your listening.',
		faq: [
			[
				'What is a Last.fm receipt?',
				'A receipt-style image that lists your top tracks and artists for a chosen period, made to share on social media.'
			],
			[
				'Does it need my password?',
				'No. Only your public Last.fm username is used.'
			]
		]
	},
	{
		href: '/taste',
		label: 'Taste',
		icon: 'taste',
		hue: 280,
		blurb: 'Mainstream score, tag cloud, iceberg and character match.',
		seoTitle:
			'Last.fm Taste Analyzer – Mainstream Score & Music Personality | Scrobblehaus',
		seoDesc:
			'How mainstream is your music taste? Get your Last.fm mainstream score, tag cloud, music iceberg and character match.',
		faq: [
			[
				'How is the mainstream score calculated?',
				'It compares your top artists with how widely listened to they are across Last.fm, so a higher score means more mainstream taste.'
			],
			[
				'What is the character match?',
				'It maps your listening to a character profile based on your top tags and artists.'
			]
		]
	},
	{
		href: '/insights',
		label: 'Insights',
		icon: 'insights',
		hue: 205,
		blurb: 'Hour, weekday, heatmap and "on this day".',
		seoTitle:
			'Last.fm Listening Stats – Heatmap, Hours & Weekdays | Scrobblehaus',
		seoDesc:
			'Explore your Last.fm listening habits: busiest hours and weekdays, a listening heatmap and what you played on this day.',
		faq: [
			[
				'What listening stats can I see?',
				'Your busiest hours and weekdays, a listening heatmap, and what you were playing on this day in past years.'
			],
			[
				'Where does the data come from?',
				'From your public Last.fm scrobbles, loaded when you open the tool.'
			]
		]
	},
	{
		href: '/compare',
		label: 'Compare',
		icon: 'compare',
		hue: 320,
		blurb: "See how your taste matches a friend's.",
		seoTitle:
			'Last.fm Compare – Music Taste Compatibility With a Friend | Scrobblehaus',
		seoDesc:
			'Compare your Last.fm taste with a friend. Get a match score and see the artists you both listen to.',
		faq: [
			[
				'How does the Last.fm compatibility score work?',
				"It compares your top artists with a friend's and measures how much of your listening overlaps."
			],
			[
				'Does my friend need to use Scrobblehaus?',
				'No. Any public Last.fm username works.'
			]
		]
	},
	{
		href: '/export',
		label: 'Exporter',
		icon: 'export',
		hue: 175,
		blurb: 'CSV/JSON of all your scrobbles and lists.',
		seoTitle:
			'Last.fm Scrobble Exporter – Download Your Scrobbles as CSV or JSON | Scrobblehaus',
		seoDesc:
			'Export your full Last.fm listening history and top lists as CSV or JSON. Free, no login, just your username.',
		faq: [
			[
				'How do I export my Last.fm scrobbles?',
				'Enter your username, choose CSV or JSON, and the tool downloads your full scrobble history to your device.'
			],
			[
				'Is exporting free and private?',
				'Yes. It is free, needs no login, and your data is not stored on our servers.'
			]
		]
	}
];
