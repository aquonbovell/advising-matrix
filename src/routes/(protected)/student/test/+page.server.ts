import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { computerScienceDegreePath, informationTechnologyDegreePath } from '$lib/data/degreePaths';

export const load: PageServerLoad = async ({ url }) => {
	// get all programs and the details in json
	const programs = await db.selectFrom('Program').selectAll().execute();

	const ProgramRequirements = await db.selectFrom('ProgramRequirement').selectAll().execute();

	console.log('programs', programs);
	console.log('ProgramRequirements', JSON.stringify(ProgramRequirements, null, 2));
};
