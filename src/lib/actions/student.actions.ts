import { db } from '$lib/db';
import type { Grade, StudentCoursesWithUser } from '$lib/types';
import { isValidUUID } from '$lib/utils';

export async function fetchStudentCourses(
	studentId: string
): Promise<{ courses: StudentCoursesWithUser[] }> {
	if (!isValidUUID(studentId)) {
		throw new Error('Invalid studentId');
	}

	const courses = await db
		.selectFrom('StudentCourses')
		.where('studentId', '=', studentId)
		.leftJoin('User', 'userId', 'User.id')
		.select(['courseId', 'grade', 'requirementId', 'userId', 'User.name'])
		.execute();

	return {
		courses: courses.map((course) => ({
			...course,
			grade: course.grade.split(',').filter(Boolean)
		}))
	};
}

export async function updateStudentGrades(
	id: string,
	studentCourses: {
		userId: string | null;
		courseId: string;
		requirementId: string;
		grades: Grade[];
	}[]
) {
	if (!isValidUUID(id)) {
		throw new Error('Invalid studentId');
	}

	console.log('studentCourses', studentCourses);

	try {
		await db.transaction().execute(async (db) => {
			await db.deleteFrom('StudentCourses').where('studentId', '=', id).execute();

			for (const course of studentCourses) {
				await db
					.insertInto('StudentCourses')
					.values({
						id: crypto.randomUUID(),
						studentId: id,
						userId: course.userId,
						courseId: course.courseId,
						requirementId: course.requirementId,
						grade: course.grades.join(',')
					})
					.execute();
			}
		});
	} catch (error) {
		console.error(error);
		return { status: 400, message: 'Failed to update student courses' };
	}

	return { status: 200, message: 'Student courses updated' };
}
export async function updateStudentSuggestions(
	id: string,
	studentCourses: { userId: string; courseId: string; requirementId: string; grades: Grade[] }[]
) {
	if (!isValidUUID(id)) {
		throw new Error('Invalid studentId');
	}

	try {
		await db.transaction().execute(async (db) => {
			for (const course of studentCourses) {
				const courseId = await db
					.selectFrom('StudentCourses')
					.where('studentId', '=', id)
					.where('courseId', '=', course.courseId)
					.select('id')
					.executeTakeFirst();

				if (!courseId) {
					await db
						.insertInto('StudentCourses')
						.values({
							id: crypto.randomUUID(),
							studentId: id,
							userId: course.userId,
							courseId: course.courseId,
							requirementId: course.requirementId,
							grade: course.grades.join(',')
						})
						.execute();
				}
			}
		});
	} catch (error) {
		return { status: 400, message: 'Failed to update student courses' };
	}

	return { status: 200, message: 'Student courses updated' };
}
