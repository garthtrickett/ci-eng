import { Hono } from 'hono';
import { generateRandomString } from '../common/generateRandomString';
import { zValidator } from '@hono/zod-validator';
import { signInUsernameDto } from '$lib/dtos/signin-username.dto';
import { eq } from 'drizzle-orm';
import { usersTable } from '../infrastructure/database/tables';
import { db } from '../infrastructure/database';
import { sha256 } from '@noble/hashes/sha2';
import { type CreateAuthCode } from '../infrastructure/database/tables/authCodes.table';
import { setCookie } from 'hono/cookie';
import { lucia } from '../common/lucia';
import { superValidate, setError } from 'sveltekit-superforms';
import { actionResult } from 'sveltekit-superforms';

import { zod } from 'sveltekit-superforms/adapters';

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

const app = new Hono().post('/token', zValidator('form', tokenRequestSchema), async (c) => {
	// TODO: Validate the access_token and id_token

	const secret = new TextEncoder().encode(CLIENT_SECRET);

	const body = c.req.valid('form');

	const codes = await db.select().from(authCodesTable).where(eq(authCodesTable.code, body.code));

	const userId = codes[0].userId;

	const user = await db.select().from(usersTable).where(eq(usersTable.id, userId));

	const alg = 'HS256';

	const idTokenPayload = {
		sub: user[0].id, // Unique identifier for the user
		username: user[0].username,
		nonce: codes[0].nonce,
		iat: Math.floor(Date.now() / 1000), // issued at
		exp: Math.floor(Date.now() / 1000) + 60 * 60 // expires in 1 hour
	};

	const accessTokenPayload = {
		sub: user[0].id, // Unique identifier for the user
		username: user[0].username,
		nonce: codes[0].nonce,
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
		.setIssuer('http://localhost:5173')
		.setAudience('http://localhost:80')
		.setExpirationTime('2h')
		.sign(secret);

	const idToken = await new jose.SignJWT(idTokenPayload)
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer('http://localhost:5173')
		.setAudience('http://localhost:80')
		.setExpirationTime('2h')
		.sign(secret);

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
