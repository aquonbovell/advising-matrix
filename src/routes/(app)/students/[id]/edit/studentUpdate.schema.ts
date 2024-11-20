import { z } from 'zod';
export const studentUpdateSchema = z.object({
	id: z.string(),
	userId: z.string(),
	majorId: z.string(),
	minorId: z.string(),
	advisors: z.array(z.string())
});

export type StudentUpdateSchema = typeof studentUpdateSchema;
