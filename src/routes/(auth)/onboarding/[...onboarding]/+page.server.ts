import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { onboardingSchema } from './onboarding.schema';
import { superValidate } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = locals;
	if (!session || !user) {
		return redirect(307, '/login');
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

		// do something with form.data

		return redirect(303, '/');
	}
};
