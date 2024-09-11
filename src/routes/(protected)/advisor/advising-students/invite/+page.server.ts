import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/db';
import { generateTokenWithExpiration } from '$lib/server/auth';
import { generateId } from 'lucia';
import Vine from '@vinejs/vine';
import { message, superValidate, setError } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from '../$types';
import { Argon2id } from 'oslo/password';
import { DEFAULT_PASSWORD } from '$env/static/private';

const defaults = { official_email: '', alternate_email: '', name: '', majorId: '', minorId: '' };

const schema = Vine.object({
	official_email: Vine.string()
		.trim()
		.email()
		.regex(/@mycavehill\.uwi\.edu$/),
	alternate_email: Vine.string().trim().email(),
	name: Vine.string().trim().minLength(3).maxLength(50),
	majorId: Vine.string().trim().uuid(),
	minorId: Vine.string().optional()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(vine(schema, { defaults }));

	const majors = await db
		.selectFrom('Majors')
		.select(['Majors.id as id', 'name'])
		.innerJoin('MajorRequirements', 'MajorRequirements.majorId', 'Majors.id')
		.groupBy('Majors.id')
		.execute();

	const minors = await db
		.selectFrom('Minors')
		.select(['Minors.id as id', 'name'])
		.innerJoin('MinorRequirements', 'MinorRequirements.minorId', 'Minors.id')
		.groupBy('Minors.id')
		.execute();

	return { form, majors, minors };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}

		const form = await superValidate(request, vine(schema, { defaults }));

		if (form.errors.official_email) {
			form.errors.official_email = [
				'Please enter a valid email address with the domain @mycavehill.uwi.edu'
			];
		}

		if (form.errors.alternate_email) {
			form.errors.alternate_email = ['Please enter a valid email address'];
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

		if (!form.valid) {
			return fail(400, { form });
		}

		const { official_email, alternate_email, name, majorId, minorId } = form.data;

		const studentOfficialEmails = await db
			.selectFrom('User')
			.where('email', '=', official_email)
			.execute();

		if (studentOfficialEmails.length > 0) {
			return setError(form, 'Student already exists on official email');
		}

		const studentAlternateEmails = await db
			.selectFrom('User')
			.where('alternate_email', '=', alternate_email)
			.execute();

		if (studentAlternateEmails.length > 0) {
			return setError(form, 'Student already exists on alternate email');
		}

		try {
			const { expiresAt, token } = generateTokenWithExpiration();

			await db.transaction().execute(async (trx) => {
				const userId = crypto.randomUUID();
				const student_id = crypto.randomUUID();
				const argon2id = new Argon2id();

				const hashedPassword = await argon2id.hash(DEFAULT_PASSWORD);

				await trx
					.insertInto('User')
					.values({
						id: userId,
						name,
						email: official_email,
						alternate_email,
						role: 'STUDENT',
						password: hashedPassword,
						created_at: new Date(),
						updated_at: new Date()
					})
					.execute();

				await trx
					.insertInto('StudentT')
					.values({
						id: student_id,
						user_id: userId,
						major_id: majorId,
						invite_token: token,
						minor_id:
							minorId === '' || minorId === undefined
								? 'fb8cd353-fd2d-43c7-aa5f-856d8e087f16'
								: minorId,
						invite_expires: new Date(expiresAt),
						created_at: new Date(),
						updated_at: new Date()
					})
					.execute();

				await trx
					.insertInto('Advisor')
					.values({
						advisor_id: locals.user?.id!,
						student_id: student_id
					})
					.execute();
			});

			return message(form, 'Invitation sent successfully!');
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to invite student' });
		}
	}
};
