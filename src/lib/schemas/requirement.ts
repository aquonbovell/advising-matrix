import { z } from 'zod';
export const types = ['courses', 'disciplines', 'faculties'] as const;
export const options = ['all', 'at most', 'at least'] as const;
export const disciplines = ['BIOC', 'BIOL', 'CHEM', 'MICR', 'PHYS', 'MATH', 'ECOL'] as const;
export const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export const requirementCreationSchema = z.object({
	type: z.enum(['courses', 'disciplines', 'faculties']),
	option: z.enum(['all', 'at most', 'at least']),
	details: z.array(z.string().trim().min(4).max(512)),
	level: z.array(z.number().int().min(1).max(8)),
	credits: z.number().int().min(1).max(100)
});

export type RequirementCreationSchema = typeof requirementCreationSchema;

export const requirementUpdateSchema = z.object({
	id: z.string(),
	type: z.enum(['courses', 'disciplines', 'faculties']),
	option: z.enum(['all', 'at most', 'at least']),
	details: z.array(z.string().trim().min(4).max(512)),
	level: z.array(z.number().int().min(1).max(8)),
	credits: z.number().int().min(1).max(100)
});

export type RequirementUpdateSchema = typeof requirementUpdateSchema;
