import { Middleware } from 'hono';

export const ProviderMiddleware: Middleware = async (ctx, next) => {
	// Initiate the OAuth2 flow
	// Handle the OAuth2 provider's callback
	// Set the authenticated user's information in the session

	await next();
};
