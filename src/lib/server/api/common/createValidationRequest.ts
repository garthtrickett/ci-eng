import { generateRandomString, alphabet } from 'oslo/crypto';
import dayjs from 'dayjs';
import { tokensTable } from '../infrastructure/database/tables/tokens.table'; // Import your db instance
import { takeFirstOrThrow } from '../infrastructure/database/utils';
import { db } from '../infrastructure/database';
import { type SendTemplate } from '../types';
import handlebars from 'handlebars';
import { send, getTemplate } from '../common/mail';

export async function createValidationRequest(userId: string, email: string) {
	function generateToken() {
		const alphabet = '23456789ACDEFGHJKLMNPQRSTUVWXYZ'; // alphabet with removed look-alike characters (0, 1, O, I)
		return generateRandomString(6, alphabet);
	}
	const tokenCreationData = {
		userId: userId,
		email,
		token: generateToken(),
		expiresAt: dayjs().add(15, 'minutes').toDate()
	};
	const validationToken = await db
		.insert(tokensTable)
		.values(tokenCreationData)
		.returning()
		.then(takeFirstOrThrow);

	if (validationToken) {
		sendEmailVerification({
			to: email,
			props: { token: validationToken.token }
		});
		return validationToken;
	}
}

async function sendEmailVerification(data: SendTemplate<{ token: string }>) {
	const template = handlebars.compile(getTemplate('email-verification'));
	return await send({
		to: data.to,
		subject: 'Email Verification',
		html: template({ token: data.props.token })
	});
}
