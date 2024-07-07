import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import 'reflect-metadata';
import { lucia } from '../common/lucia';
import { requireAuth } from '../middleware/auth.middleware';

const app = new Hono().post('/', requireAuth, async (c) => {
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

export default app;
