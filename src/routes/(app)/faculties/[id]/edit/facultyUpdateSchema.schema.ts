import { z } from 'zod';
export const facultyUpdateSchema = z.object({
	id: z.string(),
	name: z.string()
});

export type FacultyUpdateSchema = typeof facultyUpdateSchema;
