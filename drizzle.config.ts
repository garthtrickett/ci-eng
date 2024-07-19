import type { Config } from 'drizzle-kit';

export default {
	out: './src/lib/server/api/infrastructure/database/migrations',
	schema: './src/lib/server/api/infrastructure/database/tables/*.table.ts',
	breakpoints: false,
	strict: true,
	dialect: 'postgresql',
	dbCredentials: {
		host: String(process.env.PGHOST),
		database: String(process.env.PGDATABASE),
		user: String(process.env.PGUSER),
		password: String(process.env.PGPASSWORD),
		port: 5432,
		ssl: true
	},
	migrations: {
		table: 'migrations',
		schema: 'public'
	}
} satisfies Config;
