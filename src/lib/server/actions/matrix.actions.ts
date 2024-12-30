import { db } from '../db';

export async function getDisciplineFromStudentId(userId: string) {
	const student = await db
		.selectFrom('student')
		.select(['majorId', 'minorId'])
		.where('userId', '=', userId)
		.executeTakeFirstOrThrow();
	const majorRequirements = await db
		.selectFrom('majorRequirement')
		.innerJoin('requirement', 'majorRequirement.requirementId', 'requirement.id')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.where('majorId', '=', student.majorId)
		.execute();

	const minorRequirements = await db
		.selectFrom('minorRequirement')
		.innerJoin('requirement', 'minorRequirement.requirementId', 'requirement.id')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.where('minorId', '=', student.minorId)
		.execute();

	const requirements = majorRequirements.concat(minorRequirements);
	const courses = await db.selectFrom('course').select(['id', 'name']).execute();
	const faculties = await db.selectFrom('faculty').select(['id', 'name']).execute();

	return requirements.map((r) => ({
		...r,
		type: r.type as 'courses' | 'faculties' | 'credits',
		option: r.option as 'all' | 'one',
		level: r.level.split(',').map((l) => parseInt(l)),
		details: Array.from(new Set(r.details.split(','))).map((d) => {
			if (r.type === 'courses') {
				return courses.find((c) => c.id === d)?.name;
			} else if (r.type === 'faculties') {
				return faculties.find((f) => f.id === d)?.name;
			} else {
				return d;
			}
		})
	}));
}
