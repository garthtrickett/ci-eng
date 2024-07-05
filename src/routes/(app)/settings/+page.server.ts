export let load = async (event) => {
	const authedUser = await event.locals.getAuthedUserOrThrow();
	if (!authedUser) redirect(StatusCodes.SEE_OTHER, '/register');
};
