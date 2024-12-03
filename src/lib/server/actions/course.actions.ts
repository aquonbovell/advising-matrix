import { db } from '$lib/server/db';
import courses from '$lib/data/courses.json';
import type { CourseDetails, CourseRequirementDetails, prerequisiteType } from '$lib/types';
import type { DB } from '$lib/server/db/schema';
import { generateId } from '$lib/server/auth';
import type { ReferenceExpression } from 'kysely';

export async function initCourses() {
	await db.deleteFrom('LevelRestriction').execute();
	await db.deleteFrom('Prerequisites').execute();
	await db.deleteFrom('Course').execute();

	for (const course of courses) {
		await db
			.insertInto('Course')
			.values({
				id: course.id,
				name: course.name,
				code: course.code,
				credits: course.credits,
				departmentId: course.departmentId,
				level: course.level,
				comment: course.comment,
				prerequisiteCount: course.prerequisiteAmount,
				prerequisiteType: course.prerequisiteType.toUpperCase() as prerequisiteType
			})
			.execute();
	}
	for (const course of courses) {
		const newCourse = await db
			.selectFrom('Course')
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

export async function fetchCourseCodes() {
	return db.selectFrom('Course').select(['code', 'id', 'name']).execute();
}

export async function fetchCourses() {
	return db
		.selectFrom('Course')
		.select(['Course.id', 'Course.name', 'code', 'level'])
		.innerJoin('Department', 'Course.departmentId', 'Department.id')
		.execute();
}

export async function fetchCourseDetails(courseId: string) {
	const course = await db
		.selectFrom('Course')
		.where('id', '=', courseId)
		.select([
			'id',
			'name',
			'code',
			'level',
			'departmentId',
			'credits',
			'comment',
			'prerequisiteType',
			'prerequisiteCount'
		])
		.executeTakeFirstOrThrow();

	const prerequisites = await db
		.selectFrom('Prerequisites')
		.where('courseId', '=', courseId)
		.innerJoin('Course', 'Prerequisites.prerequisiteId', 'Course.id')
		.select(['name', 'Prerequisites.prerequisiteId'])
		.execute();

	const restrictions = await db
		.selectFrom('LevelRestriction')
		.where('courseId', '=', courseId)
		.select(['level', 'area', 'credits', 'id'])
		.execute();

	return {
		...course,
		prerequisites,
		restrictions: restrictions.map((r) => ({
			...r,
			level: r.level.split(',').map((l) => parseInt(l)),
			area: r.area.split(',')
		}))
	};
}

export async function deleteCourse(courseId: string) {
	return db.deleteFrom('Course').where('id', '=', courseId).execute();
}

export async function updateCourse(course: CourseDetails) {
	const { prerequisites, restrictions, ...courseData } = course;
	await db
		.updateTable('Course')
		.set({
			name: courseData.name,
			code: courseData.code,
			credits: courseData.credits,
			level: courseData.level,
			departmentId: courseData.departmentId,
			comment: courseData.comment,
			prerequisiteCount: courseData.prerequisiteCount,
			prerequisiteType: courseData.prerequisiteType
		})
		.where('id', '=', course.id)
		.execute();

	await db.deleteFrom('Prerequisites').where('courseId', '=', course.id).execute();
	await db.deleteFrom('LevelRestriction').where('courseId', '=', course.id).execute();

	for (const prerequisite of prerequisites) {
		await db
			.insertInto('Prerequisites')
			.values({
				id: crypto.randomUUID(),
				courseId: course.id,
				prerequisiteId: prerequisite
			})
			.execute();
	}

	for (const restriction of restrictions) {
		await db
			.insertInto('LevelRestriction')
			.values({
				id: crypto.randomUUID(),
				courseId: course.id,
				level: restriction.level.join(','),
				area: restriction.area.join(','),
				credits: restriction.credits
			})
			.execute();
	}
}

export async function createCourse(course: Omit<CourseDetails, 'id'>) {
	const { prerequisites, restrictions, ...courseData } = course;
	const courseId = await db
		.insertInto('Course')
		.values({
			id: generateId(),
			name: courseData.name,
			code: courseData.code,
			credits: courseData.credits,
			level: courseData.level,
			departmentId: courseData.departmentId,
			comment: courseData.comment,
			prerequisiteCount: courseData.prerequisiteCount,
			prerequisiteType: courseData.prerequisiteType
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	for (const prerequisite of prerequisites) {
		await db
			.insertInto('Prerequisites')
			.values({
				id: crypto.randomUUID(),
				courseId: courseId.id,
				prerequisiteId: prerequisite
			})
			.execute();
	}

	for (const restriction of restrictions) {
		await db
			.insertInto('LevelRestriction')
			.values({
				id: crypto.randomUUID(),
				courseId: courseId.id,
				level: restriction.level.join(','),
				area: restriction.area.join(','),
				credits: restriction.credits
			})
			.execute();
	}
}

export async function exist(
	value: string,
	field: ReferenceExpression<DB, 'Course'>,
	id: string | undefined = undefined
) {
	if (id) {
		const course = await db
			.selectFrom('Course')
			.where(field, '=', value)
			.where('id', '!=', id)
			.select('id')
			.executeTakeFirst();
		return course !== undefined;
	}
	const course = await db
		.selectFrom('Course')
		.where(field, '=', value)
		.select('id')
		.executeTakeFirst();
	return course !== undefined;
}

export async function fetchCourseHierarchy(id: string) {
	const course = await db
		.selectFrom('Course')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirstOrThrow();

	const prerequisites = await getPrerequisites(course.id);

	return prerequisites;
}

async function getPrerequisites(
	courseId: string,
	visited = new Set<string>()
): Promise<CourseRequirementDetails | null> {
	if (visited.has(courseId)) return null;
	visited.add(courseId);

	const course = await db
		.selectFrom('Course')
		.where('Course.id', '=', courseId)
		.selectAll()
		.executeTakeFirst();

	if (!course) return null;

	const prerequisites = await db
		.selectFrom('Prerequisites')
		.innerJoin('Course', 'Course.id', 'Prerequisites.prerequisiteId')
		.where('Prerequisites.courseId', '=', courseId)
		.selectAll()
		.execute();

	const restrictions = await db
		.selectFrom('LevelRestriction')
		.where('courseId', '=', courseId)
		.selectAll()
		.execute();

	const prereqsWithHierarchy = await Promise.all(
		prerequisites.map(async (prereq) => {
			return await getPrerequisites(prereq.prerequisiteId, new Set(visited));
		})
	);

	console.log(prereqsWithHierarchy);

	return {
		...course,
		restrictions: restrictions,
		prerequisites: prereqsWithHierarchy.filter((p) => p !== null) as CourseRequirementDetails[]
	};
}
