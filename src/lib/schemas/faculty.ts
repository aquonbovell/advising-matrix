import { z } from 'zod';
export const facultyCreationSchema = z.object({
	name: z.string().trim().min(4).max(255)
});

export type FacultyCreationSchema = typeof facultyCreationSchema;

export const facultyUpdateSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(4).max(255)
});

export type FacultyUpdateSchema = typeof facultyUpdateSchema;
