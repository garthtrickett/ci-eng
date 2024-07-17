import { lucia } from '$lib/server/api/common/lucia';
import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { sha256 } from '@noble/hashes/sha2';
import { db } from '$lib/server/api/infrastructure/database';
import { usersTable } from '$lib/server/api/infrastructure/database/tables';
import { type CreateUser } from '$lib/server/api/infrastructure/database/tables';
import { eq } from 'drizzle-orm';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
		// keep in mind some database (e.g. mysql) are case insensitive
		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_.-]+$/.test(username)
		) {
			return fail(400, {
				message: 'Invalid username'
			});
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password'
			});
		}

		const userId = generateIdFromEntropySize(10); // 16 characters long
		const passwordHash = sha256(password); // Use sha256 to hash the password

		const existingUser = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.username, username));

		if (existingUser.length > 0) {
			throw new Error('Username is already used');
		}

		const newUser: CreateUser = {
			id: userId,
			username: username,
			email: `${username}@placeholder.com`,
			password_hash: Buffer.from(passwordHash).toString('hex') // Convert Uint8Array to hex string
		};

		await db.insert(usersTable).values(newUser);

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
