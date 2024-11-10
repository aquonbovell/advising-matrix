import { db } from '$lib/db';

export async function paginate(
	page: number,
	size: number,
	orderBy: 'asc' | 'desc',
	search: string
) {
	const query = db
		.selectFrom('User')
		.orderBy('id', orderBy)
		.where('role', '<>', 'ADMIN')
		.where((eb) => eb('name', 'like', `%${search}%`))
		.offset(page * size)
		.limit(size);

	const users = await query.selectAll().execute();

	return users;
}

export async function count() {
	const users = await db
		.selectFrom('User')
		.select(db.fn.countAll<number>().as('count'))
		.executeTakeFirst();
	return users;
}
export async function paginateStudents(
	page: number,
	size: number,
	orderBy: 'asc' | 'desc',
	search: string
) {
	const query = db
		.selectFrom('User')
		.where('User.role', '=', 'STUDENT')
		.innerJoin('Student', 'Student.user_id', 'User.id')
		.select(['Student.id', 'name', 'email', 'role', 'alternate_email'])
		.orderBy('User.id', orderBy)
		.where((eb) => eb('name', 'like', `%${search}%`))
		.offset(page * size)
		.limit(size);

	const students = await query.selectAll().execute();

	return students;
}

export async function countStudents() {
	const students = await db
		.selectFrom('User')
		.where('User.role', '=', 'STUDENT')
		.innerJoin('Student', 'Student.user_id', 'User.id')
		.select(db.fn.countAll<number>().as('count'))
		.executeTakeFirst();
	return students;
}

export async function remove(id: string) {
	try {
		const result = await db.transaction().execute(async (db) => {
			const user = await db.deleteFrom('User').where('id', '=', id).executeTakeFirst();
			return user;
		});
		return { success: true };
	} catch (error) {
		console.error('Error deleting user:', error);
		return { success: false };
	}
}
