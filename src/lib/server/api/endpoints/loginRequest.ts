import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { db } from '../infrastructure/database';
import type { HonoTypes } from '../types';
import { registerEmailDto } from '$lib/dtos/register-email.dto';
import { takeFirstOrThrow } from '../infrastructure/database/utils';
import { type SendTemplate } from '../types';
import { type InferInsertModel } from 'drizzle-orm';
import handlebars from 'handlebars';
import { generateTokenWithExpiryAndHash } from '../common/generateTokenWithExpiryAndHash';
import { getTemplate, send } from '../common/mail';
import { loginRequestsTable } from '../infrastructure/database/tables';

export type CreateLoginRequest = Pick<
	InferInsertModel<typeof loginRequestsTable>,
	'email' | 'expiresAt' | 'hashedToken'
>;

export function loginRequest(honoController: Hono<HonoTypes>, path: string) {
	return honoController.post(path, zValidator('json', registerEmailDto), async (c) => {
		const { email } = c.req.valid('json');

		const { token, expiry, hashedToken } = await generateTokenWithExpiryAndHash(15, 'm');

		await create({ email: email, hashedToken, expiresAt: expiry });

		await sendLoginRequest({
			to: email,
			props: { token: token }
		});

		return c.json({ message: 'Verification email sent' });
	});
}

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

function sendLoginRequest(data: SendTemplate<{ token: string }>) {
	const template = handlebars.compile(getTemplate('email-verification-token'));
	return send({
		to: data.to,
		subject: 'Login Request',
		html: template({ token: data.props.token })
	});
}
