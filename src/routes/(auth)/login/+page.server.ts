import { fail, redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { signInEmailDto } from '$lib/dtos/signin-email.dto';
import { setError, superValidate } from 'sveltekit-superforms';
import { registerEmailDto } from '$lib/dtos/register-email.dto';
import { StatusCodes } from '$lib/constants/status-codes';
import { type ServerLoad } from '@sveltejs/kit';
import { type Actions } from '@sveltejs/kit';

export const load: ServerLoad = async () => {
	return {
		emailRegisterForm: await superValidate(zod(registerEmailDto)),
		emailSigninForm: await superValidate(zod(signInEmailDto))
	};
};

export const actions: Actions = {
	register: async ({ locals, request }) => {
		const emailRegisterForm = await superValidate(request, zod(registerEmailDto));
		if (!emailRegisterForm.valid) return fail(StatusCodes.BAD_REQUEST, { emailRegisterForm });
		const { error } = await locals.api.login.request
			.$post({ json: emailRegisterForm.data })
			.then(locals.parseApiResponse);
		if (error) return setError(emailRegisterForm, 'email', error);
		return { emailRegisterForm };
	},
	signin: async ({ locals, request }) => {
		const emailSignInForm = await superValidate(request, zod(signInEmailDto));

		if (!emailSignInForm.valid) {
			return fail(StatusCodes.BAD_REQUEST, { emailSignInForm });
		}
		const { error } = await locals.api.login.verification
			.$post({ json: emailSignInForm.data })
			.then(locals.parseApiResponse);
		if (error) {
			return setError(emailSignInForm, 'token', error);
		}

		redirect(301, '/');
	}
};
