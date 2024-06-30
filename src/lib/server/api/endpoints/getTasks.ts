import 'reflect-metadata';
import { Hono } from 'hono';
import { tasksTable } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import { db } from '../infrastructure/database';
import type { HonoTypes } from '../types';

export function getTasks(honoController: Hono<HonoTypes>, path: string) {
	return honoController.get(path, async (c) => {
		const tasks = await db.select().from(tasksTable);

		console.log(tasks);
		return c.json(tasks);
	});
}
