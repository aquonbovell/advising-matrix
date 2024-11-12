import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import { DEFAULT_PASSWORD } from '$env/static/private';
import { Argon2id } from 'oslo/password';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';

async function getForm(token: string | null, isValid: boolean = true, message?: string) {
	const form = await superValidate(zod(formSchema));
	form.data.token = token ?? '';
	if (!isValid) {
		form.errors.token = [
			...(form.errors.token ?? ''),
			message ?? 'Invalid token or your invitation has expired'
		];
	}

	return form;
}

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return {};
	}

	try {
		// Check if the token is valid
		const student = await db
			.selectFrom('Student')
			.where('invite_token', '=', token)
			.select(['id', 'invite_expires'])
			.executeTakeFirst();

		if (!student || (student.invite_expires && new Date(student.invite_expires) < new Date())) {
			return {};
		}
	} catch (err) {
		console.error('Database error:', err);
		error(500, { message: 'An error occurred. Please try again later.' });
	}

	return { token, form: await getForm(token) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const alternate_email = form.data.alternate_email;
		const token = form.data.token;
		const defaultPassword = form.data.defaultPassword;
		const password = form.data.password;
		const passwordConfirm = form.data.passwordConfirm;

		const user = await db
			.selectFrom('Student')
			.innerJoin('User', 'User.id', 'Student.user_id')
			.where('invite_token', '=', token)
			.where('invite_expires', '>', new Date(0))
			.where((eb) => eb('email', '=', email).or('alternate_email', '=', alternate_email))
			.select(['User.id', 'password', 'role', 'Student.user_id'])
			.executeTakeFirst();

		if (!user) {
			form.errors.alternate_email = [
				...(form.errors.alternate_email ?? ''),
				'Invalid email or access token'
			];
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or access token'];
			form.errors.token = [...(form.errors.token ?? ''), 'Invalid email or access token'];
			return fail(400, { form });
		}

		const encoder = new TextEncoder();
		const secret = encoder.encode(process.env.SECRET!);
		const argon2id = new Argon2id({ secret });

		const defaultHash = await argon2id.hash(DEFAULT_PASSWORD);

		const userPassword = await argon2id.verify(defaultHash, defaultPassword);

		if (!userPassword) {
			form.errors.alternate_email = [
				...(form.errors.alternate_email ?? ''),
				'Invalid email or password'
			];
			form.errors.email = [...(form.errors.email ?? ''), 'Invalid email or password'];
			form.errors.password = [...(form.errors.password ?? ''), 'Invalid email or password'];
			form.errors.passwordConfirm = [
				...(form.errors.passwordConfirm ?? ''),
				'Invalid email or password'
			];
			return fail(400, { form });
		}

		if (password !== passwordConfirm) {
			form.errors.password = [...(form.errors.password ?? ''), 'Passwords do not match'];
			form.errors.passwordConfirm = [
				...(form.errors.passwordConfirm ?? ''),
				'Passwords do not match'
			];
			return fail(400, { form });
		}

		const passwordHash = await argon2id.hash(password);

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({ password: passwordHash, updated_at: new Date(Date.now()) })
					.where('id', '=', user.id)
					.execute();
				await trx
					.updateTable('Student')
					.set({ invite_token: null, invite_expires: null, updated_at: new Date(Date.now()) })
					.where('user_id', '=', user.user_id)
					.execute();
			});
		} catch (err) {
			console.error('Database error:', err);
			error(500, { message: 'An error occurred. Please try again later.' });
		}
		return redirect(302, '/login');
	}
};
