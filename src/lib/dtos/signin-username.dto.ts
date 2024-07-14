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

export const signInUsernameDto = z.object({
	username: z.string(),
	password: z.string(),
	clientId: z.string(),
	redirectUri: z.string(),
	responseType: z.string(),
	scope: z.string(),
	state: z.string()
});
export type SignInUsernameDto = z.infer<typeof signInUsernameDto>;
export type SignInUsernameSchema = typeof signInUsernameDto;
