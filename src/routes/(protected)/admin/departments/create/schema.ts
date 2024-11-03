import { z } from 'zod';

export const departmentSchema = z.object({
	facultyId: z.string(),
	name: z.string().min(3, 'Name must be at least 3 characters long')
});

export type DepartmentSchema = typeof departmentSchema;
