import type { requirementDetailsType, requirementOption } from '$lib/types';
import { requirementDetailsType as types, requirementOption as options } from '$lib/types';

import { z } from 'zod';
export const minorSchema = z.object({
	id: z.string(),
	name: z.string().min(6, { message: 'Minor name must at least be 6 characters long' }),
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

export type MinorSchema = typeof minorSchema;
