import { zod } from 'sveltekit-superforms/adapters';

import { updateEmailDto } from '$lib/dtos/update-email.dto';
import { verifyEmailDto } from '$lib/dtos/verify-email.dto';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { StatusCodes } from '$lib/constants/status-codes.js';
import { type PageServerLoad, type Actions } from '../$types';

export let load: PageServerLoad = async (event) => {
	const authedUser = await event.locals.getAuthedUserOrThrow();

	return {
		authedUser,
		updateEmailForm: await superValidate(authedUser, zod(updateEmailDto)),
		verifyEmailForm: await superValidate(zod(verifyEmailDto))
	};
};

export const actions: Actions = {
	updateEmail: async ({ request, locals }) => {
		const updateEmailForm = await superValidate(request, zod(updateEmailDto));

		if (!updateEmailForm.valid) return fail(StatusCodes.BAD_REQUEST, { updateEmailForm });

		const { error } = await locals.api.email.update
			.$patch({ json: updateEmailForm.data })
			.then(locals.parseApiResponse);
		if (error) {
			return setError(updateEmailForm, 'email', error);
		}
		return { updateEmailForm };
	},
	verifyEmail: async ({ request, locals }) => {
		const verifyEmailForm = await superValidate(request, zod(verifyEmailDto));

		if (!verifyEmailForm.valid) return fail(StatusCodes.BAD_REQUEST, { verifyEmailForm });
		const { error } = await locals.api.email.verification
			.$post({ json: verifyEmailForm.data })
			.then(locals.parseApiResponse);
		if (error) return setError(verifyEmailForm, 'token', error);
		return { verifyEmailForm };
	}
};
