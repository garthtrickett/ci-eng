import type { LayoutLoad } from './$types';
import { queryClient } from '$lib/client/helpers/tanstack';

export const load: LayoutLoad = async () => {
	return {
		queryClient
	};
};
