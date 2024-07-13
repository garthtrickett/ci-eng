import { fail, redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { setError, superValidate } from 'sveltekit-superforms';

import { signInUsernameDto } from '$lib/dtos/signin-username.dto';
import { StatusCodes } from '$lib/constants/status-codes';
import { type ServerLoad } from '@sveltejs/kit';
import { type Actions } from '@sveltejs/kit';

export const load: ServerLoad = async () => {
	return {
		usernameSignInForm: await superValidate(zod(signInUsernameDto))
	};
};

export const actions: Actions = {
	signin: async ({ locals, request }) => {
		const usernameSignInForm = await superValidate(request, zod(signInUsernameDto));
		if (!usernameSignInForm.valid) return fail(StatusCodes.BAD_REQUEST, { usernameSignInForm });
		const { error } = await locals.api.login.request
			.$post({ json: usernameSignInForm.data })
			.then(locals.parseApiResponse);
		if (error) {
			const errorReturn = setError(usernameSignInForm, 'username', 'No idea why this works');

			return { status: errorReturn.status, form: usernameSignInForm };
		}
	}
};
