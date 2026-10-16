import { LASTFM_API_KEY } from '$app/env/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => ({
	serverKey: Boolean(LASTFM_API_KEY)
});
