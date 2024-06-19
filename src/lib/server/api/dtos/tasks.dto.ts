import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                                     DTO                                    */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- About --------------------------------- */
/*
Data Transfer Objects (DTOs) are used to define the shape of data that is passed.
They are used to validate data and ensure that the correct data is being passed
to the correct methods.
*/
/* ---------------------------------- Notes --------------------------------- */
/*
DTO's are pretty flexible. You can use them anywhere you want in this application to 
validate or shape data. They are especially useful in API routes and services to
ensure that the correct data is being passed around.
*/
/* -------------------------------------------------------------------------- */

export const task = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	done: z.boolean()
});

export type Task = z.infer<typeof task>;

export const taskCreateDto = task.pick({ name: true });

export type TaskCreateDto = z.infer<typeof taskCreateDto>;

export const taskParam = task.pick({ id: true });
export type TaskParam = z.infer<typeof taskParam>;
