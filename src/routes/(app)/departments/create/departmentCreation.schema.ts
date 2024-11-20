import { z } from 'zod';
export const departmentCreationSchema = z.object({
	facultyId: z.string(),
	name: z.string().trim().min(1).max(255)
});

export type DepartmentCreationSchema = typeof departmentCreationSchema;
