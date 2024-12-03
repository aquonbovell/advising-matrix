import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { onboardingSchema } from '$lib/schemas/onboarding';
import { superValidate } from 'sveltekit-superforms';
import { completeOnboarding, exist, userTokenExpiration } from '$lib/server/actions/user.actions';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = locals;
	if (!session || !user) {
		return redirect(307, '/login');
	}
	if (user.onboarded) {
		return redirect(307, '/');
	}
	const form = await superValidate(zod(onboardingSchema));

	form.data.id = user.id;

	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(onboardingSchema));

		if (!form.valid) {
			return { form };
		}

		const token = await exist(form.data.token, 'invite_token');
		if (!token) {
			form.errors.token = [...(form.errors.token ?? ''), 'Token does not exist'];
			form.data.password = '';
			form.data.password1 = '';
			return fail(400, { form });
		}

		const expires = await userTokenExpiration(form.data.id, form.data.token);

		// TODO: Determine if this is the correct way to check for expiration
		if (!expires) {
			form.errors.token = [...(form.errors.token ?? ''), 'Invalid token provided'];
			form.data.password = '';
			form.data.password1 = '';
			return fail(400, { form });
		}

		if (expires.invite_expires && new Date(expires.invite_expires).getTime() < Date.now()) {
			form.errors.token = [
				...(form.errors.token ?? ''),
				'Token has expired. Please request a new one.'
			];
			form.data.password = '';
			form.data.password1 = '';
			return fail(400, { form });
		}

		if (form.data.password !== form.data.password1) {
			form.errors.password = [...(form.errors.password ?? ''), 'Passwords do not match'];
			form.errors.password1 = [...(form.errors.password1 ?? ''), 'Passwords do not match'];
			form.data.password = '';
			form.data.password1 = '';
			return fail(400, { form });
		}

		try {
			await completeOnboarding(form.data.id, form.data.password);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}

		return redirect(303, '/');
	}
};
