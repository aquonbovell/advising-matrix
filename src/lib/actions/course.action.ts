import { db } from '$lib/db';
import type { prerequisiteType, requirementDetailsType, requirementOption } from '$lib/db/schema';
import courses from '../../../courses.json';

export async function updateMajor(majorData: {
	id: string;
	name: string;
	requirements: requirement[];
}) {
	try {
		const result = await db.transaction().execute(async (db) => {
			const major = await db
				.selectFrom('Majors')
				.where('id', '=', majorData.id)
				.select('id')
				.executeTakeFirst();

			if (!major) {
				throw new Error('Major not found');
			}

			await db
				.updateTable('Majors')
				.set({
					name: majorData.name
				})
				.where('id', '=', major.id)
				.execute();

			const requirementIds: string[] = [];

			for (const requirement of majorData.requirements) {
				const requirementId = await db
					.selectFrom('MajorRequirements')
					.where('id', '=', requirement.id)
					.select('id')
					.executeTakeFirst();

				if (requirementId) {
					await db
						.updateTable('MajorRequirements')
						.set({
							option: requirement.option as requirementOption,
							credits: requirement.credits,
							details: JSON.stringify(requirement.details),
							detailsType: requirement.detailsType as requirementDetailsType,
							level: JSON.stringify(requirement.level)
						})
						.where('id', '=', requirementId.id)
						.execute();
					requirementIds.push(requirementId.id);
				} else {
					const newRequirementId = await db
						.insertInto('MajorRequirements')
						.values({
							id: crypto.randomUUID(),
							majorId: major.id,
							option: requirement.option as requirementOption,
							credits: requirement.credits,
							details: JSON.stringify(requirement.details),
							detailsType: requirement.detailsType as requirementDetailsType,
							level: JSON.stringify(requirement.level)
						})
						.returning('id')
						.executeTakeFirst();
					if (!newRequirementId) {
						throw new Error('Failed to create new requirement');
					}
					requirementIds.push(newRequirementId.id);
				}
			}

			await db
				.selectFrom('MajorRequirements')
				.where('majorId', '=', major.id)
				.where('id', 'not in', requirementIds)
				.execute();

			return major;
		});

		return result.id ? { success: true } : { success: false };
	} catch (error) {
		console.error('Error updating major:', error);
		throw error;
	}
}

export async function createMajor(majorData: { name: string; requirements: requirement[] }) {
	try {
		await db.transaction().execute(async (db) => {
			const major = await db
				.insertInto('Majors')
				.values({
					id: crypto.randomUUID(),
					name: majorData.name
				})
				.returning('id')
				.executeTakeFirst();

			if (major) {
				for (const requirement of majorData.requirements) {
					await db
						.insertInto('MajorRequirements')
						.values({
							id: crypto.randomUUID(),
							majorId: major.id,
							option: requirement.option as requirementOption,
							credits: requirement.credits,
							details: JSON.stringify(requirement.details),
							detailsType: requirement.detailsType as requirementDetailsType,
							level: JSON.stringify(requirement.level)
						})
						.execute();
				}
			}
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating major:', error);
		return { success: false };
	}
}

type requirement = {
	id: string;
	option: requirementOption;
	details: string[];
	detailsType: requirementDetailsType;
	credits: number;
	level: number[];
};

export async function initCourses() {
	await db.deleteFrom('LevelRestriction').execute();
	await db.deleteFrom('Prerequisites').execute();
	await db.deleteFrom('Courses').execute();

	for (const course of courses) {
		await db
			.insertInto('Courses')
			.values({
				id: course.id,
				name: course.name,
				code: course.code,
				credits: course.credits,
				departmentId: course.departmentId,
				level: course.level,
				comment: course.comment,
				prerequisiteAmount: course.prerequisiteAmount,
				prerequisiteType: course.prerequisiteType.toUpperCase() as prerequisiteType
			})
			.executeTakeFirst();
	}
	for (const course of courses) {
		const newCourse = await db
			.selectFrom('Courses')
			.where('id', '=', course.id)
			.select('id')
			.executeTakeFirst();
		if (newCourse) {
			for (const prerequisite of course.prerequisites) {
				await db
					.insertInto('Prerequisites')
					.values({
						id: crypto.randomUUID(),
						courseId: newCourse.id,
						prerequisiteId: prerequisite.prerequisiteId
					})
					.execute();
			}
			for (const restriction of course.restrictions) {
				await db
					.insertInto('LevelRestriction')
					.values({
						id: crypto.randomUUID(),
						courseId: newCourse.id,
						level: restriction.level,
						area: restriction.area,
						credits: restriction.credits
					})
					.execute();
			}
		}
	}
}

export async function fetchCourses() {
	const data = [];

	const courses = await db.selectFrom('Courses').selectAll().execute();

	for (const course of courses) {
		const restrictions = await db
			.selectFrom('LevelRestriction')
			.where('courseId', '=', course.id)
			.selectAll()
			.execute();
		const prerequisites = await db
			.selectFrom('Prerequisites')
			.innerJoin('Courses', 'Prerequisites.prerequisiteId', 'Courses.id')
			.where('courseId', '=', course.id)
			.selectAll()
			.execute();
		const courseData = {
			...course,
			levelRestriction: restrictions.map((restriction) => {
				return {
					...restriction,
					level: restriction.level.split(','),
					area: restriction.area.split(',')
				};
			}),
			prerequisites
		};
		data.push(courseData);
	}
	return data;
}
export async function fetchCourseCodes() {
	const courses = await db.selectFrom('Courses').select(['id', 'code', 'credits']).execute();
	return courses;
}

export async function deleteMajor(id: string) {
	try {
		await db.transaction().execute(async (db) => {
			const major = await db
				.selectFrom('Majors')
				.where('id', '=', id)
				.select('id')
				.executeTakeFirst();

			if (major) {
				await db.deleteFrom('MajorRequirements').where('majorId', '=', major.id).execute();
				await db.deleteFrom('Majors').where('id', '=', major.id).execute();
			}
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating major:', error);
		return { success: false };
	}
}
