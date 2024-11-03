import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from './schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { UserRole } from '$lib/db/schema';
import { Argon2id } from 'oslo/password';
import { DEFAULT_PASSWORD } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}
	return { form: await superValidate(zod(userSchema)) };
};

export const actions: Actions = {
	create: async (event) => {
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
			.executeTakeFirst();

		if (userEmail) {
			form.errors.email = [...(form.errors.email ?? ''), 'Email already exists'];
			return fail(400, { form });
		}

		const userAlternateEmail = await db
			.selectFrom('User')
			.where('alternate_email', '=', form.data.alternate_email)
			.executeTakeFirst();

		if (userAlternateEmail) {
			form.errors.alternate_email = [
				...(form.errors.alternate_email ?? ''),
				'Email already exists'
			];
			return fail(400, { form });
		}
		const encoder = new TextEncoder();
		const secret = encoder.encode(process.env.SECRET!);
		const argon2id = new Argon2id({ secret });

		const password_hash = await argon2id.hash(DEFAULT_PASSWORD);

		const data = await db
			.insertInto('User')
			.values({
				id: crypto.randomUUID(),
				name: form.data.name,
				email: form.data.email,
				alternate_email: form.data.alternate_email,
				role: form.data.role as UserRole,
				password: password_hash,
				created_at: new Date(),
				updated_at: new Date()
			})
			.returning('id')
			.execute();

		const userId = data.at(0);

		if (!userId) {
			return message(form, 'An error occurred while creating the user', { status: 500 });
		}

		return redirect(303, `/admin/users/${userId.id}`);
	}
};
