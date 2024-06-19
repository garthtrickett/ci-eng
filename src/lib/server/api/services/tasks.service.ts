import { inject, injectable } from 'tsyringe';
import { TasksRepository } from '../repositories/tasks.repository';

/* -------------------------------------------------------------------------- */
/*                                   Service                                  */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- About --------------------------------- */
/*
Services are responsible for handling business logic and data manipulation. 
They genreally call on repositories or other services to complete a use-case.
*/
/* ---------------------------------- Notes --------------------------------- */
/*
Services should be kept as clean and simple as possible. 

Create private functions to handle complex logic and keep the public methods as 
simple as possible. This makes the service easier to read, test and understand.
*/
/* -------------------------------------------------------------------------- */

@injectable()
export class TasksService {
	constructor(@inject(TasksRepository) private tasksRepository: TasksRepository) {}

	async findAllTasks() {
		return this.tasksRepository.findAll();
	}
}
