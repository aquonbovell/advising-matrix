import { z } from 'zod';
export const studentCreationSchema = z.object({
	userId: z.string(),
	majorId: z.string(),
	minorId: z.string(),
	advisors: z.array(z.string())
});

export type StudentCreationSchema = typeof studentCreationSchema;
