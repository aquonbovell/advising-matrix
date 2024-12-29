import { db } from '$lib/server/db';
import data from '$lib/server/data/data.json';
import { generateRandomId } from '$lib/server/utils';

export async function getRequirements(): Promise<Requirement[]> {
	const requirements = await db
		.selectFrom('requirement')
		.select(['id', 'type', 'option', 'details', 'level', 'credits'])
		.execute();
	return requirements.map((r) => ({ ...r, level: r.level.split(',').map((l) => parseInt(l)) }));
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
