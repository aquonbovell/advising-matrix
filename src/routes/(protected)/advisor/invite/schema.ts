import { z } from 'zod';

export const formSchema = z.object({
	official_email: z
		.string()
		.trim()
		.email()
		.regex(/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i, 'Must be a UWI Cave Hill email address')
		.transform((v) => v.toLowerCase()),
	alternate_email: z
		.string()
		.trim()
		.email()
		.transform((v) => v.toLowerCase()),
	name: z.string().trim().min(3).max(50),
	majorId: z.string().trim().uuid(),
	minorId: z.string().trim().uuid().nullable()
});

export type FormSchema = typeof formSchema;
