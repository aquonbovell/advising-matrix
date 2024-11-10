import { db } from '$lib/db';
import { sql } from 'kysely';

export async function paginateStudents(
	page: number,
	size: number,
	id: string,
	search: string,
	order: 'asc' | 'desc' = 'asc',
	mode: 'all' | 'mine' = 'all'
) {
	let query = db
		.selectFrom('Advisor')
		.innerJoin('Student', 'Student.id', 'Advisor.student_id')
		.innerJoin('User as StudentUser', 'StudentUser.id', 'Student.user_id')
		.innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisor_id')
		.innerJoin('Majors as Major1', 'Major1.id', 'Student.major_id')
		.leftJoin('Minors', 'Minors.id', 'Student.minor_id')
		.leftJoin('Majors as Major2', 'Major2.id', 'Student.minor_id');

	if (mode === 'mine') {
		query = query.where('Advisor.advisor_id', '=', id);
	}

	if (search) {
		query = query.where((eb) =>
			eb('StudentUser.name', 'ilike', `%${search}%`)
				.or('Major1.name', 'ilike', `%${search}%`)
				.or('Major2.name', 'ilike', `%${search}%`)
				.or('Minors.name', 'ilike', `%${search}%`)
		);
	}
	const students = await query
		.select([
			sql<string>`STRING_AGG("AdvisorUser".name, ', ')`.as('advisor_names'),
			sql<string>`STRING_AGG(CAST("AdvisorUser".id AS text), ', ')`.as('advisor_ids'),
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

	return students.map((student) => {
		return {
			...student,
			advisor_ids: '',
			exists: student.advisor_ids.split(',').includes(id),
			program_name: `${student.major_name} ${student.minor_name ? ' with ' + student.minor_name : student.major2_name ? ' and ' + student.major2_name : ''}`
		};
	});
}

export async function countStudents(id: string, mode: 'all' | 'mine' = 'all') {
	let query = db.selectFrom('Advisor').innerJoin('Student', 'Student.id', 'Advisor.student_id');

	if (mode === 'mine') {
		query = query.where('Advisor.advisor_id', '=', id);
	}

	const total = await query.select(db.fn.countAll<number>().as('total')).executeTakeFirst();

	return total ? total.total : 0;
}
