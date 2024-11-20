import { deleteUser, fetchUsers } from '$lib/actions/user.actions';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteFaculty, fetchFaculties } from '$lib/actions/faculty.actions';
import { fetchDepartments } from '$lib/actions/department.actions';
import { deleteMajor, fetchMajors } from '$lib/actions/major.actions';

export const load: PageServerLoad = async () => {
	return { majors: await fetchMajors() };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteMajor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete major' });
		}
		return redirect(302, '/majors');
	}
};
