import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.table';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const sessionsTable = pgTable('sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [sessionsTable.userId],
		references: [usersTable.id]
	})
}));
