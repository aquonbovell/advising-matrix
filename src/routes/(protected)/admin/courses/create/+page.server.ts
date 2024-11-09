import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { courseSchema } from './schema';
import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { create, find } from '$lib/actions/course.action';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}
	const form = await superValidate(zod(courseSchema));

	const departments = await db.selectFrom('Departments').selectAll().execute();
	const courses = await db.selectFrom('Courses').selectAll().execute();

	return {
		form,
		departments,
		courses
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(courseSchema));

		if (event.locals.user?.role !== 'ADMIN') {
			return message(form, 'You are not authorized to perform this action', { status: 401 });
		}

		if (!form.valid) {
			return fail(400, { form });
		}
		const course = await find(form.data.code, form.data.name);

		if (course && course.code === form.data.code) {
			form.errors.code = [...(form.errors.code ?? ''), 'Course already exists with this code'];
			return fail(400, { form });
		}

		if (course && course.name === form.data.name) {
			form.errors.name = [...(form.errors.name ?? ''), 'Course already exists with this name'];
			return fail(400, { form });
		}

		const courseData = { ...form.data, id: crypto.randomUUID() };

		try {
			const result = await create(courseData);

			if (!result.success) {
				error(500, { message: 'Failed to create course' });
			}

			return message(form, 'Course updated successfully');
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to create course' });
		}
	}
};
