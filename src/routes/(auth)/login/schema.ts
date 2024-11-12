import { z } from 'zod';

export const formSchema = z.object({
	email: z.string().email(),
	// .regex(
	// 	/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i,
	// 	'Must be a UWI Cave Hill email address'
	// ),
	password: z
		.string()
		.trim()
		.min(8)
		.regex(/[A-Z]/, { message: 'This password must contain at least one uppercase letter.' })
});

export type FormSchema = typeof formSchema;
