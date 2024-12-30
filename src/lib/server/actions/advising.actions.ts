import { authdb, db } from '../db';
import { getStudents } from './student.actions';

export async function getStudentsFromAdvisorId(userId: string, role: 'advisor' | 'superadvisor') {
	if (role === 'superadvisor') {
		const students = await getStudents();
		return students;
	}

	const advisorId = await authdb
		.selectFrom('user')
		.select('id')
		.where('id', '==', userId)
		.executeTakeFirstOrThrow();

	const studentUserIds = await db
		.selectFrom('advising')
		.innerJoin('student', 'advising.studentId', 'student.id')
		.select('student.userId')
		.where('advising.advisorId', '==', advisorId.id)
		.execute();
	const students = await authdb
		.selectFrom('user')
		.select(['user.id', 'user.email', 'user.username', 'user.role', 'user.emailVerified'])
		.where('role', '==', 'student')
		.where(
			'id',
			'in',
			studentUserIds.map(({ userId }) => userId)
		)
		.execute();

	return [...students].map((student) => ({
		...student,
		emailVerified: student.emailVerified === 1 ? true : false
	}));
}
