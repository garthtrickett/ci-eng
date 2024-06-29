import { tokensTable } from '../infrastructure/database/tables';
import { db } from '../infrastructure/database';
import { eq } from 'drizzle-orm';
import { takeFirstOrThrow } from '../infrastructure/database/utils';

export async function validateToken(userId: string, token: string) {
	const foundToken = await db.transaction(async (tx) => {
		const foundToken = await tx.query.tokensTable.findFirst({
			where: eq(tokensTable.token, token)
		});

		if (foundToken) {
			await tx
				.delete(tokensTable)
				.where(eq(tokensTable.id, foundToken.id))
				.returning()
				.then(takeFirstOrThrow);
		}
		return foundToken;
	});

	if (!foundToken) {
		return false;
	}

	if (foundToken.userId !== userId) {
		return false;
	}

	if (foundToken.expiresAt < new Date()) {
		return false;
	}

	return foundToken;
}
