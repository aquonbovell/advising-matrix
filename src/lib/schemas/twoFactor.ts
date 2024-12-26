import { z } from 'zod';

export const twoFASchema = z.object({
	encodedKey: z.string().length(28),
	code: z.string().min(3).max(20)
});

export type TwoFASchema = typeof twoFASchema;

export const twoFAVerifySchema = z.object({
	code: z.string().min(3).max(20)
});

export type TwoFAVerifySchema = typeof twoFAVerifySchema;
