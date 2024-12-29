import { z } from 'zod';
export const options = ['all', 'one'] as const;
export const courseCreationSchema = z
	.object({
		name: z.string(),
		code: z
			.string()
			.min(8, 'Course Code must be 8 alpha numeric characters long')
			.max(8, 'Course Code must be 8 alpha numeric characters long')
			.regex(
				/^[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9]/,
				'Course Code must start with 4 alpha characters and end with 4 numeric characters'
			),
		description: z.string(),
		credits: z.number().default(3),

		type: z.enum(options).default('all'),
		prerequisiteCount: z.number(),
		level: z.number().default(-1),
		departmentId: z.string(),
		prerequisites: z.array(z.string())
	})
	.transform((values) => ({
		...values,
		get prerequisiteCount() {
			return values.type === 'one' ? 1 : values.prerequisites.length;
		},
		get level() {
			return parseInt(values.code[4]);
		}
	}));

export type CourseCreationSchema = typeof courseCreationSchema;

export const courseUpdateSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		code: z
			.string()
			.min(8, 'Course Code must be 8 alpha numeric characters long')
			.max(8, 'Course Code must be 8 alpha numeric characters long')
			.regex(
				/^[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9]/,
				'Course Code must start with 4 alpha characters and end with 4 numeric characters'
			),
		description: z.string(),
		credits: z.number().default(3),

		type: z.enum(options).default('all'),
		prerequisiteCount: z.number(),
		level: z.number().default(-1),
		departmentId: z.string(),
		prerequisites: z.array(z.string())
	})
	.transform((values) => ({
		...values,
		get prerequisiteCount() {
			return values.type === 'one' ? 1 : values.prerequisites.length;
		},
		get level() {
			return parseInt(values.code[4]);
		}
	}));

export type CourseUpdateSchema = typeof courseUpdateSchema;
