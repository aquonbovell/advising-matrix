import { z } from 'zod';
export const prerequisiteOptions = ['ALL', 'ONE'] as const;
export const courseCreationSchema = z
	.object({
		departmentId: z.string(),
		name: z.string(),
		code: z
			.string()
			.min(8, 'Course Code must be 8 alpha numeric characters long')
			.max(8, 'Course Code must be 8 alpha numeric characters long')
			.regex(
				/^[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9]/,
				'Course Code must start with 4 alpha characters and end with 4 numeric characters'
			),
		credits: z.number(),
		restrictions: z.array(
			z.object({
				id: z.string(),
				level: z.array(z.number()),
				credits: z.number(),
				area: z.array(z.string())
			})
		),

		prerequisiteType: z.enum(prerequisiteOptions),
		prerequisiteCount: z.number(),
		level: z.number().default(undefined),
		comment: z.string().default(''),
		prerequisites: z.array(z.string())
	})
	.transform((values) => ({
		...values,
		get prerequisiteCount() {
			return values.prerequisiteType === 'ONE' ? 1 : values.prerequisites.length;
		},
		get level() {
			return parseInt(values.code[4]);
		}
	}));

export type CourseCreationSchema = typeof courseCreationSchema;
