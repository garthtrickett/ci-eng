import { StatusCodes } from '$lib/constants/status-codes';
import { redirect } from '@sveltejs/kit';
import { type Actions, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	const user = await locals.getAuthedUser();

	return { user: user };
};
