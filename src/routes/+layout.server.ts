import { type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	const authedUser = await locals.getAuthedUser();
	return {
		authedUser
	};
};
