import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string()
		.email()
		.transform((v) => v.toLowerCase()),
	password: z
		.string()
		.trim()
		.min(8)
		.regex(/[A-Z]/, { message: 'This password must contain at least one uppercase letter.' })
});

export type LoginSchema = typeof loginSchema;
