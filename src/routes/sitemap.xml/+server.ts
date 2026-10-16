import { TOOLS } from '#lib/tools';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const paths = ['/', ...TOOLS.map((t) => t.href)];
	const urls = paths.map((p) => `<url><loc>${url.origin}${p}</loc></url>`).join('');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
		headers: { 'content-type': 'application/xml' }
	});
};
