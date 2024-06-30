import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { tasksTable } from '../infrastructure/database/tables/tasks.table'; // Import your db instance
import { db } from '../infrastructure/database';
import { z } from 'zod';
import { insertTaskSchema } from '../infrastructure/database/tables/tasks.table';
import { type CreateTask } from '../infrastructure/database/tables/tasks.table';

import type { HonoTypes } from '../types';
export const createTaskDto = insertTaskSchema.pick({ name: true });

export function createTask(honoController: Hono<HonoTypes>, path: string) {
	return honoController.put(path, zValidator('json', createTaskDto), async (c) => {
		const body = c.req.valid('json');
		const task: CreateTask = {
			name: body.name,
			done: false
		};
		const newTask = await db.insert(tasksTable).values(task).returning();
		console.log(newTask);
		return c.json(newTask);
	});
}
