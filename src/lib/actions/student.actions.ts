import { generateId } from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { Student } from '$lib/server/db/schema';

export const fetchStudents = async () => {
	return db
		.selectFrom('Student')
		.innerJoin('User', 'Student.userId', 'User.id')
		.select([
			'Student.id',
			'name',
			'username',
			'role',
			'alternateEmail',
			'email',
			'majorId',
			'minorId'
		])
		.where('role', '=', 'STUDENT')
		.execute();
};

export const fetchAdvisingStudents = async (advisorId: string) => {
	return db
		.selectFrom('Advisor')
		.innerJoin('Student', 'Advisor.studentId', 'Student.id')
		.innerJoin('User', 'Student.userId', 'User.id')
		.select([
			'Student.id',
			'name',
			'username',
			'role',
			'alternateEmail',
			'email',
			'majorId',
			'minorId'
		])
		.where('role', '=', 'STUDENT')
		.where('advisorId', '=', advisorId)
		.execute();
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
