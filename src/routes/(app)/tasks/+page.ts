import type { PageLoad } from './$types';

import { withClient } from '$lib/client/helpers/api';

export const load: PageLoad = async (page) => {
	const { queryClient } = await page.parent();
	await queryClient.prefetchQuery({
		queryKey: ['tasksGet'],
		queryFn: () => withClient((c) => c.api.tasks.$get())
	});
};
