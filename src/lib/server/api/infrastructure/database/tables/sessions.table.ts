import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.table';
import { relations } from 'drizzle-orm';
import { cuid2 } from '../utils';
import { timestamps } from '../utils';

export const sessionsTable = pgTable('sessions', {
	id: cuid2('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull(),

	...timestamps
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [sessionsTable.userId],
		references: [usersTable.id]
	})
}));
