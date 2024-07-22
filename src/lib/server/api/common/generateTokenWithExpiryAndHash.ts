import { scryptAsync } from '@noble/hashes/scrypt';
import { randomBytes } from 'crypto';

function generateRandomString(length: number, alphabet: string): string {
	const randomBytesArray = randomBytes(length);
	return Array.from(randomBytesArray, (byte) => alphabet[byte % alphabet.length]).join('');
}

type TimeSpanUnit = 'seconds' | 'minutes' | 'hours' | 'days';

function createDateFromNow(timespan: number, unit: TimeSpanUnit): Date {
	const unitsInMilliseconds: Record<TimeSpanUnit, number> = {
		seconds: 1000,
		minutes: 1000 * 60,
		hours: 1000 * 60 * 60,
		days: 1000 * 60 * 60 * 24
	};
	return new Date(Date.now() + timespan * unitsInMilliseconds[unit]);
}

export async function generateTokenWithExpiryAndHash(number: number, lifespan: TimeSpanUnit) {
	function generateToken() {
		const alphabet = '23456789ACDEFGHJKLMNPQRSTUVWXYZ'; // Alphabet without look-alike characters (0, 1, O, I)
		return generateRandomString(6, alphabet);
	}

	const token = generateToken();
	const salt = randomBytes(16); // Generate a random salt
	const hashedToken = await scryptAsync(token, salt, { N: 2 ** 14, r: 8, p: 1, dkLen: 64 });

	return {
		token,
		hashedToken: Buffer.concat([salt, Buffer.from(hashedToken)]).toString('hex'), // Store salt and hashed token together
		expiry: createDateFromNow(number, lifespan)
	};
}

export async function verifyToken(token: string, storedHash: string): Promise<boolean> {
	const storedBuffer = Buffer.from(storedHash, 'hex');
	const salt = storedBuffer.subarray(0, 16); // Extract the salt using subarray
	const hash = storedBuffer.subarray(16); // Extract the hashed token using subarray

	const tokenHash = await scryptAsync(token, salt, { N: 2 ** 14, r: 8, p: 1, dkLen: 64 });
	return Buffer.from(tokenHash).equals(hash);
}
