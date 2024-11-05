import { z } from 'zod';
export const studentSchema = z.object({
	name: z.string(),
	studentId: z.string().uuid(),
	userId: z.string().uuid(),
	majorId: z.string().uuid(),
	minorId: z.string().uuid(),
	advisors: z.array(z.string().uuid())
});

export type StudentSchema = typeof studentSchema;
