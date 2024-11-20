import { z } from 'zod';
import { requirementOption, requirementType } from '$lib/types';
export const minorCreationSchema = z.object({
	name: z.string().min(6, { message: 'Minor name must at least be 6 characters long' }),
	requirements: z.array(
		z.object({
			id: z.string(),
			option: z.enum(
				Object.values(requirementOption) as [requirementOption, ...requirementOption[]]
			),
			details: z.array(z.string()),
			type: z.enum(Object.values(requirementType) as [requirementType, ...requirementType[]]),
			credits: z.number(),
			level: z.array(z.number())
		})
	)
});

export type MinorCreationSchema = typeof minorCreationSchema;
