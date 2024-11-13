import { z } from 'zod';
export const studentSchema = z.object({
	userId: z.string().uuid(),
	majorId: z.string().uuid(),
	minorId: z.string().uuid().nullable(),
	advisors: z.array(z.string().uuid())
});

export type StudentSchema = typeof studentSchema;
