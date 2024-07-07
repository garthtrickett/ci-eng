import 'reflect-metadata';
import { Hono } from 'hono';
import { validateAuthSession, verifyOrigin } from './middleware/auth.middleware';

import createTask from './endpoints/createTask';
import deleteTask from './endpoints/deleteTask';
import finishTask from './endpoints/finishTask';
import undoFinishTask from './endpoints/undoFinishTask';
import getTasks from './endpoints/getTasks';

import getAuthedUser from './endpoints/getAuthedUser';

import loginRequest from './endpoints/loginRequest';
import loginVerification from './endpoints/loginVerification';
import logout from './endpoints/logout';
import emailUpdate from './endpoints/emailUpdate';
import emailVerification from './endpoints/emailVerification';

/* ----------------------------------- Api ---------------------------------- */

const app = new Hono().basePath('/api');

/* --------------------------- Global Middlewares --------------------------- */

app.use(verifyOrigin).use(validateAuthSession);

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

	.route('/login/request', loginRequest)
	.route('/login/verification', loginVerification)
	.route('/logout', logout);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */
export type ApiRoutes = typeof routes;
export { routes };
export { app };
