import { db } from '$lib/server/db';
import data from '$lib/server/data/data.json';
import majors from '$lib/server/data/majors.json';
import { generateRandomId } from '$lib/server/utils';

export async function getRequirements(): Promise<Requirement[]> {
	const requirements = await db
		.selectFrom('requirement')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.execute();
	return requirements.map((r) => ({
		...r,
		level: r.level.split(',').map((l) => parseInt(l)),
		details: r.details.split(',').join('\n')
	}));
}
export async function getRequirementDetailsFromMajorId(majorId: string) {
	const requirements = await db
		.selectFrom('majorRequirement')
		.innerJoin('requirement', 'majorRequirement.requirementId', 'requirement.id')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.where('majorRequirement.majorId', '=', majorId)
		.execute();
	const courses = await db.selectFrom('course').select(['id', 'name']).execute();
	const faculties = await db.selectFrom('faculty').select(['id', 'name']).execute();

	return requirements.map((r) => ({
		...r,
		level: r.level.split(',').map((l) => parseInt(l)),
		details: r.details.split(',').map((d) => {
			if (r.type === 'courses') {
				return courses.find((c) => c.id === d)?.name;
			} else if (r.type === 'disciplines') {
				return d;
			} else if (r.type === 'faculties') {
				return faculties.find((f) => f.id === d)?.name;
			}
		})
	}));
}

export async function getRequirementDetailsFromMinorId(minorId: string) {
	const requirements = await db
		.selectFrom('minorRequirement')
		.innerJoin('requirement', 'minorRequirement.requirementId', 'requirement.id')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.where('minorRequirement.minorId', '=', minorId)
		.execute();
	const courses = await db.selectFrom('course').select(['id', 'name']).execute();
	const faculties = await db.selectFrom('faculty').select(['id', 'name']).execute();

	return requirements.map((r) => ({
		...r,
		level: r.level.split(',').map((l) => parseInt(l)),
		details: r.details.split(',').map((d) => {
			if (r.type === 'courses') {
				return courses.find((c) => c.id === d)?.name;
			} else if (r.type === 'disciplines') {
				return d;
			} else if (r.type === 'faculties') {
				return faculties.find((f) => f.id === d)?.name;
			}
		})
	}));
}

export async function getRequirementDetails() {
	const requirements = await db
		.selectFrom('requirement')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.execute();
	const courses = await db.selectFrom('course').select(['id', 'name']).execute();
	const faculties = await db.selectFrom('faculty').select(['id', 'name']).execute();

	return requirements.map((r) => ({
		...r,
		level: r.level.split(',').map((l) => parseInt(l)),
		details: r.details.split(',').map((d) => {
			if (r.type === 'courses') {
				return courses.find((c) => c.id === d)?.name;
			} else if (r.type === 'disciplines') {
				return d;
			} else if (r.type === 'faculties') {
				return faculties.find((f) => f.id === d)?.name;
			}
		})
	}));
}

export async function getRequirementFromId(
	requirementId: string
): Promise<Requirement | undefined> {
	const requirement = await db
		.selectFrom('requirement')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.where('id', '=', requirementId)
		.executeTakeFirst();
	if (!requirement) {
		return undefined;
	}
	return { ...requirement, level: requirement.level.split(',').map((l) => parseInt(l)) };
}

export async function createRequirement(
	type: 'courses' | 'disciplines' | 'faculties',
	option: 'all' | 'at most' | 'at least',
	details: string,
	level: number[],
	credits: number
): Promise<Requirement> {
	const result = await db
		.insertInto('requirement')
		.values({
			id: generateRandomId(),
			type: type,
			option: option,
			details: details,
			level: level.join(','),
			credits: credits
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const requirement: Requirement = {
		id: result.id,
		type: type,
		option: option,
		details: details,
		level: level,
		credits: credits
	};
	return requirement;
}

export async function deleteRequirementFromId(id: string): Promise<boolean> {
	const result = await db.deleteFrom('requirement').where('id', '=', id).executeTakeFirstOrThrow();
	return result.numDeletedRows > 0;
}

export async function updateRequirement(
	id: string,
	type: 'courses' | 'disciplines' | 'faculties',
	option: 'all' | 'at most' | 'at least',
	details: string,
	level: number[],
	credits: number
): Promise<Requirement> {
	const result = await db
		.updateTable('requirement')
		.set({
			type: type,
			option: option,
			details: details,
			level: level.join(','),
			credits: credits
		})
		.where('id', '=', id)
		.returning('id')
		.executeTakeFirstOrThrow();

	const requirement: Requirement = {
		id: result.id,
		type: type,
		option: option,
		details: details,
		level: level,
		credits: credits
	};
	return requirement;
}

// export async function loadPrerequisites() {
// 	await db.deleteFrom('prerequisites').execute();
// 	for (const course of data) {
// 		for (const prerequisite of course.prerequisites) {
// 			const newCourseId = data.find((c) => c.oldId === prerequisite.prerequisiteId)?.id;
// 			if (!newCourseId) {
// 				continue;
// 			}
// 			await db
// 				.insertInto('prerequisites')
// 				.values({
// 					id: generateRandomId(),
// 					courseId: prerequisite.courseId,
// 					prerequisiteId: newCourseId
// 				})
// 				.execute();
// 		}
// 	}
// 	return true;
// }

export interface Requirement {
	id: string;
	type: 'courses' | 'disciplines' | 'faculties';
	option: 'all' | 'at most' | 'at least';
	details: string;
	level: number[];
	credits: number;
}

export async function loadRequirements() {
	await db.deleteFrom('requirement').execute();
	let result:
		| {
				id: string;
		  }
		| undefined = undefined;
	for (const major of majors) {
		for (const requirement of major.requirements) {
			let details: string[] = [];
			if (requirement.detailsType.toLowerCase() === 'courses') {
				details = requirement.details
					.map((d) => data.find((c) => c.oldId === d)?.id)
					.filter((d) => d !== undefined) as string[];
			} else if (requirement.detailsType.toLowerCase() === 'disciplines') {
				details = requirement.details;
			} else if (requirement.detailsType.toLowerCase() === 'faculties') {
				details = requirement.details;
			}
			console.log('major', major.name);

			console.log('rdetails', requirement.details);
			console.log('details', details);

			const exisitng = await db
				.selectFrom('requirement')
				.select(['id'])
				.where('details', '==', details.join(','))
				.where('level', '==', requirement.level.join(','))
				.where('credits', '==', requirement.credits)
				.where(
					'type',
					'==',
					requirement.detailsType.toLowerCase() as 'courses' | 'disciplines' | 'faculties'
				)
				.where('option', '==', requirement.option.toLowerCase() as 'all' | 'at most' | 'at least')
				.executeTakeFirst();
			if (exisitng && exisitng.id) {
				continue;
			} else {
				result = await createRequirement(
					requirement.detailsType.toLowerCase() as 'courses' | 'disciplines' | 'faculties',
					requirement.option.toLowerCase() as 'all' | 'at most' | 'at least',
					details.join(','),
					requirement.level,
					requirement.credits
				);
			}

			if (!result) {
				return false;
			}
		}
	}
	return true;
}
