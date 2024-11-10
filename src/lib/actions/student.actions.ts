import { db } from '$lib/db';
import { generateTokenWithExpiration } from '$lib/server/auth';
import type { Grade, StudentCoursesWithUser } from '$lib/types';
import { isCompleted, isValidUUID } from '$lib/utils';

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

export async function renewToken(studentId: string) {
	if (!isValidUUID(studentId)) {
		throw new Error('Invalid studentId');
	}
	const { expiresAt, token } = generateTokenWithExpiration();

	const student = await db
		.updateTable('Student')
		.set({
			invite_token: token,
			invite_expires: new Date(expiresAt),
			updated_at: new Date()
		})
		.where('id', '=', studentId)
		.returning('id')
		.executeTakeFirst();

	return student;
}

export async function getStudentById(studentId: string) {
	if (!isValidUUID(studentId)) {
		throw new Error('Invalid studentId');
	}

	const student = await db
		.selectFrom('Student')
		.innerJoin('User', 'Student.user_id', 'User.id')
		.select([
			'Student.invite_token',
			'Student.invite_expires',
			'User.name',
			'User.email',
			'User.alternate_email'
		])
		.where('Student.id', '=', studentId)
		.executeTakeFirst();

	return student;
}

export async function overview(studentId: string) {
	if (!isValidUUID(studentId)) {
		throw new Error('Invalid studentId');
	}

	const degree = await db
		.selectFrom('Student')
		.where('Student.id', '=', studentId)
		.select(['major_id', 'minor_id'])
		.executeTakeFirst();

	if (!degree) {
		throw new Error('Student not found');
	}

	const majorDetails = await db
		.selectFrom('Majors')
		.innerJoin('MajorRequirements', 'Majors.id', 'MajorRequirements.majorId')
		.where('Majors.id', 'in', [degree.major_id, degree.minor_id])
		.select(['MajorRequirements.id', 'MajorRequirements.credits', 'MajorRequirements.level'])
		.execute();
	const minorDetails = await db
		.selectFrom('Minors')
		.innerJoin('MinorRequirements', 'Minors.id', 'MinorRequirements.minorId')
		.where('Minors.id', 'in', [degree.major_id, degree.minor_id])
		.select(['MinorRequirements.id', 'MinorRequirements.credits', 'MinorRequirements.level'])
		.execute();

	const studentCourses = await db
		.selectFrom('StudentCourses')
		.innerJoin('Courses', 'StudentCourses.courseId', 'Courses.id')
		.where('StudentCourses.studentId', '=', studentId)
		.select([
			'Courses.id',
			'Courses.name',
			'Courses.credits',
			'StudentCourses.grade',
			'requirementId'
		])
		.execute();

	const requirements = [...majorDetails, ...minorDetails].map((req) => ({
		...req,
		level: JSON.parse(req.level) as number[]
	}));

	const levelOne = requirements.filter((req) => req.level.includes(1) && req.level.length === 1);

	const levelTwo = requirements.filter((req) => req.level.includes(2) && req.level.length === 1);

	const levelThree = requirements.filter((req) => req.level.includes(3) && req.level.length === 1);

	const forCredits = requirements.filter(
		(req) => ![...levelOne, ...levelTwo, ...levelThree].includes(req)
	);

	const student = {
		levelOne: {
			credits: levelOne.reduce((acc, req) => acc + req.credits, 0),
			completed: studentCourses
				.filter((course) =>
					levelOne.some(
						(req) => req.id === course.requirementId && isCompleted(JSON.parse(course.grade))
					)
				)
				.reduce((acc, course) => acc + course.credits, 0)
		},
		levelTwo: {
			credits: levelTwo.reduce((acc, req) => acc + req.credits, 0),
			completed: studentCourses
				.filter((course) =>
					levelTwo.some(
						(req) => req.id === course.requirementId && isCompleted(JSON.parse(course.grade))
					)
				)
				.reduce((acc, course) => acc + course.credits, 0)
		},
		levelThree: {
			credits: levelThree.reduce((acc, req) => acc + req.credits, 0),
			completed: studentCourses
				.filter((course) =>
					levelThree.some(
						(req) => req.id === course.requirementId && isCompleted(JSON.parse(course.grade))
					)
				)
				.reduce((acc, course) => acc + course.credits, 0)
		},

		forCredits: {
			credits: forCredits.reduce((acc, req) => acc + req.credits, 0),
			completed: studentCourses
				.filter((course) =>
					forCredits.some(
						(req) => req.id === course.requirementId && isCompleted(JSON.parse(course.grade))
					)
				)
				.reduce((acc, course) => acc + course.credits, 0)
		}
	};

	return student;
}
