import 'reflect-metadata';
import { Hono } from 'hono';
import { dev } from '$app/environment';
import { setCookie } from 'hono/cookie';
import { generateRandomString } from '../common/generateRandomString';

const app = new Hono().get('/', async (c) => {
	// store state

	const state = generateRandomString(16);

	setCookie(c, 'great_cookie', state, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 60
	});

	return c.json({ state });
});

export default app;
