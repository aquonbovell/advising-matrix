import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { trpcServer } from '$lib/server/server';
import { restrict } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user?.role !== 'ADVISOR') {
		error(401, 'Unauthorized');
	}

	const order = restrict(event.url.searchParams.get('order'), ['asc', 'desc']) ?? 'asc';
	const pageIndex = Math.max(0, parseInt(event.url.searchParams.get('pageIndex') ?? '0', 10));
	const pageSize = Math.max(
		1,
		Math.min(100, parseInt(event.url.searchParams.get('pageSize') ?? '10', 10))
	);

	const result = await trpcServer.students.fetchMyStudents.ssr(
		{
			order,
			page: pageIndex,
			size: pageSize
		},
		event
	);

	return {
		students: result!.students,
		count: result!.count,
		name: event.locals.user?.name ?? ''
	};
};

export const actions: Actions = {
	removeInvite: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const studentId = formData.get('studentID') as string;

		if (!studentId) {
			return fail(400, { error: 'Invalid student ID' });
		}

		try {
			const student = await db
				.selectFrom('Student')
				.where('id', '=', studentId)
				.select(['id', 'user_id'])
				.executeTakeFirst();

			if (!student) {
				return fail(404, { error: 'Student not found' });
			}

			// Use a transaction to delete both Student and User records
			await db.transaction().execute(async (trx) => {
				await trx.deleteFrom('Student').where('id', '=', student.id).executeTakeFirst();
				await trx.deleteFrom('User').where('id', '=', student.user_id).executeTakeFirst();
			});

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'An error occurred while removing the student' });
		}
	}
};
