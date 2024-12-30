import { z } from 'zod';

export const studentUpdateSchema = z.object({
	id: z.string(),
	userId: z.string(),
	majorId: z.string().nullable(),
	minorId: z.string().nullable()
});

export type StudentUpdateSchema = typeof studentUpdateSchema;
