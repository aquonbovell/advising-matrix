import { z } from 'zod';
export const userOptions = ['STUDENT', 'ADVISOR', 'ADMIN'] as const;
export const userUpdateSchema = z.object({
	id: z.string(),
	name: z.string(),
	username: z.string().min(2).max(255),
	email: z
		.string()
		.email()
		.trim()
		.regex(/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i, 'Must be a UWI Cave Hill email address')
		.transform((v) => v.toLowerCase()),
	alternateEmail: z
		.string()
		.email()
		.trim()
		.transform((v) => v.toLowerCase()),
	onboarded: z.boolean(),
	role: z.enum(userOptions)
});

export type UserUpdateSchema = typeof userUpdateSchema;
