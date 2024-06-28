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
import { type SendTemplate } from '../types';
import handlebars from 'handlebars';
import { send, getTemplate } from '../common/mail';

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
			console.log("shouldn't go here");
		}
		// TODO: need to put in th email send code here

		if (!validationToken) {
			throw c.json({ message: 'Validation token was not created' }, 404);
		}

		sendEmailVerification({
			to: email,
			props: { token: validationToken.token }
		});

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
	return token;
}

async function sendEmailVerification(data: SendTemplate<{ token: string }>) {
	const template = handlebars.compile(getTemplate('email-verification'));
	return await send({
		to: data.to,
		subject: 'Email Verification',
		html: template({ token: data.props.token })
	});
}
