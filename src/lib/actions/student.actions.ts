import { generateId } from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { Student, StudentCourses } from '$lib/server/db/schema';
import { sql } from 'kysely';

export const fetchStudents = async () => {
	const students = await db
		.selectFrom('Student')
		.innerJoin('User', 'Student.userId', 'User.id')
		.innerJoin('Majors as Major1', 'Major1.id', 'Student.majorId')
		.leftJoin('Minors', 'Minors.id', 'Student.minorId')
		.leftJoin('Majors as Major2', 'Major2.id', 'Student.minorId')
		.select([
			'Student.id',
			'User.name',
			'username',
			'alternateEmail',
			'email',
			'Major1.name as major',
			'Minors.name as minor',
			'Major2.name as major2'
		])
		.where('role', '=', 'STUDENT')
		.execute();

	return students.map((student) => {
		return {
			...student,
			program: `${student.major} ${student.minor ? ' with ' + student.minor : student.major2 ? ' and ' + student.major2 : ''}`
		};
	});
};

export const fetchAdvisingStudents = async (advisorId: string) => {
	const students = await db
		.selectFrom('Advisor')
		.innerJoin('Student', 'Student.id', 'Advisor.studentId')
		.innerJoin('User as StudentUser', 'StudentUser.id', 'Student.userId')
		.innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisorId')
		.innerJoin('Majors as Major1', 'Major1.id', 'Student.majorId')
		.leftJoin('Minors', 'Minors.id', 'Student.minorId')
		.leftJoin('Majors as Major2', 'Major2.id', 'Student.minorId')
		.select([
			sql<string>`STRING_AGG("AdvisorUser".name, ', ')`.as('advisor_names'),
			sql<string>`STRING_AGG(CAST("AdvisorUser".id AS text), ', ')`.as('advisor_ids'),
			'Student.id',
			'StudentUser.name as studentName',
			'StudentUser.email as studentEmail',
			'StudentUser.created_at as studentCreatedAt',
			'StudentUser.updated_at as studentUpdatedAt',
			'Student.invite_token as studentInviteToken',
			'Student.invite_expires as studentInviteExpires',
			'Major1.name as major',
			'Minors.name as minor',
			'Major2.name as major2'
		])
		.orderBy('StudentUser.name')
		.where('StudentUser.role', '=', 'STUDENT')
		.where('Advisor.advisorId', '=', advisorId)
		.execute();

	return students.map((student) => {
		return {
			id: student.id,
			advisor_names: student.advisor_names,
			exists: +student.advisor_ids,
			studentName: student.studentName,
			studentEmail: student.studentEmail,
			studentCreatedAt: student.studentCreatedAt,
			studentUpdatedAt: student.studentUpdatedAt,
			studentInviteToken: student.studentInviteToken,
			studentInviteExpires: student.studentInviteExpires,
			program: `${student.major} ${student.minor ? ' with ' + student.minor : student.major2 ? ' and ' + student.major2 : ''}`
		};
	});
};

export const fetchAvailableUsers = async () => {
	return db
		.selectFrom('User')
		.where(({ eb, or, and, not, exists, selectFrom }) =>
			not(
				exists(
					selectFrom('Advisor')
						.innerJoin('Student', 'Advisor.studentId', 'Student.id')
						.select('Student.userId')
						.whereRef('User.id', '=', 'Student.userId')
				)
			)
		)
		.where('role', '=', 'STUDENT')
		.select(['name', 'User.id'])
		.execute();
};

export const createStudent = async (
	student: Omit<Student, 'id' | 'invite_token' | 'invite_expires'>,
	advisorIds: string[]
) => {
	try {
		const result = await db
			.insertInto('Student')
			.values({
				id: generateId(),
				userId: student.userId,
				majorId: student.majorId,
				minorId: student.minorId
			})
			.returning('id')
			.executeTakeFirstOrThrow();
		for (const advisorId of advisorIds) {
			await db
				.insertInto('Advisor')
				.values({
					studentId: result.id,
					advisorId
				})
				.execute();
		}
		return result.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
export const fetchStudentDetails = async (id: string) => {
	const student = await db
		.selectFrom('Student')
		.innerJoin('User', 'Student.userId', 'User.id')
		.leftJoin('Majors', 'Student.majorId', 'Majors.id')
		.leftJoin('Minors', 'Student.minorId', 'Minors.id')
		.leftJoin('Majors as SMajors', 'Student.minorId', 'SMajors.id')
		.select([
			'Student.id',
			'User.name',
			'username',
			'role',
			'alternateEmail',
			'email',
			'Majors.name as major',
			'Minors.name as minor',
			'SMajors.name as major2'
		])
		.where('Student.id', '=', id)
		.executeTakeFirstOrThrow();

	const advisors = await db
		.selectFrom('Advisor')
		.innerJoin('User', 'User.id', 'Advisor.advisorId')
		.where('studentId', '=', id)
		.select(['User.name'])
		.execute();

	return { ...student, advisors: advisors.map(({ name }) => name) };
};
export const fetchStudentByUserId = async (id: string) => {
	const student = await db
		.selectFrom('Student')
		.select(['Student.id', 'userId', 'majorId', 'minorId'])
		.where('Student.userId', '=', id)
		.executeTakeFirstOrThrow();
	return { ...student };
};

export const fetchStudent = async (id: string) => {
	const student = await db
		.selectFrom('Student')
		.select(['Student.id', 'userId', 'majorId', 'minorId'])
		.where('Student.id', '=', id)
		.executeTakeFirstOrThrow();
	const advisors = await db
		.selectFrom('Advisor')
		.select(['advisorId'])
		.where('studentId', '=', id)
		.execute();
	return { ...student, advisors: advisors.map(({ advisorId }) => advisorId) };
};

export const deleteStudent = async (id: string) => {
	return db.deleteFrom('Student').where('id', '=', id).execute();
};

export const updateStudent = async (
	student: Omit<Student, 'created_at' | 'updated_at' | 'invite_token' | 'invite_expires'>,
	advisorIds: string[]
) => {
	await db
		.updateTable('Student')
		.set({
			userId: student.userId,
			majorId: student.majorId,
			minorId: student.minorId
		})
		.where('id', '=', student.id)
		.execute();
	await db.deleteFrom('Advisor').where('studentId', '=', student.id).execute();
	for (const advisorId of advisorIds) {
		await db
			.insertInto('Advisor')
			.values({
				studentId: student.id,
				advisorId
			})
			.execute();
	}
	return student.id;
};

export const updateStudentSuggestions = async (
	studentId: string,
	suggestions: Omit<StudentCourses, 'studentId'>[]
) => {
	for (const suggestion of suggestions) {
		console.log(suggestion);

		const existing = await db
			.selectFrom('StudentCourses')
			.where('studentId', '=', studentId)
			.where('courseId', '=', suggestion.courseId)
			.select('id')
			.executeTakeFirst();

		if (existing) {
			await db
				.updateTable('StudentCourses')
				.set({
					userId: suggestion.userId
				})
				.where('id', '=', existing.id)
				.execute();
		} else {
			await db
				.insertInto('StudentCourses')
				.values({
					...suggestion,
					studentId,
					id: generateId(),
					grade: JSON.stringify(suggestion.grade)
				})
				.execute();
		}
	}
	return studentId;
};
export const updateStudentGrades = async (
	studentId: string,
	courseGrades: Omit<StudentCourses, 'studentId'>[]
) => {
	for (const courseGrade of courseGrades) {
		console.log(courseGrade);

		const existing = await db
			.selectFrom('StudentCourses')
			.where('studentId', '=', studentId)
			.where('courseId', '=', courseGrade.courseId)
			.select('id')
			.executeTakeFirst();

		if (existing) {
			await db
				.updateTable('StudentCourses')
				.set({
					userId: courseGrade.userId,
					grade: JSON.stringify(courseGrade.grade),
					requirementId: courseGrade.requirementId
				})
				.where('id', '=', existing.id)
				.execute();
		} else {
			await db
				.insertInto('StudentCourses')
				.values({
					...courseGrade,
					studentId,
					id: generateId(),
					grade: JSON.stringify(courseGrade.grade)
				})
				.execute();
		}
	}
	return studentId;
};

export const fetchAdvisors = async (userId: string) => {
	const student = await db
		.selectFrom('Student')
		.where('userId', '=', userId)
		.select('id')
		.executeTakeFirstOrThrow();

	console.log(student);

	return db
		.selectFrom('Advisor')
		.innerJoin('User', 'User.id', 'Advisor.advisorId')
		.where('studentId', '=', student.id)
		.select(['User.name', 'User.id', 'User.email'])
		.execute();
};
