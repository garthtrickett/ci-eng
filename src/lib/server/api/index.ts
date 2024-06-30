import 'reflect-metadata';
import { Hono } from 'hono';
import { hc } from 'hono/client';
import { container } from 'tsyringe';
import { config } from './common/config';
import { validateAuthSession, verifyOrigin } from './middleware/auth.middleware';
import type { HonoTypes } from './types';

import { createTask } from './endpoints/createTask';
import { deleteTask } from './endpoints/deleteTask';
import { finishTask } from './endpoints/finishTask';
import { getAuthedUser } from './endpoints/getAuthedUser';
import { getTasks } from './endpoints/getTasks';
import { logout } from './endpoints/logout';
import { registerEmail } from './endpoints/registerEmail';
import { signInEmail } from './endpoints/signInEmail';
import { undoFinishTask } from './endpoints/undoFinishTask';
import { updateEmail } from './endpoints/updateEmail';
import { verifyEmail } from './endpoints/verifyEmail';

import { inject, injectable } from 'tsyringe';
import type { Controller } from './interfaces/controller.interface';

/* ----------------------------------- Api ---------------------------------- */
const app = new Hono().basePath('/api');

/* --------------------------- Global Middlewares --------------------------- */
app.use(verifyOrigin).use(validateAuthSession);

/* --------------------------------- Routes --------------------------------- */

@injectable()
export class RouteController implements Controller {
	// Make Lucia available here then pass in

	controller = new Hono<HonoTypes>();
	routes() {
		createTask(this.controller, '/tasks');
		getTasks(this.controller, '/tasks');
		finishTask(this.controller, '/tasks/:id/finish');
		undoFinishTask(this.controller, '/tasks/:id/undo-finish');
		deleteTask(this.controller, '/tasks/:id/delete');

		getAuthedUser(this.controller, '/user');
		registerEmail(this.controller, '/email/register');
		signInEmail(this.controller, '/email/signin');
		verifyEmail(this.controller, '/email/verify');
		updateEmail(this.controller, '/email/update');
		logout(this.controller, '/logout');

		return this.controller;
	}
}

const routes = app.route('/', container.resolve(RouteController).routes());

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */
export const rpc = hc<typeof routes>(config.ORIGIN);
export type ApiClient = typeof rpc;
export type ApiRoutes = typeof routes;
export { app };
