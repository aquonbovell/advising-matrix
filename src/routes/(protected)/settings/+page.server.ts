import { db } from '$lib/db';
import { zfd } from 'zod-form-data';
import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth';

export const load = (async ({ locals }) => {
	error(500, 'Not implemented');
	const user = await db
		.selectFrom('User')
		.where('id', '=', locals?.user?.id!)
		.select(['id', 'email', 'name', 'role', 'alternate_email'])
		.executeTakeFirst();

	if (!user) {
		error(404, { message: 'User not found' });
	}

	let program;

	if (user?.role === 'STUDENT') {
		program = await db
			.selectFrom('Student')
			// .where('user_id', '=', user.id)
			.select(['program_id'])
			.executeTakeFirst();
	}

	const programs = await db.selectFrom('Program').select(['id', 'name']).execute();

	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	save: async ({ locals, request }) => {
		const formData = await request.formData();

		const userSchema = zfd.formData({
			name: zfd.text(z.string().min(3).max(255))
		});

		const result = userSchema.safeParse(formData);

		if (!result.success) {
			const data = {
				data: Object.fromEntries(formData),
				errors: result.error.flatten().fieldErrors
			};
			return fail(400, data);
		}

		const { name } = result.data;

		await db.updateTable('User').set({ name }).where('id', '=', locals.user?.id!).execute();

		return { success: true, message: 'Saved' };
	},
	resetPassword: async ({ request, locals }) => {
		const userSession = locals.session;
		if (!userSession) return redirect(302, '/login');

		const formData = await request.formData();

		const registerSchema = zfd.formData({
			id: zfd.text(),
			old_password: zfd.text(z.string().min(8)),
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

		if (result.data?.id !== locals.user?.id) {
			return fail(400, { data_invalid: 'Invalid User' });
		}

		const { old_password, password, confirm_password } = result.data;

		const argon2id = new Argon2id();

		const user = await db
			.selectFrom('User')
			.where('id', '=', locals.user?.id!)
			.select(['password', 'id'])
			.executeTakeFirst();

		if (!user) {
			return fail(400, { data_invalid: 'Invalid User' });
		}

		const old_password_hash = user?.password ?? '';

		const userPassword = await argon2id.verify(old_password_hash, old_password);

		if (!userPassword) {
			return fail(400, { data_invalid: 'Invalid Credentials' });
		}

		if (password !== confirm_password) {
			return fail(400, { data_invalid: 'Passwords do not match' });
		}

		const hashedPassword = await argon2id.hash(password);
		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({ password: hashedPassword, updated_at: new Date(Date.now()) })
					.where('id', '=', user?.id!)
					.execute();
			});
		} catch (err) {
			console.error('Database error:', err);
			error(500, { message: 'An error occurred. Please try again later.' });
		}
		await lucia.invalidateSession(userSession.id);

		return redirect(302, '/login');
	}
};
