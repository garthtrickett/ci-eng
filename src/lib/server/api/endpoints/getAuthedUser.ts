import { Hono } from 'hono';

import { tasksTable } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import { db } from '../infrastructure/database';
import type { HonoTypes } from '../types';

export function getAuthedUser(honoController: Hono<HonoTypes>, path: string) {
	return honoController.get(path, async (c) => {
		const user = c.var.user;
		return c.json({ user: user });
	});
}
