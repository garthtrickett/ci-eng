import { Hono } from 'hono';
import { generateRandomString } from '../common/generateRandomString';
import { zValidator } from '@hono/zod-validator';
import { signInUsernameDto } from '$lib/dtos/signin-username.dto';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { usersTable } from '../infrastructure/database/tables';
import { db } from '../infrastructure/database';
import { sha256 } from '@noble/hashes/sha2';
import { type CreateAuthCode } from '../infrastructure/database/tables/authCodes.table';
import { setCookie } from 'hono/cookie';
import { lucia } from '../common/lucia';

import * as jose from 'jose';

import { VITE_CLIENT_ID, VITE_REDIRECT_URI, CLIENT_SECRET } from '$env/static/private';

import { z } from 'zod';
import { authCodesTable } from '../infrastructure/database/tables/authCodes.table';

const tokenRequestSchema = z.object({
	grant_type: z.string(),
	code: z.string(),
	redirect_uri: z.string(),
	client_id: z.string(),
	client_secret: z.string()
});

const app = new Hono()
	.post('/authorize', zValidator('json', signInUsernameDto), async (c) => {
		const body = c.req.valid('json');

		const username = body.username;
		const password = body.password;

		console.log(username);

		// TODO: Check username and password
		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_.-]+$/i.test(username)
		) {
			console.log('1');
			return fail(400, {
				message: 'invalid username'
			});
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			console.log('2');
			return fail(400, {
				message: 'Invalid password'
			});
		}

		const users = await db.select().from(usersTable).where(eq(usersTable.username, username));
		const user = users[0];

		if (!user) {
			// NOTE:
			// Returning immediately allows malicious actors to figure out valid usernames from response times,
			// allowing them to only focus on guessing passwords in brute-force attacks.
			// As a preventive measure, you may want to hash passwords even for invalid usernames.
			// However, valid usernames can be already be revealed with the signup page among other methods.
			// It will also be much more resource intensive.
			// Since protecting against this is non-trivial,
			// it is crucial your implementation is protected against brute-force attacks with login throttling etc.
			// If usernames are public, you may outright tell the user that the username is invalid.

			console.log('3');
			return fail(400, {
				message: 'Incorrect username or password'
			});
		}

		// Hash the provided password
		const hashedPassword = sha256(password);

		const hashedPasswordString = Buffer.from(hashedPassword).toString('hex');

		// Compare the hashed password with the stored hash
		const validPassword = hashedPasswordString === user.password_hash;
		if (!validPassword) {
			console.log('4');
			return fail(400, {
				message: 'Incorrect username or password'
			});
		}

		// TODO: Validate the client_id, redirect_uri, response_type, and scope

		const code = generateRandomString(16);

		const newCode: CreateAuthCode = {
			userId: user.id,
			code: code
		};
		await db.insert(authCodesTable).values(newCode);

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

		sessionCookie.attributes.path = '.';

		const url = `${body.redirectUri}?code=${code}&state=${body.state}`;

		return c.json({ redirectUrl: url });
	})

	.post('/token/provider/final', zValidator('json', tokenRequestSchema), async (c) => {
		// TODO: Validate the access_token and id_token
		console.log('hello');

		const body = c.req.valid('json');

		const codes = await db.select().from(authCodesTable).where(eq(authCodesTable.code, body.code));

		const userId = codes[0].userId;

		const user = await db.select().from(usersTable).where(eq(usersTable.id, userId));

		const secret = new TextEncoder().encode(
			'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2'
		);
		const alg = 'HS256';

		const idTokenPayload = {
			userId: user[0].id,
			name: user[0].username,
			iat: Math.floor(Date.now() / 1000), // issued at
			exp: Math.floor(Date.now() / 1000) + 60 * 60 // expires in 1 hour
		};

		const accessTokenPayload = {
			userId: user[0].id,
			grant_type: 'authorization_code',
			code: body.code,
			redirect_uri: body.redirect_uri,
			client_id: body.client_id,
			client_secret: body.client_secret,
			iat: Math.floor(Date.now() / 1000), // issued at
			exp: Math.floor(Date.now() / 1000) + 60 * 60 // expires in 1 hour
		};

		const accessToken = await new jose.SignJWT(accessTokenPayload)
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setIssuer('urn:example:issuer')
			.setAudience('urn:example:audience')
			.setExpirationTime('2h')
			.sign(secret);

		const idToken = await new jose.SignJWT(idTokenPayload)
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setIssuer('urn:example:issuer')
			.setAudience('urn:example:audience')
			.setExpirationTime('2h')
			.sign(secret);

		// these don't work
		// jose.jwtDecrypt(idToken, secret);
		// jose.jwtDecrypt(accessToken, secret);

		// how does the client use the id_token to allow the user to be logged into the client app

		return c.json({
			access_token: accessToken,
			id_token: idToken,
			token_type: 'Bearer',
			expires_in: 60 * 60
		});

		// 		Yes, you’re correct. The generateRandomString(32) function calls in your code are placeholders for generating the access_token and id_token. In a real-world OpenID Connect (OIDC) implementation, these tokens are not randomly generated strings. Instead, they are typically JWTs (JSON Web Tokens) that are digitally signed by the authorization server.

		// The access_token is used to authorize API requests on behalf of the user. It usually contains scopes and permissions granted to the user.
		// The id_token is used to authenticate the user and establish a user session in the client application. It contains claims about the authenticated user such as their ID, email, and other profile information.
		// These tokens are encoded and can be decoded to reveal the information contained within them. They are also digitally signed to prevent tampering. So, in a complete implementation, you would replace these placeholders with functions that generate valid, signed JWTs according to the OIDC specification

		// The id_token is the primary addition that OIDC brings to OAuth2. It provides the client with details about the user and their authentication status, which is not standard in OAuth2.
	});

export default app;
