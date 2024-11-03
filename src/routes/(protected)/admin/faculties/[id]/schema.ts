import { z } from 'zod';
export const facultySchema = z.object({
	id: z.string().uuid(),
	name: z
		.string()
		.min(6, { message: 'Faculty name must be between 6 and 64 characters long' })
		.max(64, { message: 'Faculty name must be between 6 and 64 characters long' })
});

export type FacultySchema = typeof facultySchema;
