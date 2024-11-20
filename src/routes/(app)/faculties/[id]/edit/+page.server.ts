import { fetchUser, updateUser } from '$lib/actions/user.actions';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { deleteFaculty, fetchFaculty, updateFaculty } from '$lib/actions/faculty.actions';
import { facultyUpdateSchema } from './facultyUpdateSchema.schema';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const faculty = await fetchFaculty(id);
	if (!faculty) {
		return error(404, { message: 'Faculty not found' });
	}
	const form = await superValidate({ ...faculty }, zod(facultyUpdateSchema));
	return { form };
};

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(facultyUpdateSchema));
		if (!form.valid) return fail(404, { form });
		console.log(form.data);

		const facultyName = await db
			.selectFrom('Faculty')
			.where('name', '=', form.data.name)
			.where('id', '!=', form.data.id)
			.select(['name'])
			.executeTakeFirst();

		if (facultyName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Faculty already exists. Please choose another faculty name'
			];
			return fail(400, { form });
		}

		try {
			const facultyId = await updateFaculty({ ...form.data });
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	},
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteFaculty(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete faculty' });
		}
		return redirect(302, '/faculties');
	}
};
