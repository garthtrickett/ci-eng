import 'reflect-metadata';
import './providers';
import { Hono } from 'hono';
import type { HonoTypes } from './types';
import { hc } from 'hono/client';
import { container } from 'tsyringe';
import { processAuth } from './middleware/process-auth.middleware';
import { IamController } from './controllers/iam.controller';
import { TasksController } from './controllers/tasks.controller';
import { config } from './common/config';
import { createTask } from './tasks/endpoints/createTasks';
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
		// .get('/', async (c) => {
		// 	const tasks = await this.tasksService.dbFindAllTasks();
		// 	console.log('tasks', tasks);
		// 	return c.json({ tasks: tasks });
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
