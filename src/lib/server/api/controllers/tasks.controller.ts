import { inject, injectable } from 'tsyringe';
import { zValidator } from '@hono/zod-validator';
import { TasksService } from '../services/tasks.service';
import { Hono } from 'hono';
import type { HonoTypes } from '../types';
import type { Controller } from '../interfaces/controller.interface';
import { createTaskDto } from '../dtos/create-task.dto';
import { createTask } from '../tasks/endpoints/createTasks';

/* -------------------------------------------------------------------------- */
/*                                 Controller                                 */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- About --------------------------------- */
/*
Controllers are responsible for handling incoming requests and returning responses
to a client.
*/
/* ---------------------------------- Notes --------------------------------- */
/*
A controller should generally only handle routing and authorization through
middleware.

Any business logic should be delegated to a service. This keeps the controller
clean and easy to read.
*/
/* -------------------------------- Important ------------------------------- */
/*
Remember to register your controller in the api/index.ts file.
*/
/* -------------------------------------------------------------------------- */

@injectable()
export class TasksController implements Controller {
	controller = new Hono<HonoTypes>();

	constructor(@inject(TasksService) private tasksService: TasksService) {}

	routes() {
		// .get('/', async (c) => {
		// 	const tasks = await this.tasksService.dbFindAllTasks();
		// 	console.log('tasks', tasks);
		// 	return c.json({ tasks: tasks });
		createTask(this.controller, '/');

		return this.controller;
	}
}
