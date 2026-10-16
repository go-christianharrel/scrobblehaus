import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	/** Optional. When set, the key stays on the server and users only ever enter a username. */
	LASTFM_API_KEY: {
		schema: (value: string | undefined): string => value ?? ''
	}
});
