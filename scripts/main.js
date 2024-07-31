import degreeData from './degrees.json' with { type: 'json' };
import { randomUUID } from 'crypto';

for (const degree of degreeData) {
	const programId = randomUUID();

	console.log('Degree Name:', degree.name, 'Program ID:', programId);
	// Insert Programs
	// await insertOrIgnore('Program', {
	// 	id: programId,
	// 	name: degree.name
	// });

	// console.log('Program seeded successfully:', degree.name);

	// Insert Program Courses
	degree.requirements.forEach(async (element) => {
		const requirementId = randomUUID();
		if (element.type === 'CREDITS') {
			const requirementDetails = element.courses;
			console.log(requirementDetails.length);
			console.log('Courses:', requirementDetails);
			// await insertOrIgnore('ProgramRequirement', {
			// 	id: requirementId,
			// 	programId: programId,
			// 	type: 'CREDITS',
			// 	credits: requirementDetails.courses.length * 3, // Assuming each course is 3 credits
			// 	details: JSON.stringify(requirementDetails)
			// });
		} else if (element.type === 'POOL') {
			const requirementDetails = {
				levelPool: element.levelPool,
				facultyPool: element.facultyPool
			};

			console.log('Pool:', requirementDetails);
			// await insertOrIgnore('ProgramRequirement', {
			// 	id: requirementId,
			// 	programId: programId,
			// 	type: 'POOL',
			// 	credits: element.credits,
			// 	details: JSON.stringify(requirementDetails)
			// });
		}
		console.log('Electives seeded successfully for:', programId);
	});
}
