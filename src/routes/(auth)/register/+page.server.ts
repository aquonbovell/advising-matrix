import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import { Argon2id } from 'oslo/password';
import { zfd } from 'zod-form-data';
import { DEFAULT_PASSWORD } from '$env/static/private';

export const load: PageServerLoad = async ({ url, locals }) => {
	const token = url.searchParams.get('token');
	if (locals.user) {
		throw redirect(302, '/');
	}

	if (!token) {
		// Validate token
		try {
			const student = await db
				.selectFrom('Student')
				.where('invite_token', '=', token)
				.select(['id', 'invite_expires'])
				.executeTakeFirst();

			if (!student || (student.invite_expires && new Date(student.invite_expires) < new Date())) {
				return { token: null, error: 'Invalid or expired invitation' };
			}
		} catch (error) {
			console.error('Database error:', error);
			return { token: null, error: 'An error occurred. Please try again later.' };
		}
	}

	return { token };
};

export const actions: Actions = {
	register: async ({ request }) => {
		const formData = await request.formData();

		const registerSchema = zfd.formData({
			token: zfd.text(),
			old_password: zfd.text(),
			password: zfd.text(),
			confirm_password: zfd.text()
		});

		const result = registerSchema.safeParse(formData);

		if (!result.success) {
			const data = {
				data: Object.fromEntries(formData),
				errors: result.error.flatten().fieldErrors
			};
			return fail(400, data);
		}

		const { old_password, password, confirm_password } = result.data;

		const argon2id = new Argon2id();

		const old_password_hash = await argon2id.hash(DEFAULT_PASSWORD);

		const userPassword = await argon2id.verify(old_password_hash, old_password);

		if (!userPassword) {
			return fail(400, { invalid: 'Invalid Current or New Password' });
		}

		if (password !== confirm_password) {
			return fail(400, { invalid: 'New Passwords do not match' });
		}

		const hashedPassword = await argon2id.hash(password);

		const user = await db
			.selectFrom('Student')
			.where('invite_token', '=', result.data.token)
			.where('invite_expires', '>', new Date(0))
			.select(['user_id'])
			.executeTakeFirst();

		if (!user) return fail(400, { invalid_token: true });

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({ password: hashedPassword, updated_at: new Date(Date.now()) })
					.where('id', '=', user.user_id)
					.execute();
				await trx
					.updateTable('Student')
					.set({ invite_token: null, invite_expires: null })
					.where('user_id', '=', user.user_id)
					.execute();
			});
		} catch (err) {
			console.error('Database error:', err);
			error(500, { message: 'An error occurred. Please try again later.' });
		}
		return redirect(302, '/login?message=registration_complete');
	}
};
