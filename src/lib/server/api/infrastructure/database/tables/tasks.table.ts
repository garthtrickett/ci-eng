import { createId } from '@paralleldrive/cuid2';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { timestamps } from '../utils';

export const tasksTable = pgTable('tasks', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text('name').notNull(),
	done: boolean('done').notNull().default(false),
	...timestamps
});
