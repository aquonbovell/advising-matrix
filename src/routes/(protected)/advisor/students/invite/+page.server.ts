import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { isValidEmail } from '$lib/utils';
import { db } from '$lib/db';
import { generateTokenWithExpiration } from '$lib/server/auth';
import { generateId } from 'lucia';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email || typeof email !== 'string' || !isValidEmail(email)) {
			return fail(400, { error: 'Invalid email' });
		}

		try {
			const advisor = await db
				.selectFrom('Advisor')
				.where('user_id', '=', locals.user.id)
				.select(['id'])
				.executeTakeFirst();

			if (!advisor) {
				return fail(404, { error: 'Advisor not found' });
			}

			const { expiresAt, token } = generateTokenWithExpiration();

			await db.transaction().execute(async (trx) => {
				const userId = generateId(16);

				await trx
					.insertInto('User')
					.values({
						id: userId,
						email,
						role: 'STUDENT',
						password: '',
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					})
					.execute();

				await trx
					.insertInto('Student')
					.values({
						id: generateId(16),
						user_id: userId,
						advisor_id: advisor.id,
						invite_token: token,
						invite_expires: expiresAt.toString(),
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					})
					.execute();
			});

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Failed to invite student' });
		}
	}
};
