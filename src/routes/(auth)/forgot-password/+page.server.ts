import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { db } from '$lib/db';
import { hashPassword } from '$lib/utils';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const registerSchema = zfd.formData({
			email: zfd.text(
				z
					.string()
					.email()
					.regex(
						/(@cavehill\.uwi\.edu|@mycavehill\.uwi\.edu)$/i,
						'Must be a UWI Cave Hill email address'
					)
			),
			alternate_email: zfd.text(),
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

		if (result.data.password !== result.data.confirm_password) {
			return fail(400, {
				errors: { confirm_password: 'Passwords do not match', password: 'Passwords do not match' }
			});
		}

		const user = await db
			.selectFrom('User')
			.where('email', '=', result.data.email)
			.where('alternate_email', '=', result.data.alternate_email)
			.select(['id'])
			.executeTakeFirst();

		if (!user) {
			return fail(400, { errors: { user: 'Invalid Credentials' } });
		}

		const hashedPassword = await hashPassword(result.data.password);

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({ password: hashedPassword, updated_at: new Date(Date.now()) })
					.where('id', '=', user.id)
					.execute();
			});
		} catch (err) {
			console.error('Database error:', err);
			error(500, { message: 'An error occurred. Please try again later.' });
		}

		return redirect(302, '/login');
	}
};
