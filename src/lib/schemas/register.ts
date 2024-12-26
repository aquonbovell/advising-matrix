import { z } from 'zod';

export const registerSchema = z.object({
	username: z.string().min(3).max(20),
	email: z
		.string()
		.email()
		.transform((v) => v.toLowerCase()),
	password: z.string().min(8).max(100),
	passwordConfirm: z.string().min(8).max(100)
});

export type RegisterSchema = typeof registerSchema;
