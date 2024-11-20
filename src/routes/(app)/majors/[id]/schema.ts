import type { requirementDetailsType, requirementOption } from '$lib/types';
import { requirementDetailsType as types, requirementOption as options } from '$lib/types';

import { z } from 'zod';
export const majorSchema = z.object({
	id: z.string(),
	name: z.string().min(6, { message: 'Major name must at least be 6 characters long' }),
	requirements: z.array(
		z.object({
			id: z.string(),
			option: z.enum(Object.values(options) as [requirementOption, ...requirementOption[]]),
			details: z.array(z.string()),
			detailsType: z.enum(
				Object.values(types) as [requirementDetailsType, ...requirementDetailsType[]]
			),
			credits: z.number(),
			level: z.array(z.number())
		})
	)
});

export type MajorSchema = typeof majorSchema;
