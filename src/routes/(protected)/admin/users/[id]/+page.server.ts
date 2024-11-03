import { db } from '$lib/db';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';
import { DEFAULT_PASSWORD } from '$env/static/private';
import { error, fail, redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { userSchema } from './schema';
import type { UserRole } from '$lib/db/schema';

export const load = (async ({ params }) => {
	const form = await superValidate(zod(userSchema));

	const user = await db
		.selectFrom('User')
		.where('id', '=', params.id)
		.select(['id', 'role', 'email', 'name', 'alternate_email'])
		.executeTakeFirst();

	if (!user) {
		error(404, { message: 'User not found' });
	}

	if (user?.role === 'ADMIN') {
		error(400, { message: 'Cannot edit an admin user' });
	}
	form.data = {
		id: user.id,
		alternate_email: user.alternate_email,
		email: user.email,
		name: user.name,
		role: user.role
	};
	return { person: user, form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN')
			return fail(401, {
				message: 'You are not authorized to perform this action',
				success: false
			});

		try {
			// Reset the password
			const user = await db
				.selectFrom('User')
				.where('id', '=', params.id)
				.select('id')
				.executeTakeFirst();

			if (!user) return fail(404, { message: 'User not found', success: false });

			const encoder = new TextEncoder();
			const secret = encoder.encode(process.env.SECRET!);
			const argon2id = new Argon2id({ secret });

			const hashedPassword = await argon2id.hash(DEFAULT_PASSWORD);

			const result = await db
				.updateTable('User')
				.set('password', hashedPassword)
				.where('id', '=', user.id)
				.execute();

			if (!result) return fail(404, { message: 'Failed to reset password', success: false });
			return { success: true };
		} catch (err) {
			console.error(err);
			error(500, { message: 'An error occurred while resetting the password' });
		}
	},
	edit: async (event) => {
		const form = await superValidate(event, zod(userSchema));

		if (event.locals.user?.role !== 'ADMIN') {
			return message(form, 'You are not authorized to perform this action', { status: 401 });
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		const userEmail = await db
			.selectFrom('User')
			.where('email', '=', form.data.email)
			.where('id', '!=', form.data.id)
			.executeTakeFirst();

		if (userEmail) {
			form.errors.email = [...(form.errors.email ?? ''), 'Email already exists'];
			return fail(400, { form });
		}

		const userAlternateEmail = await db
			.selectFrom('User')
			.where('alternate_email', '=', form.data.alternate_email)
			.where('id', '!=', form.data.id)
			.executeTakeFirst();

		if (userAlternateEmail) {
			form.errors.alternate_email = [
				...(form.errors.alternate_email ?? ''),
				'Email already exists'
			];
			return fail(400, { form });
		}

		const data = await db
			.updateTable('User')
			.set({
				name: form.data.name,
				email: form.data.email,
				alternate_email: form.data.alternate_email,
				role: form.data.role as UserRole,
				updated_at: new Date()
			})
			.where('id', '=', form.data.id)
			.returning('id')
			.execute();

		const userId = data.at(0);

		if (!userId) {
			error(500, { message: 'An error occurred. Please try again later.' });
		}

		return redirect(303, `/admin/users/${userId.id}`);
	}
};
