import { type ServerLoad } from '@sveltejs/kit';
import { StatusCodes } from '$lib/constants/status-codes';
import { redirect } from '@sveltejs/kit';

export let load: ServerLoad = async (event) => {
	const authedUser = await event.locals.getAuthedUserOrThrow();
	if (!authedUser) redirect(StatusCodes.SEE_OTHER, '/register');
};
