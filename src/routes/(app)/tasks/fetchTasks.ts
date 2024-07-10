import { withClient } from '$lib/client/helpers/api';

export const fetchTasks = () => withClient((c) => c.api.tasks.$get());

export const createTask = (taskName: string) =>
	withClient((c) =>
		c.api.tasks.$put({
			json: {
				name: taskName
			}
		})
	);
