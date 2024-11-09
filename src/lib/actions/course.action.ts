import { db } from '$lib/db';
import type {
	Courses,
	prerequisiteType,
	requirementDetailsType,
	requirementOption
} from '$lib/db/schema';
import type { Course, CoursesWithPrerequisites } from '$lib/types';
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

export async function paginate(
	page: number,
	size: number,
	orderBy: 'asc' | 'desc',
	search: string
) {
	const data = [];
	const query = db
		.selectFrom('Courses')
		.orderBy('code', orderBy)
		.where((eb) =>
			eb('code', 'like', `%${search.toUpperCase()}%`).or('name', 'like', `%${search}%`)
		)
		.offset(page * size)
		.limit(size);

	const courses = await query.selectAll().execute();

	return courses;
}
export async function count() {
	const courses = await db
		.selectFrom('Courses')
		.select(db.fn.countAll<number>().as('count'))
		.executeTakeFirst();
	return courses;
}

export async function findByCode(code: string) {
	const course = await db
		.selectFrom('Courses')
		.where('code', 'like', `%${code}%`)
		.selectAll()
		.executeTakeFirst();
	if (!course) return null;

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
	return courseData;
}

export async function remove(code: string) {
	try {
		const result = await db.transaction().execute(async (db) => {
			const course = await db.deleteFrom('Courses').where('code', '=', code).execute();
			return course;
		});
		return { success: true };
	} catch (error) {
		console.error('Error deleting course:', error);
		return { success: false };
	}
}

export async function fetchFilter(
	level: number | undefined,
	exclude: string[] | undefined,
	department: string | undefined,
	order: 'asc' | 'desc' = 'asc'
) {
	const data = [];

	const query = db.selectFrom('Courses').orderBy('code', order).selectAll();
	if (level) {
		query.where('level', '=', level);
	}
	if (department) {
		query.where('departmentId', '=', department);
	}

	if (exclude && exclude.length > 0) {
		query.where('id', 'not in', exclude);
	}
	const courses = await query.execute();

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

export async function find(code: string, name: string) {
	const course = await db
		.selectFrom('Courses')
		.where((eb) => eb('code', 'like', `%${code.toUpperCase()}%`).or('name', 'like', `%${name}%`))
		.select(['code', 'name'])
		.executeTakeFirst();

	return course;
}

export async function create(data: Course) {
	try {
		await db.transaction().execute(async (db) => {
			const course = await db
				.insertInto('Courses')
				.values({
					id: data.id,
					code: data.code.toUpperCase(),
					name: data.name,
					credits: data.credits,
					departmentId: data.departmentId,
					level: data.level,
					prerequisiteAmount: data.prerequisiteAmount,
					prerequisiteType: data.prerequisiteType,
					comment: data.comment
				})
				.returning('id')
				.executeTakeFirst();

			if (course) {
				for (const prerequisite of data.prerequisites) {
					await db
						.insertInto('Prerequisites')
						.values({
							id: crypto.randomUUID(),
							courseId: course.id,
							prerequisiteId: prerequisite
						})
						.execute();
				}
				for (const restriction of data.levelRestriction) {
					await db
						.insertInto('LevelRestriction')
						.values({
							id: crypto.randomUUID(),
							courseId: course.id,
							level: restriction.level.toString(),
							area: restriction.area.toString(),
							credits: restriction.credits
						})
						.execute();
				}
			}
		});
		return { success: true };
	} catch (error) {
		console.error('Error creating course:', error);
		return { success: false };
	}
}
