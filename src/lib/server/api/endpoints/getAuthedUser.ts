import 'reflect-metadata';
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.middleware';

const app = new Hono().get('/', requireAuth, async (c) => {
	const user = c.var.user;
	return c.json({ user: user });
});
export default app;
