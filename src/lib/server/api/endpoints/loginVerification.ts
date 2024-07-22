import { signInEmailDto, type SignInEmailDto } from '$lib/dtos/signin-email.dto';
import { zValidator } from '@hono/zod-validator';
import { and, eq, gte } from 'drizzle-orm';
import handlebars from 'handlebars';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import 'reflect-metadata';
import { BadRequest } from '../common/errors';
import { lucia } from '../common/lucia';
import { getTemplate, send } from '../common/mail';
import { db } from '../infrastructure/database';
import { loginRequestsTable } from '../infrastructure/database/tables';
import { usersTable } from '../infrastructure/database/tables/users.table'; // Import your db instance
import { takeFirst, takeFirstOrThrow } from '../infrastructure/database/utils';
import { type SendTemplate } from '../types';
import { verifyToken } from '../common/generateTokenWithExpiryAndHash';

const app = new Hono().post('/', zValidator('json', signInEmailDto), async (c) => {
	const { email, token } = c.req.valid('json');
	const session = await verify({ email, token });
	const sessionCookie = lucia.createSessionCookie(session.id);

	setCookie(c, sessionCookie.name, sessionCookie.value, {
		path: sessionCookie.attributes.path,
		maxAge: sessionCookie.attributes.maxAge,
		domain: sessionCookie.attributes.domain,
		sameSite: sessionCookie.attributes.sameSite as any,
		secure: sessionCookie.attributes.secure,
		httpOnly: sessionCookie.attributes.httpOnly,
		expires: sessionCookie.attributes.expires
	});

	return c.json({ message: 'ok' });
});

export default app;

async function verify(data: SignInEmailDto) {
	const validLoginRequest = await fetchValidRequest(data.email, data.token);
	if (!validLoginRequest) throw BadRequest('Invalid token');

	const existingUser = await db.query.usersTable.findFirst({
		where: eq(usersTable.email, data.email)
	});

	if (!existingUser) {
		const newUser = await handleNewUserRegistration(data);
		return lucia.createSession(newUser.id, {});
	}

	return lucia.createSession(existingUser.id, {});
}

async function fetchValidRequest(email: string, token: string) {
	const validLoginRequest = await db.transaction(async (trx) => {
		const loginRequest = await trx
			.select()
			.from(loginRequestsTable)
			.where(
				and(eq(loginRequestsTable.email, email), gte(loginRequestsTable.expiresAt, new Date()))
			)
			.then(takeFirst);
		if (!loginRequest) return null;

		const isValidRequest = await verifyToken(loginRequest.hashedToken, token);

		if (!isValidRequest) return null;
		await trx.delete(loginRequestsTable).where(eq(loginRequestsTable.id, loginRequest.id));
		return loginRequest;
	});

	return validLoginRequest;
}

async function handleNewUserRegistration(data: SignInEmailDto) {
	const newUser = await db.insert(usersTable).values(data).returning().then(takeFirstOrThrow);

	function sendWelcome(data: SendTemplate<null>) {
		const template = handlebars.compile(getTemplate('welcome'));
		return send({
			to: data.to,
			subject: 'Welcome!',
			html: template(null)
		});
	}
	sendWelcome({ to: data.email, props: null });
	return newUser;
}
