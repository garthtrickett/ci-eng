import {
	experimental_createPersister,
	type AsyncStorage,
	type PersistedQuery
} from '@tanstack/query-persist-client-core';
import { QueryClient } from '@tanstack/svelte-query';
import { get, set, del, createStore, type UseStore } from 'idb-keyval';

import { browser } from '$app/environment';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 5,
			persister: browser
				? experimental_createPersister<PersistedQuery>({
						storage: createIndexedDbStorage(createStore('example', 'exampleCache')),
						maxAge: 1000 * 60 * 60 * 24 * 20,
						serialize: (query) => query,
						deserialize: (cached) => cached
					})
				: undefined
		}
	}
});

function createIndexedDbStorage(idbStore: UseStore): AsyncStorage<PersistedQuery> {
	return {
		getItem: async (key) => await get(key, idbStore),
		setItem: async (key, value) => await set(key, value, idbStore),
		removeItem: async (key) => await del(key, idbStore)
	};
}
