import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { courseSchema } from './schema';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}
	const form = await superValidate(zod(courseSchema));
	const course = await db
		.selectFrom('Courses')
		.where('code', '=', params.code)
		.selectAll()
		.executeTakeFirst();

	if (!course) error(404, 'Course not found');

	const prerequisites = await db
		.selectFrom('Prerequisites')
		.where('Prerequisites.courseId', '=', course.id)
		.select('Prerequisites.prerequisiteId')
		.execute();

	const levelRestrictions = await db
		.selectFrom('LevelRestriction')
		.where('courseId', '=', course.id)
		.selectAll()
		.execute();

	const departments = await db.selectFrom('Departments').selectAll().execute();
	const courses = await db.selectFrom('Courses').selectAll().execute();

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

		if (event.locals.user?.role !== 'ADMIN') {
			return message(form, 'You are not authorized to perform this action', { status: 401 });
		}

		if (!form.valid) {
			return fail(400, { form });
		}
		const courseCode = await db
			.selectFrom('Courses')
			.where('code', '=', form.data.code)
			.where('id', '!=', form.data.id)
			.select('id')
			.executeTakeFirst();

		if (courseCode) {
			form.errors.code = [...(form.errors.code ?? ''), 'Course already exists with this code'];
			return fail(400, { form });
		}

		const courseName = await db
			.selectFrom('Courses')
			.where('code', '=', form.data.name)
			.where('id', '!=', form.data.id)
			.select('id')
			.executeTakeFirst();

		if (courseName) {
			form.errors.name = [...(form.errors.name ?? ''), 'Course already exists with this name'];
			return fail(400, { form });
		}

		const courseData = form.data;

		try {
			await db.transaction().execute(async (db) => {
				const course = await db
					.updateTable('Courses')
					.set({
						name: courseData.name,
						credits: courseData.credits,
						departmentId: courseData.departmentId,
						level: parseInt(courseData.code[4] ?? '0'),
						prerequisiteAmount: courseData.prerequisites.requiredAmount,
						prerequisiteType: courseData.prerequisites.dataType,
						comment: courseData.comment
					})
					.where('code', '=', courseData.code)
					.returning('id')
					.executeTakeFirst();

				const courseId = course?.id;

				if (!courseId) {
					return;
				}

				await db.deleteFrom('LevelRestriction').where('courseId', '=', courseId).execute();

				for (const levelRestriction of courseData.levelRestriction) {
					await db
						.insertInto('LevelRestriction')
						.values({
							id: crypto.randomUUID(),
							courseId: courseId,
							level: levelRestriction.level.join(','),
							credits: levelRestriction.credits,
							area: levelRestriction.area.join(',')
						})
						.execute();
				}

				await db.deleteFrom('Prerequisites').where('courseId', '=', courseId).execute();

				for (const prerequisite of courseData.prerequisites.courses) {
					await db
						.insertInto('Prerequisites')
						.values({
							id: crypto.randomUUID(),
							courseId: courseId,
							prerequisiteId: prerequisite
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
