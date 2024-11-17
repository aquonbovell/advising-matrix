import { z } from 'zod';

export const registerSchema = z.object({
	name: z.string().min(2).max(255),
	username: z.string().min(2).max(255),
	email: z
		.string()
		.email()
		.regex(/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i, 'Must be a UWI Cave Hill email address')
		.transform((v) => v.toLowerCase()),
	alternateEmail: z
		.string()
		.email()
		.transform((v) => v.toLowerCase())
});

export type RegisterSchema = typeof registerSchema;
