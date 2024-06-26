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
import { createTask } from './endpoints/createTasks';
import type { Controller } from './interfaces/controller.interface';

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

export class RouteController implements Controller {
	controller = new Hono<HonoTypes>();
	routes() {
		finishTask(this.controller, '/tasks/:id/finish');
		undoFinishTask(this.controller, '/tasks/:id/undo-finish');
		createTask(this.controller, '/tasks');

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
