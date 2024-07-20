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
	username: z
		.string()
		.min(3)
		.max(31)
		.regex(/^[a-z0-9_.-]+$/i),
	password: z.string().min(6).max(255),
	clientId: z.string(),
	redirectUri: z.string(),
	responseType: z.string(),
	scope: z.string(),
	state: z.string(),
	nonce: z.string()
});
export type SignInUsernameDto = z.infer<typeof signInUsernameDto>;
export type SignInUsernameSchema = typeof signInUsernameDto;
