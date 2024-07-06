import type { ClientResponse } from 'hono/client';
import type { ApiRoutes } from '$lib/server/api/index';
import { hc } from 'hono/client';

export const rpc = hc<ApiRoutes>('/');

export async function parseApiResponse<T>(response: ClientResponse<T>) {
	if (response.status === 204 || response.headers.get('Content-Length') === '0') {
		return response.ok
			? { data: null, error: null, response }
			: { data: null, error: 'An unknown error has occured', response };
	}

	if (response.ok) {
		const data = (await response.json()) as T;

		return { data, error: null, status: response.status };
	}

	// handle errors
	let error = await response.text();
	try {
		error = JSON.parse(error); // attempt to parse as JSON
	} catch {
		// noop
		return { data: null, error, response };
	}
	return { data: null, error, response };
}
