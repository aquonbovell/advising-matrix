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
