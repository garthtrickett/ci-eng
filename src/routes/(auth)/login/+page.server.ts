import { fail, redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { setError, superValidate } from 'sveltekit-superforms';

import { type CreateAuthCode } from '$lib/server/api/infrastructure/database/tables/authCodes.table';

import { sha256 } from '@noble/hashes/sha2';
import { generateRandomString } from '$lib/server/api/common/generateRandomString';

import { signInUsernameDto } from '$lib/dtos/signin-username.dto';
import { StatusCodes } from '$lib/constants/status-codes';
import { type ServerLoad } from '@sveltejs/kit';
import { type Actions } from '@sveltejs/kit';
import { usersTable } from '$lib/server/api/infrastructure/database/tables';
import { authCodesTable } from '$lib/server/api/infrastructure/database/tables/authCodes.table';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/api/infrastructure/database';
import { lucia } from '$lib/server/api/common/lucia';

export const load: ServerLoad = async () => {
	const usernameSignInForm = await superValidate(zod(signInUsernameDto));
	return { usernameSignInForm };
};

export const actions: Actions = {
	signin: async ({ request, cookies }) => {
		const usernameSignInForm = await superValidate(request, zod(signInUsernameDto));
		if (!usernameSignInForm.valid) return fail(StatusCodes.BAD_REQUEST, { usernameSignInForm });

		const { username, password, clientId, redirectUri, responseType, scope, state, nonce } =
			usernameSignInForm.data;

		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.username, String(username)));
		const user = users[0];

		if (!user) {
			const errorReturn = setError(usernameSignInForm, 'username', "Username doesn't exist");

			return { status: errorReturn.status, form: usernameSignInForm };
		}

		const hashedPassword = sha256(String(password));
		const hashedPasswordString = Buffer.from(hashedPassword).toString('hex');

		if (hashedPasswordString !== user.password_hash) {
			const errorReturn = setError(
				usernameSignInForm,
				'password',
				'Incorrect username or password'
			);

			return { status: errorReturn.status, form: usernameSignInForm };
		}

		const code = generateRandomString(16);

		const newCode: CreateAuthCode = {
			userId: user.id,
			code,
			nonce
		};
		await db.insert(authCodesTable).values(newCode);

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		const url = `${redirectUri}?code=${code}&state=${state}`;

		// commenting out this return fixes the type error on the +page.svelte
		return { usernameSignInForm, redirectUrl: url };
	}
};
