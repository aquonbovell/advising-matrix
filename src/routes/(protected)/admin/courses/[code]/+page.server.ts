import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { courseSchema } from './schema';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ params }) => {
	const form = await superValidate(zod(courseSchema));
	const course = await db
		.selectFrom('Course')
		.where('code', '=', params.code)
		.selectAll()
		.executeTakeFirst();

	if (!course) error(404, 'Course not found');

	const prerequisites = await db
		.selectFrom('CoursePrerequisite')
		.where('CoursePrerequisite.courseId', '=', course.id)
		.select('CoursePrerequisite.prerequisiteId')
		.execute();

	const levelRestrictions = await db
		.selectFrom('CoursesLevelRestriction')
		.where('courseId', '=', course.id)
		.selectAll()
		.execute();

	const departments = await db.selectFrom('Department').selectAll().execute();
	const courses = await db.selectFrom('Course').selectAll().execute();

	if (!course) {
		redirect(303, '/courses');
	}

	form.data = {
		...course,
		levelRestriction: levelRestrictions.map((levelRestriction) => ({
			...levelRestriction,
			area: levelRestriction.area.split(','),
			level: levelRestriction.level.split(',').map((level) => parseInt(level))
		})),
		prerequisites: {
			courses: prerequisites.map((prerequisite) => prerequisite.prerequisiteId.toString()),
			dataType: course.prerequisiteType as 'all' | 'one',
			requiredAmount: course.prerequisiteAmount
		}
	};

	return {
		form,
		departments,
		courses
	};
};

export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(courseSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		const courseData = form.data;

		try {
			await db.transaction().execute(async (db) => {
				const course = await db
					.updateTable('Course')
					.set({
						name: courseData.name,
						credits: courseData.credits,
						departmentId: courseData.departmentId,
						level: parseInt(courseData.code[4] ?? '0'),
						prerequisiteAmount: courseData.prerequisites.requiredAmount,
						prerequisiteType: courseData.prerequisites.dataType
					})
					.where('code', '=', courseData.code)
					.returning('id')
					.executeTakeFirst();

				const courseId = course?.id;

				if (!courseId) {
					return;
				}

				await db.deleteFrom('CoursesLevelRestriction').where('courseId', '=', courseId).execute();

				for (const levelRestriction of courseData.levelRestriction) {
					await db
						.insertInto('CoursesLevelRestriction')
						.values({
							id: crypto.randomUUID(),
							courseId: courseId,
							level: levelRestriction.level.join(','),
							credits: levelRestriction.credits,
							area: levelRestriction.area.join(',')
						})
						.execute();
				}

				await db.deleteFrom('CoursePrerequisite').where('courseId', '=', courseId).execute();

				for (const prerequisite of courseData.prerequisites.courses) {
					await db
						.insertInto('CoursePrerequisite')
						.values({
							id: crypto.randomUUID(),
							courseId: courseId,
							prerequisiteId: parseInt(prerequisite)
						})
						.execute();
				}
			});
			return message(form, 'Course updated successfully');
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to update course' });
		}
	}
};
