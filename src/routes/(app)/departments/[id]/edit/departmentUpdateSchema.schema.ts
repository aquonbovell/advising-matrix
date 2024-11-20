import { z } from 'zod';
export const departmentUpdateSchema = z.object({
	id: z.string(),
	name: z.string(),
	facultyId: z.string()
});

export type DepartmentUpdateSchema = typeof departmentUpdateSchema;
