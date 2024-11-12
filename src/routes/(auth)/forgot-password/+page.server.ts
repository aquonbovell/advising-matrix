import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db';
import { Argon2id } from 'oslo/password';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(formSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		const email = form.data.email;
		const alternate_email = form.data.alternate_email;
		const password = form.data.password;
		const passwordConfirm = form.data.confirmPassword;

		if (password !== passwordConfirm) {
			form.errors.password = [...(form.errors.password ?? ''), 'Passwords do not match'];
			form.errors.confirmPassword = [
				...(form.errors.confirmPassword ?? ''),
				'Passwords do not match'
			];
			return fail(400, {
				form
			});
		}

		const user = await db
			.selectFrom('User')
			.where('email', '=', email)
			.where('alternate_email', '=', alternate_email)
			.select(['id'])
			.executeTakeFirst();

		if (!user) {
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or alternate email'];
			form.errors.alternate_email = [
				...(form.errors.alternate_email ?? ''),
				'Invalid email or alternate email'
			];
			form.errors.password = [...(form.errors.password ?? ''), 'Invalid email or alternate email'];

			return fail(400, { form });
		}

		const encoder = new TextEncoder();
		const secret = encoder.encode(process.env.SECRET!);
		const argon2id = new Argon2id({ secret });

		const hashedPassword = await argon2id.hash(password);

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
