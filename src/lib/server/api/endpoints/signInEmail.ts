import { Hono } from 'hono';
import { usersTable } from '../infrastructure/database/tables/users.table'; // Import your db instance
import { tokensTable } from '../infrastructure/database/tables/tokens.table'; // Import your db instance
import { db } from '../infrastructure/database';
import type { HonoTypes } from '../types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
	type CreateUser,
	type UpdateUser,
	insertUserSchema
} from '../infrastructure/database/tables/users.table';
import { eq } from 'drizzle-orm';
import { takeFirstOrThrow } from '../infrastructure/database/utils';
import { type SendTemplate } from '../types';
import handlebars from 'handlebars';
import { send, getTemplate } from '../common/mail';
import type { LuciaProvider } from '../providers';
import { setCookie } from 'hono/cookie';
import { BadRequest } from '../common/errors';

// TODO: perhaps move stuff like takeFirstOrThrow into common

export function signInEmail(honoController: Hono<HonoTypes>, path: string, lucia: LuciaProvider) {
	const signInEmailDto = z.object({
		email: z.string().email(),
		token: z.string()
	});
	type SignInEmailDto = z.infer<typeof signInEmailDto>;

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

async function validateToken(userId: string, token: string) {
	const foundToken = await db.transaction(async (tx) => {
		const foundToken = await tx.query.tokensTable.findFirst({
			where: eq(tokensTable.token, token)
		});

		if (foundToken) {
			await tx
				.delete(tokensTable)
				.where(eq(tokensTable.id, foundToken.id))
				.returning()
				.then(takeFirstOrThrow);
		}
		return foundToken;
	});

	if (!foundToken) {
		return false;
	}

	if (foundToken.userId !== userId) {
		return false;
	}

	if (foundToken.expiresAt < new Date()) {
		return false;
	}

	return foundToken;
}

function sendWelcomeEmail(data: SendTemplate<null>) {
	const template = handlebars.compile(getTemplate('welcome'));
	return send({
		to: data.to,
		subject: 'Welcome!',
		html: template(null)
	});
}
