import { z } from 'zod';
import { prerequisiteType, prerequisiteType as types } from '$lib/types';
export const courseSchema = z.object({
	id: z.string(),
	departmentId: z.string(),
	name: z.string(),
	code: z
		.string()
		.min(8, 'Course Code must be 8 alpha numeric characters long')
		.max(8, 'Course Code must be 8 alpha numeric characters long')
		.regex(
			/^[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9]/,
			'Code must start with 4 alpha characters and end with 4 numeric characters'
		),
	credits: z.number(),
	levelRestriction: z.array(
		z.object({
			id: z.string(),
			level: z.array(z.number()),
			credits: z.number(),
			area: z.array(z.string())
		})
	),
	comment: z.string().optional().nullish(),
	prerequisites: z.object({
		dataType: z.enum(Object.values(types) as [prerequisiteType, ...prerequisiteType[]]),
		courses: z.array(z.string()),
		requiredAmount: z.number()
	})
});

export type CourseSchema = typeof courseSchema;
