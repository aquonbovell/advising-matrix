import { error, fail, json, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { message, superValidate } from 'sveltekit-superforms';
import { vine, zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';
import type { UserRole } from '$lib/db/schema';
async function getForm(student: {
	id: string;
	major_id: string;
	minor_id: string;
	email: string;
	name: string;
	role: UserRole;
	alternate_email: string;
}) {
	const form = await superValidate(zod(formSchema));
	form.data = {
		id: student.id,
		email: student.email,
		name: student.name,
		majorId: student.major_id,
		minorId: student.minor_id,
		alternateEmail: student.alternate_email,
		alternateEmailConfirm: ''
	};

	return form;
}

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

	const majors = await db.selectFrom('Majors').select(['Majors.id', 'Majors.name']).execute();
	const minors = await db
		.selectFrom('Minors')
		.select(['Minors.id as id', 'name'])
		// .innerJoin('MinorRequirements', 'MinorRequirements.minorId', 'Minors.id')
		// .union(
		// 	db
		// 		.selectFrom('Majors')
		// 		.select(['Majors.id as id', 'name'])
		// 		.where('Majors.name', 'not like', '%Double%')
		// )
		// .groupBy('Minors.id')
		.execute();

	return { majors, minors, form: await getForm(studentData) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const userId = event.locals.user?.id;

		if (!userId) {
			error(403, 'Unauthorized');
		}

		if (event.locals.user?.role === 'STUDENT') {
			error(403, 'Unauthorized');
		}
		const form = await superValidate(event, zod(formSchema));
		console.log(form);
		if (!form.valid) {
			return fail(400, { form });
		}

		const official_email = form.data.email;
		const alternate_email = form.data.alternateEmail;
		const alternate_email1 = form.data.alternateEmailConfirm;
		const name = form.data.name;
		const majorId = form.data.majorId;
		const minorId = form.data.minorId;
		const id = form.data.id;

		if (alternate_email !== alternate_email1) {
			form.errors.alternateEmail = [
				...(form.errors.alternateEmail ?? ''),
				'Alternate emails must match'
			];
			form.errors.alternateEmailConfirm = [
				...(form.errors.alternateEmailConfirm ?? ''),
				'Alternate emails must match'
			];
			return fail(400, { form });
		}

		const user = await db
			.selectFrom('User')
			.where('id', 'in', [id])
			.select(['id', 'email'])
			.executeTakeFirst();

		if (!user) {
			form.errors.email = [...(form.errors.email ?? ''), 'Student does not exist'];
			form.errors.name = [...(form.errors.name ?? ''), 'Student does not exist'];
			form.errors.majorId = [...(form.errors.majorId ?? ''), 'Student does not exist'];
			form.errors.minorId = [...(form.errors.minorId ?? ''), 'Student does not exist'];
			form.errors.alternateEmail = [
				...(form.errors.alternateEmail ?? ''),
				'Student does not exist'
			];

			return fail(400, { form });
		}

		if (user.email !== official_email) {
			form.errors.email = [...(form.errors.email ?? ''), 'Cant change official email'];
			return fail(400, { form });
		}

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({
						email: official_email,
						name: name,
						alternate_email: alternate_email,
						updated_at: new Date()
					})
					.where('id', '=', user.id)
					.execute();

				await trx
					.updateTable('Student')
					.set({ major_id: majorId, minor_id: minorId, updated_at: new Date() })
					.where('user_id', '=', user.id)
					.execute();
			});
			return message(form, 'Student updated successfully');
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to update student' });
		}
	}
};
