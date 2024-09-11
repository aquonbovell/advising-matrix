import type { Grade } from '$lib/types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const POST: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	if (!id) {
		return json({ status: 400, message: 'Student ID required' });
	}
	const student = await db
		.selectFrom('Student')
		.where('user_id', '=', id)
		.select('id')
		.executeTakeFirst();
	if (!student) {
		return json({ status: 404, message: 'Student not found' });
	}
	const body: {
		grades: Record<
			string,
			{
				requirementId: string;
				grade: Grade[];
			}
		>;
	} = await request.json();

	let data: {
		studentId: string;
		courseId: string;
		requirementId: string;
		g: Grade;
	}[] = [];

	Object.entries(body.grades).forEach(([courseId, course]) => {
		const { requirementId, grade } = course;
		grade.forEach((g) => {
			data.push({ courseId, requirementId, g, studentId: student.id });
		});
	});

	try {
		await db.transaction().execute(async (db) => {
			await db
				.deleteFrom('StudentCourses')
				.where('StudentCourses.studentId', '=', student.id)
				.execute();

			for (const { courseId, requirementId, g, studentId } of data) {
				await db
					.insertInto('StudentCourses')
					.values({
						id: crypto.randomUUID(),
						studentId,
						courseId: parseInt(courseId),
						requirementId,
						grade: g ? g.toString() : ''
					})
					.execute();
			}
		});
		return json({ status: 200, message: 'Grades saved' });
	} catch (error) {
		console.error(error);
		return json({ status: 500, message: 'An error occurred' });
	}
};

export const GET: RequestHandler = async ({ params, request }) => {
	const { id } = params;

	if (!id) {
		return json({ status: 400, message: 'Student ID required' });
	}
	const student = await db
		.selectFrom('Student')
		.where('id', '=', id)
		.select('id')
		.executeTakeFirst();
	if (!student) {
		return json({ status: 404, message: 'Student not found' });
	}

	const grades = await db
		.selectFrom('StudentCourses')
		.where('studentId', '=', student.id)
		.selectAll()
		.execute();

	let data: Record<string, { id: string; grade: Grade[] }> = {};
	for (const grade of grades) {
		if (grade.courseId && !(grade.courseId in data)) {
			data[grade.courseId] = { id: grade.requirementId!, grade: [grade.grade as Grade] };
		} else if (grade.courseId) {
			data[grade.courseId]?.grade.push(grade.grade as Grade);
		}
	}

	return json({ status: 200, grades: data });
};
