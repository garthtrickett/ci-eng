import { type ServerLoad } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { CLIENT_SECRET, VITE_CLIENT_ID, VITE_REDIRECT_URI } from '$env/static/private';
import { getCookie } from 'hono/cookie';
import { withClient } from '$lib/client/helpers/api';

import { z } from 'zod';

const tokenRequestSchema = z.object({
	grant_type: z.string(),
	code: z.string(),
	redirect_uri: z.string(),
	client_id: z.string(),
	client_secret: z.string()
});

type TokenRequestData = z.infer<typeof tokenRequestSchema>;

const callbackDto = z.object({
	code: z.string(),
	state: z.string()
});

export const load: ServerLoad = async (event) => {
	// event.locals.api;

	const stateFromCookie = event.cookies.get('state_cookie');

	const code = event.url.searchParams.get('code');
	const oidcState = event.url.searchParams.get('state');
	// const usernameSignInForm = await superValidate(zod(signInUsernameDto));
	console.log(code);
	console.log(oidcState);

	if (oidcState === stateFromCookie) {
		// TODO: Validate the grant_type, code, redirect_uri, client_id, and client_secret

		if (code) {
			const tokenRequestData: TokenRequestData = {
				grant_type: 'authorization_code',
				code: code,
				redirect_uri: VITE_REDIRECT_URI,
				client_id: VITE_CLIENT_ID,
				client_secret: CLIENT_SECRET
			};

			const data = await event.locals.api.oauth2.token.provider.final
				.$post({ json: tokenRequestData })
				.then(event.locals.parseApiResponse);
			console.log(data);
		}
	} // return { usernameSignInForm };
};
