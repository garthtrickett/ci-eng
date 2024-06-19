import { inject, injectable } from 'tsyringe';
import type { Repository } from '../interfaces/repository.interface';
import { DatabaseProvider } from '../providers';
import { type InferInsertModel } from 'drizzle-orm';
import { tasksTable } from '../infrastructure/database/tables/tasks.table';

/* -------------------------------------------------------------------------- */
/*                                 Repository                                 */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- About --------------------------------- */
/*
Repositories are the layer that interacts with the database. They are responsible for retrieving and 
storing data. They should not contain any business logic, only database queries.
*/
/* ---------------------------------- Notes --------------------------------- */
/*
 Repositories should only contain methods for CRUD operations and any other database interactions. 
 Any complex logic should be delegated to a service. If a repository method requires a transaction,
 it should be passed in as an argument or the class should have a method to set the transaction.
 In our case the method 'trxHost' is used to set the transaction context.
*/

export type CreateTask = InferInsertModel<typeof tasksTable>;
export type UpdateTask = Partial<CreateTask>;

@injectable()
export class TasksRepository implements Repository {
	constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

	async findAll() {
		return await this.db.query.tasksTable.findMany();
	}

	trxHost(trx: DatabaseProvider) {
		return new TasksRepository(trx);
	}
}
