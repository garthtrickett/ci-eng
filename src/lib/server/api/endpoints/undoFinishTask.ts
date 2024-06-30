import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { tasksTable } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import { db } from '../infrastructure/database';
import { z } from 'zod';
import { insertTaskSchema } from '../infrastructure/database/tables/tasks.table';
import { eq } from 'drizzle-orm';

import type { HonoTypes } from '../types';

export function undoFinishTask(honoController: Hono<HonoTypes>, path: string) {
	const taskParam = insertTaskSchema.pick({ id: true });
	type TaskParam = z.infer<typeof taskParam>;

	return honoController.patch(path, zValidator('param', taskParam), async (c) => {
		const { id } = c.req.valid('param');

		if (typeof id !== 'string') {
			throw c.json({ message: 'TaskId not provided' }, 404);
		}

		const updatedTask = await db
			.update(tasksTable)
			.set({ done: false })
			.where(eq(tasksTable.id, id))
			.returning();

		type ReturnedTask = typeof updatedTask;

		if (updatedTask) {
			return c.json(updatedTask);
		}

		throw c.json({ message: 'Task not found' }, 404);
	});
}
