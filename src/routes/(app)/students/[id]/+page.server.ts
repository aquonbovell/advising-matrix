import { deleteUser, fetchUser } from '$lib/actions/user.actions';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteStudent, fetchStudentDetails } from '$lib/actions/student.actions';

export const load: PageServerLoad = async ({ params, locals }) => {
	const role = locals.user?.role;

	if (role === 'STUDENT') {
		redirect(303, '/');
	}
	const { id } = params;
	try {
		const student = await fetchStudentDetails(id);
		return {
			student: {
				...student,
				role: student.role.toLowerCase(),
				program: `${student.major} ${student.minor ? ' with ' + student.minor : student.major2 ? ' and ' + student.major2 : ''}`
			}
		};
	} catch (err) {
		console.error(err);
		return error(404, { message: 'Not found' });
	}
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete students' });
		}
		const { id } = params;
		try {
			await deleteStudent(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete student' });
		}
		return { success: true };
	}
};
