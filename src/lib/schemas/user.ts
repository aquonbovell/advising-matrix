import { z } from 'zod';

export const userSchema = z.object({
	username: z.string().min(3).max(20),
	email: z
		.string()
		.email()
		.transform((v) => v.toLowerCase()),
	role: z.enum(['student', 'advisor', 'superadvisor', 'admin'])
});

export const roles = ['student', 'advisor', 'superadvisor', 'admin'] as const;

export type UserSchema = typeof userSchema;

export const advisorSchema = z.object({
	username: z.string().min(3).max(20),
	email: z
		.string()
		.email()
		.transform((v) => v.toLowerCase())
});

export type AdvisorSchema = typeof advisorSchema;

export const advisorUpdateSchema = z.object({
	id: z.string(),
	username: z.string().min(3).max(20),
	email: z
		.string()
		.email()
		.transform((v) => v.toLowerCase()),
	role: z.enum(['student', 'advisor', 'superadvisor', 'admin'])
});

export type AdvisorUpdateSchema = typeof advisorUpdateSchema;
