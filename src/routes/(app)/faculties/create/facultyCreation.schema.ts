import { z } from 'zod';
export const facultyCreationSchema = z.object({
	name: z.string().trim().min(1).max(255)
});

export type FacultyCreationSchema = typeof facultyCreationSchema;
