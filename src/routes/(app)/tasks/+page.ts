import type { PageLoad } from './$types';

import { fetchTasks } from './fetchTasks';

export const load: PageLoad = async (page) => {
	const { queryClient } = await page.parent();
	await queryClient.prefetchQuery({
		queryKey: ['todos'],
		queryFn: () => fetchTasks()
	});
};
