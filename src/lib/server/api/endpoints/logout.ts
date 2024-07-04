import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import 'reflect-metadata';
import { z } from 'zod';
import { lucia } from '../common/lucia';
import { requireAuth } from '../middleware/auth.middleware';
import type { HonoTypes } from '../types';

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
