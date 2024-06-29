import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { createValidationRequest } from '../common/createValidationRequest';
import type { LuciaProvider } from '../providers';
import type { HonoTypes } from '../types';
import { db } from '../infrastructure/database';
import { eq } from 'drizzle-orm';
import { usersTable } from '../infrastructure/database/tables';
import { BadRequest } from '../common/errors';
import { validateToken } from '../common/validateToken';
import { type UpdateUser } from '../infrastructure/database/tables';
import { takeFirstOrThrow } from '../infrastructure/database/utils';

export function verifyEmail(honoController: Hono<HonoTypes>, path: string, lucia: LuciaProvider) {
	const verifyEmailDto = z.object({
		token: z.string()
	});

	return honoController.post(path, zValidator('json', verifyEmailDto), async (c) => {
		const data = c.req.valid('json');

		if (!c.var.user) {
			throw BadRequest('User not found in context');
		}

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, c.var.user.id)
		});

		if (!user) {
			throw BadRequest('User not found');
		}

		const validToken = await validateToken(user.id, data.token);

		if (!validToken) {
			throw BadRequest('Invalid token');
		}

		await db
			.update(usersTable)
			.set({ email: validToken.email } as UpdateUser)
			.where(eq(usersTable.id, user.id))
			.returning()
			.then(takeFirstOrThrow);

		return c.json({ message: 'Verified and updated' });
	});
}
