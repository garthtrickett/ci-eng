import 'reflect-metadata';
import { Hono } from 'hono';
import { tasksTable } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import { db } from '../infrastructure/database';

const app = new Hono();

app.get('/', async (c) => {
	const tasks = await db.select().from(tasksTable);
	return c.json(tasks);
});

export default app;
