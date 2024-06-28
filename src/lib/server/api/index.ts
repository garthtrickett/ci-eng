import 'reflect-metadata';
import './providers';
import { Hono } from 'hono';
import type { HonoTypes } from './types';
import { hc } from 'hono/client';
import { container } from 'tsyringe';
import { processAuth } from './middleware/process-auth.middleware';
import { IamController } from '$lib/server/api/controllers/iam.controller';
import { config } from './common/config';
import { finishTask } from './endpoints/finishTask';
import { undoFinishTask } from './endpoints/undoFinishTask';
import { createTask } from './endpoints/createTask';
import { getTasks } from './endpoints/getTasks';
import { deleteTask } from './endpoints/deleteTask';
import { getAuthedUser } from './endpoints/getAuthedUser';
import { signInEmail } from './endpoints/signInEmail';
import type { Controller } from './interfaces/controller.interface';
import { registerEmail } from './endpoints/registerEmail';
import { inject, injectable } from 'tsyringe';
import { LuciaProvider } from './providers/lucia.provider';
/* -------------------------------------------------------------------------- */
/*                               Client Request                               */
/* ------------------------------------ ▲ ----------------------------------- */
/* ------------------------------------ | ----------------------------------- */
/* ------------------------------------ ▼ ----------------------------------- */
/*                                 Controller                                 */
/* ---------------------------- (Request Routing) --------------------------- */
/* ------------------------------------ ▲ ----------------------------------- */
/* ------------------------------------ | ----------------------------------- */
/* ------------------------------------ ▼ ----------------------------------- */
/*                                   Service                                  */
/* ---------------------------- (Business logic) ---------------------------- */
/* ------------------------------------ ▲ ----------------------------------- */
/* ------------------------------------ | ----------------------------------- */
/* ------------------------------------ ▼ ----------------------------------- */
/*                                 Repository                                 */
/* ----------------------------- (Data storage) ----------------------------- */
/* -------------------------------------------------------------------------- */

/* ----------------------------------- Api ---------------------------------- */
const app = new Hono().basePath('/api');

/* --------------------------- Global Middlewares --------------------------- */
app.use(processAuth);

/* --------------------------------- Routes --------------------------------- */

@injectable()
export class RouteController implements Controller {
	// Make Lucia available here then pass in
	constructor(@inject(LuciaProvider) private lucia: LuciaProvider) {}

	controller = new Hono<HonoTypes>();
	routes() {
		createTask(this.controller, '/tasks');
		getTasks(this.controller, '/tasks');
		finishTask(this.controller, '/tasks/:id/finish');
		undoFinishTask(this.controller, '/tasks/:id/undo-finish');
		deleteTask(this.controller, '/tasks/:id/delete');
		getAuthedUser(this.controller, '/user');
		registerEmail(this.controller, '/email/register');
		signInEmail(this.controller, '/email/signin', this.lucia);

		return this.controller;
	}
}

const routes = app
	.route('/iam', container.resolve(IamController).routes())
	.route('/', container.resolve(RouteController).routes());

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */
export const rpc = hc<typeof routes>(config.ORIGIN);
export type ApiClient = typeof rpc;
export type ApiRoutes = typeof routes;
export { app };
