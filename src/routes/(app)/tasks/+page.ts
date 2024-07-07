import type { PageLoad } from './$types';
import { makeClient } from '$lib/client/helpers/api';
import type { BrowserClient } from '$lib/client/helpers/api';

async function fetchTodos(client: BrowserClient) {
	try {
		const res = await client.api.tasks.$get();

		console.log("this doesn't run ");
		const data = await res.json();

		return data;
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

export const load: PageLoad = async (page) => {
	const { queryClient } = await page.parent();

	console.log('this runs');

	const client = makeClient(fetch);

	await queryClient.prefetchQuery({
		queryKey: ['todos'],
		queryFn: () => fetchTodos(client)
	});
};
