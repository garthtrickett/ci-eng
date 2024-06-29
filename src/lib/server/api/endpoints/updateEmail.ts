import { Hono } from 'hono';
import { usersTable } from '../infrastructure/database/tables/users.table'; // Import your db instance
import { tokensTable } from '../infrastructure/database/tables/tokens.table'; // Import your db instance
import { db } from '../infrastructure/database';
import type { HonoTypes } from '../types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
	type CreateUser,
	type UpdateUser,
	insertUserSchema
} from '../infrastructure/database/tables/users.table';
import { eq } from 'drizzle-orm';
import { takeFirstOrThrow } from '../infrastructure/database/utils';
import { type SendTemplate } from '../types';
import handlebars from 'handlebars';
import { send, getTemplate } from '../common/mail';
import type { LuciaProvider } from '../providers';
import { setCookie } from 'hono/cookie';
import { BadRequest } from '../common/errors';
import { createValidationRequest } from '../common/createValidationRequest';

// TODO: perhaps move stuff like takeFirstOrThrow into common

export function updateEmail(honoController: Hono<HonoTypes>, path: string, lucia: LuciaProvider) {
	const updateEmailDto = z.object({
		email: z.string().email()
	});

	return honoController.post(path, zValidator('json', updateEmailDto), async (c) => {
		const data = c.req.valid('json');
		const user = c.var.user;
		let validationToken;
		if (user) {
			validationToken = await createValidationRequest(user.id, data.email);
		}
		if (!validationToken) {
			throw c.json({ message: 'Token not created and email not updated' }, 404);
		}

		return c.json({ message: 'Verification email sent' });
	});
}
