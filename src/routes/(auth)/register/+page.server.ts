import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import { Argon2id } from 'oslo/password';

export const load: PageServerLoad = async ({ url, locals }) => {
	const token = url.searchParams.get('token');
	if (locals.user) {
		throw redirect(302, '/');
	}

	if (!token) {
		throw redirect(302, '/login');
	}

	return { token };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token') as string;
		const password = formData.get('password') as string;

		if (!token || !password) {
			return fail(400, { error: 'Invalid request' });
		}

		try {
			const student = await db
				.selectFrom('Student')
				.where('invite_token', '=', token)
				.select(['id', 'user_id', 'invite_expires'])
				.executeTakeFirst();

			if (!student || (student.invite_expires && new Date(student.invite_expires) < new Date())) {
				return fail(400, { error: 'Invalid or expired invitation' });
			}

			const hashedPassword = await new Argon2id().hash(password);

			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({ password: hashedPassword })
					.where('id', '=', student.user_id)
					.execute();

				await trx
					.updateTable('Student')
					.set({ invite_token: null, invite_expires: null })
					.where('id', '=', student.id)
					.execute();
			});

			// return { success: true };
			redirect(302, '/login');
		} catch (_err) {
			return fail(500, { error: 'Internal server error' });
		}
	}
};
