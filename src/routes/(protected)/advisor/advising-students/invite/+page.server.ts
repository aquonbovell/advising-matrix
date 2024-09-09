import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/db';
import { generateTokenWithExpiration } from '$lib/server/auth';
import { generateId } from 'lucia';
import Vine from '@vinejs/vine';
import { message, superValidate } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from '../$types';
import { Argon2id } from 'oslo/password';
import { DEFAULT_PASSWORD } from '$env/static/private';

const defaults = { official_email: '', alternate_email: '', name: '', programId: '' };

const schema = Vine.object({
	official_email: Vine.string()
		.trim()
		.email()
		.regex(/@mycavehill\.uwi\.edu$/),
	alternate_email: Vine.string().trim().email(),
	name: Vine.string().trim().minLength(3).maxLength(50),
	programId: Vine.string().trim().uuid()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(vine(schema, { defaults }));

	const programs = await db.selectFrom('Program').select(['id', 'name']).execute();

	return { form, programs };
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

		if (form.errors.programId) {
			form.errors.programId = ['Please select a valid program'];
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const { official_email, alternate_email, name, programId } = form.data;

		try {
			const advisor = await db
				.selectFrom('Advisor')
				.where('advisor_id', '=', locals.user.id)
				.select(['advisor_id'])
				.executeTakeFirst();

			if (!advisor) {
				return fail(404, { form, error: 'Advisor not found' });
			}

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
					.insertInto('Student')
					.values({
						id: student_id,
						user_id: userId,
						program_id: programId,
						invite_token: token,
						invite_expires: new Date(expiresAt),
						created_at: new Date(),
						updated_at: new Date()
					})
					.execute();

				await trx
					.insertInto('Advisor')
					.values({
						advisor_id: advisor.advisor_id,
						student_id: userId
					})
					.execute();
			});

			return message(form, 'Invitation sent successfully!');
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Failed to invite student' });
		}
	}
};
