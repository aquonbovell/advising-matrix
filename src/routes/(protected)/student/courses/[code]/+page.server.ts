import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { courseSchema } from './schema';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw error(401, 'Unauthorized');
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
