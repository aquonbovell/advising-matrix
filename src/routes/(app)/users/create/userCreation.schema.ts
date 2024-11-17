import { z } from 'zod';
export const userOptions = ['STUDENT', 'ADVISOR'] as const;
export const userCreationSchema = z.object({
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
	role: z.enum(userOptions)
});

export type UserCreationSchema = typeof userCreationSchema;
