import { inject, injectable } from 'tsyringe';
import { zValidator } from '@hono/zod-validator';
import { IamService } from '../services/iam.service';
import { registerEmailDto } from '../dtos/register-email.dto';
import { TasksService } from '../services/tasks.service';
import { signInEmailDto } from '../dtos/signin-email.dto';
import { setCookie } from 'hono/cookie';
import { LuciaProvider } from '../providers/lucia.provider';
import { requireAuth } from '../middleware/require-auth.middleware';
import { updateEmailDto } from '../dtos/tasks.dto';
import { verifyEmailDto } from '../dtos/verify-email.dto';
import { Hono } from 'hono';
import type { HonoTypes } from '../types';
import type { Controller } from '../interfaces/controller.interface';

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
		return this.controller.get('/', async (c) => {
			const tasks = await this.tasksService.findAllTasks();
			console.log('tasks', tasks);
			return c.json({ tasks: tasks });
		});
	}
}
