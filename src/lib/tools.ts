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
	/** Search phrases people use to find this tool (meta keywords + home copy). */
	keywords: string[];
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
		seoTitle: 'Last.fm Collage Maker – Top Albums Grid | Scrobblehaus',
		seoDesc:
			'Free Last.fm collage maker. Turn your top albums, artists or tracks into a 3x3, 4x4 or 5x5 album grid for any period and download it as a PNG. No login.',
		keywords: [
			'lastfm collage',
			'last.fm collage maker',
			'last.fm album collage',
			'lastfm top albums grid',
			'lastfm 3x3 collage',
			'lastfm 4x4 collage',
			'lastfm 5x5 collage',
			'album cover collage generator',
			'lastfm top artists collage',
			'tapmusic alternative'
		],
		faq: [
			[
				'What is the best Last.fm collage maker?',
				'Scrobblehaus is a free Last.fm collage maker with no login or API key. It builds album, artist and track grids from 1x1 up to 15x15 and exports them as a PNG.'
			],
			[
				'Can I make a 3x3, 4x4 or 5x5 Last.fm album collage?',
				'Yes. Choose a grid size, a period such as the last 7 days, 1 month or overall, and download the finished album collage.'
			],
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
		seoTitle: 'Last.fm Top Artists, Albums & Tracks Charts | Scrobblehaus',
		seoDesc:
			'See your Last.fm top artists, top albums and top tracks by plays or minutes listened for any period, then export the charts as CSV. Free, just a username.',
		keywords: [
			'lastfm top artists',
			'lastfm top albums',
			'lastfm top tracks',
			'last.fm charts',
			'lastfm weekly chart',
			'lastfm yearly top artists',
			'lastfm minutes listened',
			'lastfm top tracks of the year',
			'last.fm stats'
		],
		faq: [
			[
				'How do I see my top artists on Last.fm for this year?',
				'Open Top Charts, pick 12 months or the period you want, and your top artists, albums and tracks are ranked by plays or minutes.'
			],
			[
				'Can I see how many minutes I listened to on Last.fm?',
				'Yes. Switch the ranking from plays to minutes to see listening time per artist, album and track.'
			],
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
		seoTitle: 'Last.fm Receipt – Receiptify Alternative | Scrobblehaus',
		seoDesc:
			'Make a Last.fm receipt of your top tracks and artists. A free Receiptify alternative: a receipt-style page of your listening you can print or save as PDF.',
		keywords: [
			'lastfm receipt',
			'last.fm receipt generator',
			'receiptify lastfm',
			'receiptify alternative',
			'music receipt',
			'lastfm top tracks receipt',
			'lastfm listening receipt',
			'spotify receipt alternative'
		],
		faq: [
			[
				'Is there a Receiptify for Last.fm?',
				'Yes. Scrobblehaus makes a Receiptify-style receipt from your Last.fm top tracks and artists, free and without logging in.'
			],
			[
				'Can I save my Last.fm receipt?',
				'Yes. Generate the receipt, then print it or save it as a PDF.'
			],
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
		seoTitle: 'Last.fm Mainstream Score & Music Taste Analyzer | Scrobblehaus',
		seoDesc:
			'How mainstream is your music taste? Get your Last.fm mainstream score, music taste analysis, tag cloud, music iceberg and character match. Free.',
		keywords: [
			'lastfm mainstream score',
			'how mainstream is my music taste',
			'music taste analyzer',
			'lastfm taste test',
			'music iceberg',
			'lastfm tag cloud',
			'lastfm music personality',
			'lastfm character match',
			'how basic is my music taste'
		],
		faq: [
			[
				'How mainstream is my music taste?',
				'Scrobblehaus compares your Last.fm top artists with how widely listened to they are and gives you a mainstream score from underground to mainstream.'
			],
			[
				'What is a music iceberg?',
				'A tiered chart that places your top artists from popular at the surface to obscure at the bottom, built from your Last.fm listening.'
			],
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
			'Last.fm Stats – Listening Hours, Weekdays & Streaks | Scrobblehaus',
		seoDesc:
			'Free Last.fm stats: your most active hours and weekdays, scrobbles per day, listening streaks, last 12 months and what you played on this day.',
		keywords: [
			'lastfm stats',
			'last.fm listening stats',
			'lastfm listening streak',
			'lastfm scrobbles per day',
			'lastfm listening history',
			'lastfm on this day',
			'lastfm listening habits',
			'fm stats alternative',
			'lastfm statistics'
		],
		faq: [
			[
				'How do I see my Last.fm stats?',
				'Enter your username in Scrobblehaus Insights to see your busiest hours and weekdays, scrobbles per day, your best listening streak and your last 12 months.'
			],
			[
				'Can I see what I listened to on this day last year?',
				"Yes. The On this day view lists what you were playing on today's date in previous years."
			],
			[
				'What listening stats can I see?',
				'Your busiest hours and weekdays, scrobbles per day, your best streak, and what you were playing on this day in past years.'
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
			'Last.fm Compare – Music Compatibility With a Friend | Scrobblehaus',
		seoDesc:
			'Compare two Last.fm users. Get a music compatibility score and see the top artists you both listen to. Free, any public username.',
		keywords: [
			'lastfm compare',
			'last.fm compatibility',
			'lastfm tasteometer',
			'compare lastfm users',
			'music compatibility test',
			'lastfm friend compatibility',
			'lastfm shared artists',
			'compare music taste with friend'
		],
		faq: [
			[
				'How do I compare my Last.fm with a friend?',
				"Enter your username and your friend's in Scrobblehaus Compare to get a match score and the artists you share."
			],
			[
				'Is this like the Last.fm tasteometer?',
				'Yes, it works the same way: it measures how much two listening histories overlap and lists the shared artists.'
			],
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
		seoTitle: 'Last.fm Scrobble Exporter – Download CSV or JSON | Scrobblehaus',
		seoDesc:
			'Export your Last.fm scrobbles and listening history to CSV or JSON. Download all your scrobbles and top lists for free. No login, just your username.',
		keywords: [
			'lastfm export',
			'export lastfm scrobbles',
			'download lastfm scrobbles',
			'lastfm scrobbles csv',
			'lastfm to csv',
			'lastfm backup',
			'export lastfm listening history',
			'lastfm data export',
			'lastfm json export'
		],
		faq: [
			[
				'How do I download all my Last.fm scrobbles?',
				'Enter your username in the Scrobblehaus Exporter, choose CSV or JSON and download your full scrobble history.'
			],
			[
				'Can I back up my Last.fm data?',
				'Yes. Exporting your scrobbles to CSV or JSON gives you a backup you can keep or import elsewhere.'
			],
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
