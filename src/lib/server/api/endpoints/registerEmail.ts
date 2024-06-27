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
import { customAlphabet } from 'nanoid';
import dayjs from 'dayjs';
// TODO: perhaps move stuff like takeFirstOrThrow into common

export function registerEmail(honoController: Hono<HonoTypes>, path: string) {
	const registerEmailDto = insertUserSchema.pick({ email: true });

	type RegisterEmailDto = z.infer<typeof registerEmailDto>;

	return honoController.post('/email/register', zValidator('json', registerEmailDto), async (c) => {
		const { email } = c.req.valid('json');

		const existingUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.email, email)
		});

		if (existingUser) {
			await createValidationRequest(existingUser.id, existingUser.email);
		}
		if (!existingUser) {
			const data: CreateUser = { email, verified: false };
			const newUser = await db.insert(usersTable).values(data).returning().then(takeFirstOrThrow);
			await createValidationRequest(newUser.id, newUser.email);
		}
		// TODO: need to put in th email send code here

		return c.json({ message: 'Verification email sent' });
	});
}

async function createValidationRequest(userId: string, email: string) {
	function generateToken() {
		const tokenAlphabet = '123456789ACDEFGHJKLMNPQRSTUVWXYZ'; // O and I removed for readability
		return customAlphabet(tokenAlphabet, 6)();
	}

	const tokenCreationData = {
		userId: userId,
		email,
		token: generateToken(),
		expiresAt: dayjs().add(15, 'minutes').toDate()
	};
	const token = db.insert(tokensTable).values(tokenCreationData).returning().then(takeFirstOrThrow);
}
