import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '$lib/config';
import * as schema from './tables';

config.PGPASSWORD = decodeURIComponent(config.PGPASSWORD);

const client = postgres({
	host: config.PGHOST,
	database: config.PGDATABASE,
	username: config.PGUSER,
	password: config.PGPASSWORD,
	port: 5432,
	ssl: 'require',
	connection: {
		options: `project=${config.ENDPOINT_ID}`
	}
});

export const db = drizzle(client, { schema });
