import { createId } from '@paralleldrive/cuid2';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { type InferInsertModel } from 'drizzle-orm';
import { timestamps } from '../utils';

export const tasksTable = pgTable('tasks', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text('name').notNull(),
	done: boolean('done').notNull().default(false),
	...timestamps
});

export const insertTaskSchema = createInsertSchema(tasksTable);
export const selectTaskSchema = createSelectSchema(tasksTable);

export type CreateTask = InferInsertModel<typeof tasksTable>;
export type UpdateTask = Partial<CreateTask>;
