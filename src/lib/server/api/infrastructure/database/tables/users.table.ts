import { createId } from '@paralleldrive/cuid2';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { citext, timestamps } from '../utils';
import { relations } from 'drizzle-orm';
import { sessionsTable } from './sessions.table';
import { tokensTable } from './tokens.table';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { type InferInsertModel } from 'drizzle-orm';

export const usersTable = pgTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	avatar: text('avatar'),
	email: citext('email').notNull().unique(),
	verified: boolean('verified').notNull().default(false),
	...timestamps
});

export const usersRelations = relations(usersTable, ({ many }) => ({
	sessions: many(sessionsTable),
	tokens: many(tokensTable)
}));

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);

export type CreateUser = InferInsertModel<typeof usersTable>;
export type UpdateUser = Partial<CreateUser>;
