import 'reflect-metadata';
import { Hono } from 'hono';
import { dev } from '$app/environment';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { generateRandomString } from '../common/generateRandomString';

const app = new Hono().get('/', async (c) => {
	const state = generateRandomString(16);

	deleteCookie(c, 'state_cookie');

	setCookie(c, 'state_cookie', state, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 60
	});

	console.log('state1', state);

	return c.json({ state });
});

export default app;
