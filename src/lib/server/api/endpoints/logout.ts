import 'reflect-metadata';
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
import { requireAuth } from '../middleware/auth.middleware';
import { lucia } from '../common/lucia';

export const signInEmailDto = z.object({
	email: z.string().email(),
	token: z.string()
});

export function logout(honoController: Hono<HonoTypes>, path: string) {
	return honoController.post(path, requireAuth, async (c) => {
		const sessionId = c.var.session.id;
		lucia.invalidateSession(sessionId);
		const sessionCookie = lucia.createBlankSessionCookie();
		setCookie(c, sessionCookie.name, sessionCookie.value, {
			path: sessionCookie.attributes.path,
			maxAge: sessionCookie.attributes.maxAge,
			domain: sessionCookie.attributes.domain,
			sameSite: sessionCookie.attributes.sameSite as any,
			secure: sessionCookie.attributes.secure,
			httpOnly: sessionCookie.attributes.httpOnly,
			expires: sessionCookie.attributes.expires
		});
		return c.json({ status: 'success' });
	});
}
