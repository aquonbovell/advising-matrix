import { z } from 'zod';

export const onboardingSchema = z.object({
	id: z.string(),
	token: z.string().min(2).max(255),
	password: z
		.string()
		.trim()
		.min(8)
		.regex(/[A-Z]/, { message: 'This password must contain at least one uppercase letter.' }),
	password1: z
		.string()
		.trim()
		.min(8)
		.regex(/[A-Z]/, { message: 'This password must contain at least one uppercase letter.' })
});

export type OnboardingSchema = typeof onboardingSchema;
