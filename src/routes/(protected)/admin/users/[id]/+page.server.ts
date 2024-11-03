import { db } from '$lib/db';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';
import { DEFAULT_PASSWORD } from '$env/static/private';
import { error, fail, redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { userSchema } from './schema';
import type { UserRole } from '$lib/db/schema';

type DataUser = {
	id: string;
	alternate_email: string;
	email: string;
	name: string;
	role: UserRole;
};

async function getUserForm(user: DataUser) {
	const form = await superValidate(zod(userSchema));

	if (user.role === 'ADMIN') {
		throw error(403, 'Admins cannot be edited');
	}

	form.data = {
		id: user.id,
		alternate_email: user.alternate_email,
		email: user.email,
		name: user.name,
		role: user.role
	};

	return form;
}

export const load = (async ({ params }) => {
	try {
		const user = await db
			.selectFrom('User')
			.where('id', '=', params.id)
			.select(['id', 'role', 'email', 'name', 'alternate_email'])
			.executeTakeFirst();
		if (!user) error(404, { message: 'User not found' });
		return { person: user, form: await getUserForm(user) };
	} catch (err) {
		console.error(err);
		error(500, 'An error occurred while fetching the user');
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') error(401, 'Unauthorized');

		try {
			// Reset the password
			const user = await db
				.selectFrom('User')
				.where('id', '=', params.id)
				.select('id')
				.executeTakeFirst();

			if (!user) return fail(404, { message: 'User not found' });

			const encoder = new TextEncoder();
			const secret = encoder.encode(process.env.SECRET!);
			const argon2id = new Argon2id({ secret });

			const hashedPassword = await argon2id.hash(DEFAULT_PASSWORD);

			const result = await db
				.updateTable('User')
				.set('password', hashedPassword)
				.where('id', '=', user.id)
				.execute();

			if (!result) return fail(404, { message: 'Failed to reset password' });
			return { success: true };
		} catch (err) {
			console.error(err);
			error(500, { message: 'An error occurred while resetting the password' });
		}
	},
	edit: async (event) => {
		const form = await superValidate(event, zod(userSchema));

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
