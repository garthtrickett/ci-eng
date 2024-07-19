import { verifyEmailDto } from '$lib/dtos/verify-email.dto';
import { zValidator } from '@hono/zod-validator';
import { and, eq, gte } from 'drizzle-orm';
import { Hono } from 'hono';
import { Scrypt } from 'oslo/password';
import 'reflect-metadata';
import { BadRequest } from '../common/errors';
import { db } from '../infrastructure/database';
import { emailVerificationsTable, usersTable } from '../infrastructure/database/tables';
import { takeFirst, takeFirstOrThrow } from '../infrastructure/database/utils';
import { requireAuth } from '../middleware/auth.middleware';

const app = new Hono().post('/', requireAuth, zValidator('json', verifyEmailDto), async (c) => {
	const { token } = c.req.valid('json');

	if (!c.var.user) {
		throw BadRequest('User not found in context');
	}

	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, c.var.user.id)
	});

	if (!user) {
		throw BadRequest('User not found');
	}
	await processEmailVerificationRequest(c.var.user.id, token);

	return c.json({ message: 'Verified and updated' });
});

export default app;

async function processEmailVerificationRequest(userId: string, token: string) {
	const validRecord = await findAndBurnEmailVerificationToken(userId, token);
	if (!validRecord) throw BadRequest('Invalid token');

	await db
		.update(usersTable)
		.set({ email: validRecord.requestedEmail, verified: true })
		.where(eq(usersTable.id, userId))
		.returning()
		.then(takeFirstOrThrow);
}

async function findAndBurnEmailVerificationToken(userId: string, token: string) {
	return db.transaction(async (trx) => {
		const emailVerificationRecord = await trx
			.select()
			.from(emailVerificationsTable)
			.where(
				and(
					eq(emailVerificationsTable.userId, userId),
					gte(emailVerificationsTable.expiresAt, new Date())
				)
			)
			.then(takeFirst);

		if (!emailVerificationRecord) {
			return null;
		}
		// check if the token is valid
		const hasher = new Scrypt();

		const isValidRecord = await hasher.verify(emailVerificationRecord.hashedToken, token);

		if (!isValidRecord) return null;

		// burn the token if it is valid

		await trx
			.delete(emailVerificationsTable)
			.where(eq(emailVerificationsTable.id, emailVerificationRecord.id));
		return emailVerificationRecord;
	});
}
