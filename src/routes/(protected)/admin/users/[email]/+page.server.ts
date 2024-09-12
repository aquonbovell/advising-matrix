import { db } from '$lib/db';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';
import { DEFAULT_PASSWORD } from '$env/static/private';
import { error, fail } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const user = await db
		.selectFrom('User')
		.where('email', '=', params.email)
		.select(['id', 'role', 'email', 'name'])
		.executeTakeFirst();
	if (!user) error(404, { message: 'User not found' });
	return { person: user };
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async ({ params, locals }) => {
		console.log(locals);

		if (locals.user?.role !== 'ADMIN') error(401, 'Unauthorized');

		// Reset the password
		const user = await db
			.selectFrom('User')
			.where('email', '=', params.email)
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
	}
};
