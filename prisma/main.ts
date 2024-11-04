import { db } from './db';
const studentIds = await db.selectFrom('Advisor').select('student_id').execute();
console.log(studentIds);

db.selectFrom('Student')
	.where(
		'Student.id',
		'in',
		studentIds.map((id) => id.student_id)
	)
	// .innerJoin('User as StudentUser', 'StudentUser.id', 'Student.user_id')
	// .innerJoin('Advisor', 'Advisor.student_id', 'Student.id')
	// .innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisor_id')
	.select([
		// sql<string>`STRING_AGG("AdvisorUser".name, ', ')`.as('advisor_names'),
		'Student.id as student_id',
		'Student.user_id',
		// 'StudentUser.name as student_name',
		'Student.major_id',
		'Student.minor_id',
		// 'StudentUser.email',
		'Student.created_at',
		'Student.updated_at',
		'Student.invite_token',
		'Student.invite_expires'
	])
	// .limit(size)
	// .offset(page * size)
	// .groupBy([
	// 	'Student.id',
	// 	'StudentUser.name',
	// 	'StudentUser.email',
	// 	'Student.created_at',
	// 	'Student.invite_token',
	// 	'Student.invite_expires',
	// 	'Student.major_id',
	// 	'Student.minor_id'
	// ])
	// .orderBy('StudentUser.name', order)
	.execute();
