import { redirect } from '@sveltejs/kit';

export const actions = {
	register: async ({ locals, request }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString()!;

		await locals.api.email.register.$post({ json: { email } });
		redirect(301, `/register?verify=true&email=${email}`);
	},
	signin: async ({ locals, request }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString()!;
		const token = data.get('token')?.toString()!;

		await locals.api.email.signin.$post({ json: { email, token } });
		redirect(301, '/');
	},
	logout: async ({ locals, request }) => {
		await locals.api.logout.$post();
		redirect(301, '/');
	}
};
