import { z } from 'zod';
export const userOptions = ['STUDENT', 'ADVISOR', 'ADMIN'] as const;
export const userSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z
		.string()
		.email()
		.trim()
		.regex(/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i, 'Must be a UWI Cave Hill email address')
		.transform((v) => v.toLowerCase()),
	alternate_email: z
		.string()
		.email()
		.trim()
		.transform((v) => v.toLowerCase()),
	role: z.enum(userOptions)
});

export type UserSchema = typeof userSchema;
