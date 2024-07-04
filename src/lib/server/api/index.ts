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
import { undoFinishTask } from './endpoints/undoFinishTask';
import { getAuthedUser } from './endpoints/getAuthedUser';
import { getTasks } from './endpoints/getTasks';

import { loginRequest } from './endpoints/loginRequest';
import { loginVerification } from './endpoints/loginVerification';
import { logout } from './endpoints/logout';
import { email } from './endpoints/email';
import { emailVerification } from './endpoints/emailVerification';

import { inject, injectable } from 'tsyringe';
import type { Controller } from './interfaces/controller.interface';

/* ----------------------------------- Api ---------------------------------- */
const app = new Hono().basePath('/api');

/* --------------------------- Global Middlewares --------------------------- */
app.use(verifyOrigin).use(validateAuthSession);

/* --------------------------------- Routes --------------------------------- */

@injectable()
export class RouteController implements Controller {
	//  TOO: RATE LIMIER ->  limiter({ limit: 10, minutes: 60 })

	controller = new Hono<HonoTypes>();
	routes() {
		createTask(this.controller, '/tasks');
		getTasks(this.controller, '/tasks');
		finishTask(this.controller, '/tasks/:id/finish');
		undoFinishTask(this.controller, '/tasks/:id/undo-finish');
		deleteTask(this.controller, '/tasks/:id/delete');

		getAuthedUser(this.controller, '/user');
		loginRequest(this.controller, '/login/request');
		loginVerification(this.controller, '/login/verification');
		logout(this.controller, '/logout');
		email(this.controller, '/email');
		emailVerification(this.controller, '/email/verification');

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
