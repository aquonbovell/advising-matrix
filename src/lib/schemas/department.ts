import { z } from 'zod';
export const departmentCreationSchema = z.object({
	name: z.string().trim().min(3).max(255),
	facultyId: z.string()
});

export type DepartmentCreationSchema = typeof departmentCreationSchema;

export const departmentUpdateSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(3).max(255),
	facultyId: z.string().nullable()
});

export type DepartmentUpdateSchema = typeof departmentUpdateSchema;
