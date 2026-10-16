import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
	new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${url.origin}/sitemap.xml\n`, {
		headers: { 'content-type': 'text/plain' }
	});
