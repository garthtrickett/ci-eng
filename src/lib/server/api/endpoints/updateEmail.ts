import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { createValidationRequest } from '../common/createValidationRequest';
import type { LuciaProvider } from '../providers';
import type { HonoTypes } from '../types';

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
