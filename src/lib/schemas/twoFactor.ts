import { z } from 'zod';

export const twoFASchema = z.object({
	encodedKey: z.string(),
	code: z.string().min(3).max(20)
});

export type TwoFASchema = typeof twoFASchema;

export const twoFAVerifySchema = z.object({
	code: z.string().min(3).max(20)
});

export type TwoFAVerifySchema = typeof twoFAVerifySchema;
