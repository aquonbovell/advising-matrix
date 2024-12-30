import { authdb, db } from '../db';
import { generateRandomId } from '../utils';

export async function createStudent(userId: string) {
	await db
		.insertInto('student')
		.values({
			id: generateRandomId(),
			userId: userId
		})
		.execute();
}

export async function updateStudent(userId: string, majorId: string, minorId: string) {
	const result = await db
		.updateTable('student')
		.set({
			majorId: majorId,
			minorId: minorId
		})
		.where('userId', '==', userId)
		.returning('id')
		.executeTakeFirstOrThrow();

	const student = {
		id: result.id,
		userId: userId,
		majorId: majorId,
		minorId: minorId
	};

	return student;
}

export async function getStudentFromId(userId: string) {
	const student = await db
		.selectFrom('student')
		.select(['id', 'majorId', 'minorId', 'userId'])
		.where('userId', '==', userId)
		.executeTakeFirst();

	return student;
}

export async function deleteStudentFromId(userId: string) {
	await db.deleteFrom('student').where('userId', '==', userId).execute();
}

export async function getStudents() {
	const students = await authdb
		.selectFrom('user')
		.select(['user.id', 'user.email', 'user.username', 'user.role', 'user.emailVerified'])
		.where('role', '==', 'student')
		.execute();

	return [...students].map((student, i) => ({
		...student,
		email: student.email.concat(i.toLocaleString()),
		emailVerified: student.emailVerified === 1 ? true : false
	}));
}
