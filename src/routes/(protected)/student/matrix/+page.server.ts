import { db } from '$lib/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { trpcServer } from '$lib/server/server';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const student = await db
		.selectFrom('User')
		.innerJoin('Student', 'User.id', 'Student.user_id')
		.where('User.id', '=', userId)
		.select(['major_id', 'minor_id', 'Student.id'])
		.executeTakeFirst();

	if (!student) error(404, 'Student not found');

	const program = await trpcServer.students.getStudentProgram.ssr(event);
	const courses = await trpcServer.students.getStudentCourses.ssr(event);
	const degree = await trpcServer.students.getStudentDegree.ssr(
		{ majorId: student.major_id, minorId: student.minor_id },
		event
	);

	return {
		program: program!.program,
		courses: courses!.courses,
		degree: degree!.degree
	};
};

export const actions: Actions = {};
