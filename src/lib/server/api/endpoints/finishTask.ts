import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { tasksTable, insertTaskSchema } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import { db } from '../infrastructure/database';

import { eq } from 'drizzle-orm';

const taskParam = insertTaskSchema.pick({ id: true });

const app = new Hono().patch('/', zValidator('param', taskParam), async (c) => {
	const { id } = c.req.valid('param');

	if (typeof id !== 'string') {
		throw c.json({ message: 'TaskId not provided' }, 404);
	}

	const updatedTask = await db
		.update(tasksTable)
		.set({ done: true })
		.where(eq(tasksTable.id, id))
		.returning();

	if (updatedTask) {
		return c.json(updatedTask);
	}

	throw c.json({ message: 'Task not found' }, 404);
});
export default app;
