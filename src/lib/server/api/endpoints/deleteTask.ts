import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { db } from '../infrastructure/database';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { tasksTable, insertTaskSchema } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import type { HonoTypes } from '../types';

export function deleteTask(honoController: Hono<HonoTypes>, path: string) {
	const taskParam = insertTaskSchema.pick({ id: true });
	type TaskParam = z.infer<typeof taskParam>;

	return honoController.delete(path, zValidator('param', taskParam), async (c) => {
		const { id } = c.req.valid('param');

		if (typeof id !== 'string') {
			throw c.json({ message: 'TaskId not provided' }, 404);
		}

		const deletedTask = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();

		type ReturnedTask = typeof deletedTask;

		if (deletedTask) {
			return c.json(deletedTask);
		}

		throw c.json({ message: 'Task not found' }, 404);
	});
}
