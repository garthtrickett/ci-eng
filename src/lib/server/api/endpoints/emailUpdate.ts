import { updateEmailDto } from '$lib/dtos/update-email.dto';
import { zValidator } from '@hono/zod-validator';
import { eq, type InferInsertModel } from 'drizzle-orm';
import handlebars from 'handlebars';
import { Hono } from 'hono';
import 'reflect-metadata';
import { generateTokenWithExpiryAndHash } from '../common/generateTokenWithExpiryAndHash';
import { getTemplate, send } from '../common/mail';
import { db } from '../infrastructure/database';
import { usersTable } from '../infrastructure/database/tables';
import { emailVerificationsTable } from '../infrastructure/database/tables/email-verifications.table';
import { takeFirstOrThrow } from '../infrastructure/database/utils';
import { type SendTemplate } from '../types';
import { requireAuth } from '../middleware/auth.middleware';

export type CreateEmailVerification = Pick<
	InferInsertModel<typeof emailVerificationsTable>,
	'requestedEmail' | 'hashedToken' | 'userId' | 'expiresAt'
>;

const app = new Hono().patch('/', requireAuth, zValidator('json', updateEmailDto), async (c) => {
	const data = c.req.valid('json');
	const { token, expiry, hashedToken } = await generateTokenWithExpiryAndHash(15, 'm');

	// c.var.user exists when i run code but errors in ide
	if (!c.var.user) {
		throw Error('User context not found');
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, c.var.user.id)
	});

	if (!user) {
		throw Error('User not found');
	}

	create({
		requestedEmail: data.email,
		userId: user.id,
		hashedToken: hashedToken,
		expiresAt: expiry
	});

	sendEmailVerificationToken({
		to: data.email,
		props: {
			token
		}
	});

	sendEmailChangeNotification({
		to: user.email,
		props: null
	});

	return c.json({ message: 'Verification email sent' });
});

export default app;

async function create(data: CreateEmailVerification) {
	return db
		.insert(emailVerificationsTable)
		.values(data)
		.onConflictDoUpdate({
			target: emailVerificationsTable.userId,
			set: data
		})
		.returning()
		.then(takeFirstOrThrow);
}

function sendEmailVerificationToken(data: SendTemplate<{ token: string }>) {
	const template = handlebars.compile(getTemplate('email-verification-token'));
	return send({
		to: data.to,
		subject: 'Email Verification',
		html: template({ token: data.props.token })
	});
}

function sendEmailChangeNotification(data: SendTemplate<null>) {
	const template = handlebars.compile(getTemplate('email-change-notice'));
	return send({
		to: data.to,
		subject: 'Email Change Notice',
		html: template(null)
	});
}
