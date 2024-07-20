import { pgTable, text } from 'drizzle-orm/pg-core';
import { usersTable } from './users.table';
import { relations } from 'drizzle-orm';
import { cuid2 } from '../utils';
import { timestamps } from '../utils';
import { createId } from '@paralleldrive/cuid2';

import { type InferInsertModel } from 'drizzle-orm';

export const authCodesTable = pgTable('auth_codes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	code: text('code').notNull(),
	nonce: text('nonce').notNull(),
	...timestamps
});

export const authCodesRelations = relations(authCodesTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [authCodesTable.userId],
		references: [usersTable.id]
	})
}));

export type CreateAuthCode = InferInsertModel<typeof authCodesTable>;
export type UpdateAuthCode = Partial<CreateAuthCode>;
