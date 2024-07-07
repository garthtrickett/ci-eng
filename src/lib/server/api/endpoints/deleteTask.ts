import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { db } from '../infrastructure/database';
import { eq } from 'drizzle-orm';
import { tasksTable, insertTaskSchema } from '../infrastructure/database/tables/tasks.table'; // Import your db instance

const taskParam = insertTaskSchema.pick({ id: true });

const app = new Hono().delete('/tasks/:id/delete', zValidator('param', taskParam), async (c) => {
	const { id } = c.req.valid('param');

	if (typeof id !== 'string') {
		throw c.json({ message: 'TaskId not provided' }, 404);
	}

	const deletedTask = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();

	if (deletedTask) {
		return c.json(deletedTask);
	}

	throw c.json({ message: 'Task not found' }, 404);
});

export default app;
