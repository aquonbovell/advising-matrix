import { z } from 'zod';
export const majorCreationSchema = z.object({
	name: z.string().trim().min(4).max(255)
});

export type MajorCreationSchema = typeof majorCreationSchema;

export const majorUpdateSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(4).max(255)
});

export type MajorUpdateSchema = typeof majorUpdateSchema;
