import { z } from 'zod';

export const formSchema = z.object({
	email: z
		.string()
		.email()
		.regex(
			/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i,
			'Must be a UWI Cave Hill email address'
		),
	alternate_email: z.string().email(),
	token: z.string().min(6).max(64),
	defaultPassword: z.string().min(8).max(64),
	password: z
		.string()
		.trim()
		.min(8)
		.regex(/[A-Z]/, { message: 'This password must contain at least one uppercase letter.' }),
	passwordConfirm: z
		.string()
		.trim()
		.min(8)
		.regex(/[A-Z]/, { message: 'This password must contain at least one uppercase letter.' })
});

export type FormSchema = typeof formSchema;
