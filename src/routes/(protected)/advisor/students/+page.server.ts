import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { restrict } from '$lib/utils';
import { trpcServer } from '$lib/server/server';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const order = restrict(event.url.searchParams.get('order'), ['asc', 'desc']) ?? 'asc';
	const pageIndex = Math.max(0, parseInt(event.url.searchParams.get('pageIndex') ?? '0', 10));
	const pageSize = Math.max(
		1,
		Math.min(100, parseInt(event.url.searchParams.get('pageSize') ?? '10', 10))
	);

	const result = await trpcServer.students.getStudents.ssr(
		{
			order,
			page: pageIndex,
			size: pageSize
		},
		event
	);

	return {
		students: result!.students,
		count: result!.count
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}
		const formData = await request.formData();
		const studentCode = formData.get('student_code') as string;

		try {
			const result = await db
				.insertInto('Advisor')
				.values({
					advisor_id: locals.user.id,
					student_id: studentCode
				})
				.execute();
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while adding the student' });
		}
		throw redirect(303, '/advisor/students');
	}
};
