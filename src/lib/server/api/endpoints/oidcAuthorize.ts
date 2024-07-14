import { Hono } from 'hono';
import { generateRandomString } from '../common/generateRandomString';
import { zValidator } from '@hono/zod-validator';
import { signInUsernameDto } from '$lib/dtos/signin-username.dto';

// Authorization endpoint

const app = new Hono()
	.post('/authorize', zValidator('json', signInUsernameDto), async (c) => {
		const body = c.req.valid('json');
		console.log(body);

		// TODO: Validate the client_id, redirect_uri, response_type, and scope

		const code = generateRandomString(16);
		return c.redirect(`${redirectUri}?code=${code}&state=${state}`);
	})
	.post('/token', async (c) => {
		const grantType = c.req.body('grant_type');
		const code = c.req.body('code');
		const redirectUri = c.req.body('redirect_uri');
		const clientId = c.req.body('client_id');
		const clientSecret = c.req.body('client_secret');

		// TODO: Validate the grant_type, code, redirect_uri, client_id, and client_secret

		// If everything is valid, return an access token and ID token. These are just placeholders
		// - in a real application, you'd need to generate JWTs and include the appropriate claims.
		return c.json({
			access_token: generateRandomString(32),
			id_token: generateRandomString(32),
			token_type: 'Bearer',
			expires_in: 60 * 60
		});
	});

export default app;
