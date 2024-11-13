import { z } from 'zod';

export const formSchema = z.object({
	id: z.string().trim().uuid(),
	email: z
		.string()
		.trim()
		.email()
		.regex(/@mycavehill\.uwi\.edu$/i, 'Must be a UWI Cave Hill email address')
		.transform((v) => v.toLowerCase()),
	alternateEmail: z
		.string()
		.trim()
		.email()
		.transform((v) => v.toLowerCase()),
	name: z.string().trim().min(3).max(50),
	majorId: z.string().trim().uuid(),
	minorId: z.string().trim().uuid().nullish()
});

export type FormSchema = typeof formSchema;
