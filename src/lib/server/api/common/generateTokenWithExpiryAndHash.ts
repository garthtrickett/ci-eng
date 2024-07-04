import { generateRandomString } from 'oslo/crypto';
import { TimeSpan, createDate, type TimeSpanUnit } from 'oslo';
import { Scrypt } from 'oslo/password';

export async function generateTokenWithExpiryAndHash(number: number, lifespan: TimeSpanUnit) {
	function generateToken() {
		const alphabet = '23456789ACDEFGHJKLMNPQRSTUVWXYZ'; // alphabet with removed look-alike characters (0, 1, O, I)
		return generateRandomString(6, alphabet);
	}
	const token = generateToken();
	const hasher = new Scrypt();
	const hashedToken = await hasher.hash(token);
	return {
		token,
		hashedToken,
		expiry: createDate(new TimeSpan(number, lifespan))
	};
}
