import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import handlebars from 'handlebars';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';
import { BadRequest } from '../common/errors';
import { getTemplate, send } from '../common/mail';
import { validateToken } from '../common/validateToken';
import { db } from '../infrastructure/database';
import { type UpdateUser, usersTable } from '../infrastructure/database/tables/users.table'; // Import your db instance
import { takeFirstOrThrow } from '../infrastructure/database/utils';
import type { LuciaProvider } from '../providers';
import type { HonoTypes } from '../types';
import { type SendTemplate } from '../types';
import { lucia } from '../common/lucia';
import { signInEmailDto } from '$lib/dtos/signin-email.dto';

export function signInEmail(honoController: Hono<HonoTypes>, path: string) {
	return honoController.post(path, zValidator('json', signInEmailDto), async (c) => {
		const { email, token } = c.req.valid('json');

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.email, email)
		});
		if (!user) {
			throw BadRequest('Bad credentials');
		}

		const isValidToken = await validateToken(user.id, token);
		if (!isValidToken) {
			throw BadRequest('Bad credentials');
		}

		if (!user.verified) {
			await db
				.update(usersTable)
				.set({ verified: true } as UpdateUser)
				.where(eq(usersTable.id, user.id))
				.returning()
				.then(takeFirstOrThrow);

			sendWelcomeEmail({
				to: user.email,
				props: null
			});
		}

		const session = await lucia.createSession(user.id, {});
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
}

function sendWelcomeEmail(data: SendTemplate<null>) {
	const template = handlebars.compile(getTemplate('welcome'));
	return send({
		to: data.to,
		subject: 'Welcome!',
		html: template(null)
	});
}
