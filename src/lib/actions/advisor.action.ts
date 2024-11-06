import { db } from '$lib/db';
import { getName } from '$lib/utils';
import { sql } from 'kysely';

const countQuery = db
	.selectFrom('Student')
	.select(db.fn.countAll<number>().as('total'))
	.executeTakeFirst();

export async function fetchStudents(size: number, page: number, order: 'asc' | 'desc' = 'asc') {
	const students = await db
		.selectFrom('Advisor')
		.innerJoin('Student', 'Student.id', 'Advisor.student_id')
		.innerJoin('User as StudentUser', 'StudentUser.id', 'Student.user_id')
		.innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisor_id')
		.innerJoin('Majors as Major1', 'Major1.id', 'Student.major_id')
		.leftJoin('Minors', 'Minors.id', 'Student.minor_id')
		.leftJoin('Majors as Major2', 'Major2.id', 'Student.minor_id')
		.select([
			sql<string>`STRING_AGG("AdvisorUser".name, ', ')`.as('advisor_names'),
			'Student.id as student_id',
			'Student.user_id',
			'StudentUser.name as student_name',
			'StudentUser.email',
			'Student.created_at',
			'Student.invite_token',
			'Student.invite_expires',
			'Major1.name as major_name',
			'Minors.name as minor_name',
			'Major2.name as major2_name'
		])
		.limit(size)
		.offset(page * size)
		.groupBy([
			'Student.id',
			'StudentUser.name',
			'StudentUser.email',
			'Student.created_at',
			'Student.invite_token',
			'Student.invite_expires',
			'Major1.name',
			'Minors.name',
			'Major2.name'
		])
		.orderBy('StudentUser.name', order)
		.execute();

	return {
		students: students.map((student) => {
			return {
				...student,
				program_name: `${student.major_name} ${student.minor_name ? ' with ' + student.minor_name : ' and ' + student.major2_name}`
			};
		}),
		count: students.length
	};
}

export async function fetchMyStudents(
	id: string,
	size: number,
	page: number,
	order: 'asc' | 'desc' = 'asc'
) {
	const students = await db
		.selectFrom('Advisor')
		.innerJoin('Student', 'Student.id', 'Advisor.student_id')
		.innerJoin('User as StudentUser', 'StudentUser.id', 'Student.user_id')
		.innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisor_id')
		.innerJoin('Majors as Major1', 'Major1.id', 'Student.major_id')
		.leftJoin('Minors', 'Minors.id', 'Student.minor_id')
		.leftJoin('Majors as Major2', 'Major2.id', 'Student.minor_id')
		.where('Advisor.advisor_id', '=', id)
		.select([
			sql<string>`STRING_AGG("AdvisorUser".name, ', ')`.as('advisor_names'),
			'Student.id as student_id',
			'Student.user_id',
			'StudentUser.name as student_name',
			'StudentUser.email',
			'Student.created_at',
			'Student.invite_token',
			'Student.invite_expires',
			'Major1.name as major_name',
			'Minors.name as minor_name',
			'Major2.name as major2_name'
		])
		.limit(size)
		.offset(page * size)
		.groupBy([
			'Student.id',
			'StudentUser.name',
			'StudentUser.email',
			'Student.created_at',
			'Student.invite_token',
			'Student.invite_expires',
			'Major1.name',
			'Minors.name',
			'Major2.name'
		])
		.orderBy('StudentUser.name', order)
		.execute();

	return {
		students: students.map((student) => {
			return {
				...student,
				program_name: `${student.major_name} ${student.minor_name ? ' with ' + student.minor_name : ' and ' + student.major2_name}`
			};
		}),
		count: students.length
	};
}
