import { Hono } from 'hono';
import { usersTable } from '../infrastructure/database/tables/users.table'; // Import your db instance
import { tokensTable } from '../infrastructure/database/tables/tokens.table'; // Import your db instance
import { db } from '../infrastructure/database';
import type { HonoTypes } from '../types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { type CreateUser, insertUserSchema } from '../infrastructure/database/tables/users.table';
import { eq } from 'drizzle-orm';
import { takeFirstOrThrow } from '../infrastructure/database/utils';
import { type SendTemplate } from '../types';
import { createValidationRequest } from '../common/createValidationRequest';
// TODO: perhaps move stuff like takeFirstOrThrow into common

export function registerEmail(honoController: Hono<HonoTypes>, path: string) {
	const registerEmailDto = insertUserSchema.pick({ email: true });

	type RegisterEmailDto = z.infer<typeof registerEmailDto>;

	return honoController.post(path, zValidator('json', registerEmailDto), async (c) => {
		const { email } = c.req.valid('json');

		const existingUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.email, email)
		});

		let validationToken;
		if (existingUser) {
			validationToken = await createValidationRequest(existingUser.id, existingUser.email);
		}
		if (!existingUser) {
			const data: CreateUser = { email, verified: false };
			const newUser = await db.insert(usersTable).values(data).returning().then(takeFirstOrThrow);
			validationToken = await createValidationRequest(newUser.id, newUser.email);
		}
		if (!validationToken) {
			throw c.json({ message: 'Token not created and verification email not sent' }, 404);
		}
		return c.json({ message: 'Verification email sent' });
	});
}
