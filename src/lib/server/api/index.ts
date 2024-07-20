import 'reflect-metadata';
import { Hono } from 'hono';
import { validateAuthSession, verifyOrigin } from './middleware/auth.middleware';

import createTask from './endpoints/createTask';
import deleteTask from './endpoints/deleteTask';
import finishTask from './endpoints/finishTask';
import undoFinishTask from './endpoints/undoFinishTask';
import getTasks from './endpoints/getTasks';

import getAuthedUser from './endpoints/getAuthedUser';
import { cors } from 'hono/cors';

import loginRequest from './endpoints/loginRequest';
import loginVerification from './endpoints/loginVerification';
import logout from './endpoints/logout';
import emailUpdate from './endpoints/emailUpdate';
import emailVerification from './endpoints/emailVerification';
import oidcAuthorize from './endpoints/oidcAuthorize';
import createAuthState from './endpoints/createAuthState';
import { logger } from 'hono/logger';

/* ----------------------------------- Api ---------------------------------- */

const app = new Hono().basePath('/api');

/* --------------------------- Global Middlewares --------------------------- */

// app.use(verifyOrigin).use(validateAuthSession);
// temporarily disabled verifyOrigin
app.use(validateAuthSession);
app.use(logger());

app.use(
	'/*',
	cors({
		origin: [
			'http://localhost:5173',
			'http://localhost:80',
			'http://host.docker.internal:80',
			'http://host.docker.internal:5173'
		], // Replace with your allowed domains

		allowMethods: ['POST'],
		allowHeaders: ['Content-Type']
		// credentials: true, // If you need to send cookies or HTTP authentication
	})
);

/* --------------------------------- Routes --------------------------------- */

const routes = app
	.route('/tasks', getTasks)
	.route('/tasks', createTask)
	.route('/tasks/:id/finish', finishTask)
	.route('/tasks/:id/undo-finish', undoFinishTask)
	.route('/tasks/:id/delete', deleteTask)

	.route('/email/update', emailUpdate)
	.route('/email/verification', emailVerification)

	.route('/user', getAuthedUser)
	.route('/oauth2', oidcAuthorize)
	.route('/createauthstate', createAuthState)

	.route('/login/request', loginRequest)
	.route('/login/verification', loginVerification)
	.route('/logout', logout);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */
export type ApiRoutes = typeof routes;
export { routes };
export { app };
