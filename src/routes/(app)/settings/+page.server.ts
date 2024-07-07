import { type PageServerLoad } from '../$types';
import { StatusCodes } from '$lib/constants/status-codes';
import { redirect } from '@sveltejs/kit';

export let load: PageServerLoad = async (event) => {
	const authedUser = await event.locals.getAuthedUserOrThrow();
	if (!authedUser) redirect(StatusCodes.SEE_OTHER, '/register');
};
