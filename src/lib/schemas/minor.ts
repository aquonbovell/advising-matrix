import { z } from 'zod';
export const minorCreationSchema = z.object({
	name: z.string().trim().min(4).max(255)
});

export type MinorCreationSchema = typeof minorCreationSchema;

export const minorUpdateSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(4).max(255)
});

export type MinorUpdateSchema = typeof minorUpdateSchema;
