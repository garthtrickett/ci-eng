import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Discord } from 'arctic';
import { config } from './config';
import { sessionsTable } from '../infrastructure/database/tables/sessions.table';

import { db } from '../infrastructure/database';
import { usersTable } from '../infrastructure/database/tables/users.table';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionsTable, usersTable);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: config.isProduction
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			...attributes
		};
	}
});

interface DatabaseUserAttributes {
	id: string;
	email: string;
	avatar: string | null;
	verified: boolean;
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}
