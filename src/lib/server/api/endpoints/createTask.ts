import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { tasksTable } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import { db } from '../infrastructure/database';
import { insertTaskSchema } from '../infrastructure/database/tables/tasks.table';
import { type CreateTask } from '../infrastructure/database/tables/tasks.table';

export const createTaskDto = insertTaskSchema.pick({ name: true });

const app = new Hono();

app.put('/', zValidator('json', createTaskDto), async (c) => {
	const body = c.req.valid('json');
	const task: CreateTask = {
		name: body.name,
		done: false
	};
	const newTask = await db.insert(tasksTable).values(task).returning();
	console.log(newTask);
	return c.json(newTask);
});

export default app;
