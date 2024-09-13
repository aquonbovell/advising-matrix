import { z } from 'zod';

export const formSchema = z.object({
	official_email: z
		.string()
		.trim()
		.email()
		.regex(/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i),
	alternate_email: z.string().trim().email(),
	name: z.string().trim().min(3).max(50),
	majorId: z.string().trim().uuid(),
	minorId: z.string().trim().uuid()
});

export type FormSchema = typeof formSchema;
