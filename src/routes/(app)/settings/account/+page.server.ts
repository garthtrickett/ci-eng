import { zod } from 'sveltekit-superforms/adapters';


import { updateEmailDto } from '$lib/dtos/update-email.dto';}
import { verifyEmailDto } from '$lib/dtos/verify-email.dto';}
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { StatusCodes } from '$lib/constants/status-codes.js';

export let load = async (event) => {
  const authedUser = await event.locals.getAuthedUserOrThrow();

  return {
    authedUser,
    updateEmailForm: await superValidate(authedUser, zod(updateEmailDto)),
    verifyEmailForm: await superValidate(zod(verifyEmailDto))
  };
};

export const actions = {
  updateEmail: async ({ request, locals }) => {
    const updateEmailForm = await superValidate(request, zod(updateEmailDto));
    if (!updateEmailForm.valid) return fail(StatusCodes.BAD_REQUEST, { updateEmailForm });
    const { error } = await locals.api.iam.email
      .$patch({ json: updateEmailForm.data })
      .then(locals.parseApiResponse);
    if (error) return setError(updateEmailForm, 'email', error);
    return { updateEmailForm };
  },
  verifyEmail: async ({ request, locals }) => {
    const verifyEmailForm = await superValidate(request, zod(verifyEmailDto));
    console.log(verifyEmailForm);
    if (!verifyEmailForm.valid) return fail(StatusCodes.BAD_REQUEST, { verifyEmailForm });
    const { error } = await locals.api.iam.email.verification
      .$post({ json: verifyEmailForm.data })
      .then(locals.parseApiResponse);
    if (error) return setError(verifyEmailForm, 'token', error);
    return { verifyEmailForm };
  }
};
