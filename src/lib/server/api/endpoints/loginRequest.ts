import 'reflect-metadata';

import { Hono } from 'hono';
import { usersTable } from '../infrastructure/database/tables/users.table'; // Import your db instance
import { db } from '../infrastructure/database';
import type { HonoTypes } from '../types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { type CreateUser, insertUserSchema } from '../infrastructure/database/tables/users.table';

import { takeFirstOrThrow } from '../infrastructure/database/utils';
import { type SendTemplate } from '../types';
import { createValidationRequest } from '../common/createValidationRequest';
import { registerEmailDto } from '$lib/dtos/register-email.dto';

import { and, eq, gte, type InferInsertModel } from 'drizzle-orm';
import { TimeSpan, createDate, type TimeSpanUnit } from 'oslo';
import { Scrypt } from 'oslo/password';
import { generateRandomString } from 'oslo/crypto';
import { loginRequestsTable } from '../infrastructure/database/tables';
import handlebars from 'handlebars';
import { getTemplate } from '../common/mail';
import { send } from '../common/mail';
import { generateTokenWithExpiryAndHash } from '../common/generateTokenWithExpiryAndHash';

// TODO: perhaps move stuff like takeFirstOrThrow into common

export type CreateLoginRequest = Pick<
	InferInsertModel<typeof loginRequestsTable>,
	'email' | 'expiresAt' | 'hashedToken'
>;

export function loginRequest(honoController: Hono<HonoTypes>, path: string) {
	return honoController.post(path, zValidator('json', registerEmailDto), async (c) => {
		const { email } = c.req.valid('json');

		const { token, expiry, hashedToken } = await generateTokenWithExpiryAndHash(15, 'm');

		async function create(data: CreateLoginRequest) {
			return db
				.insert(loginRequestsTable)
				.values(data)
				.onConflictDoUpdate({
					target: loginRequestsTable.email,
					set: data
				})
				.returning()
				.then(takeFirstOrThrow);
		}

		await create({ email: email, hashedToken, expiresAt: expiry });

		function sendLoginRequest(data: SendTemplate<{ token: string }>) {
			const template = handlebars.compile(getTemplate('email-verification-token'));
			return send({
				to: data.to,
				subject: 'Login Request',
				html: template({ token: data.props.token })
			});
		}
		return c.json({ message: 'Verification email sent' });
	});
}
