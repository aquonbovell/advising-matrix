import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import Vine from '@vinejs/vine';
import { message, superValidate } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

const defaults = {
	id: '',
	email: '',
	name: '',
	majorId: '',
	minorId: 'fb8cd353-fd2d-43c7-aa5f-856d8e087f16',
	alternate_email: '',
	alternate_email1: ''
};

const schema = Vine.object({
	id: Vine.string().trim(),
	email: Vine.string()
		.trim()
		.email()
		.regex(/@mycavehill\.uwi\.edu$/),
	alternate_email: Vine.string().trim().email(),
	alternate_email1: Vine.string().trim().email(),
	name: Vine.string().trim().minLength(3).maxLength(50),
	majorId: Vine.string().trim().uuid(),
	minorId: Vine.string().optional()
});

export const load = (async ({ locals, params }) => {
	const userId = locals.user?.id;

	if (!userId) {
		error(403, 'Unauthorized');
	}

	if (locals.user?.role === 'STUDENT') {
		error(403, 'Unauthorized');
	}

	const studentData = await db
		.selectFrom('Student')
		.innerJoin('User', 'User.id', 'Student.user_id')
		.select([
			'User.email',
			'User.name',
			'Student.major_id',
			'User.role',
			'User.id',
			'User.alternate_email',
			'Student.minor_id'
		])
		.where('Student.id', '=', params.id)
		.executeTakeFirst();

	if (!studentData) {
		error(404, 'Student Not found');
	}

	const majors = await db.selectFrom('Majors').selectAll().execute();
	const minors = await db.selectFrom('Minors').selectAll().execute();

	const form = await superValidate(vine(schema, { defaults }));
	form.data = {
		alternate_email: studentData.alternate_email || '',
		alternate_email1: '',
		id: studentData.id,
		majorId: studentData.major_id,
		minorId: studentData.minor_id,
		email: studentData.email,
		name: studentData.name || ''
	};

	return { student: { ...studentData }, majors, minors, form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, vine(schema, { defaults }));

		if (form.errors.email) {
			form.errors.email = [
				'Please enter a valid email address with the domain @mycavehill.uwi.edu'
			];
		}

		if (form.errors.name) {
			form.errors.name = ['Please enter a valid name'];
		}

		if (form.errors.majorId) {
			form.errors.majorId = ['Please select a valid major'];
		}

		if (form.errors.minorId) {
			form.errors.minorId = ['Please select a valid minor'];
		}

		if (form.errors.alternate_email) {
			form.errors.alternate_email = ['Please enter a valid email address'];
		}

		if (form.errors.alternate_email1) {
			form.errors.alternate_email1 = ['Please enter a valid email address'];
		}

		if (form.data.alternate_email !== form.data.alternate_email1) {
			form.errors.alternate_email1 = ['Alternate emails must match'];
			// the emails need to be the same
			form.errors.alternate_email = ['Alternate emails must match'];

			return fail(400, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, name, majorId, minorId, id } = form.data;

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({
						email,
						name,
						updated_at: new Date()
					})
					.where('id', '=', id)
					.execute();

				await trx
					.updateTable('Student')
					.set({ major_id: majorId, minor_id: minorId, updated_at: new Date() })
					.where('id', '=', id)
					.execute();
			});
			return message(form, 'Student updated successfully');
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to update student' });
		}
	}
};
