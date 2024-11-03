import 'dotenv/config';
import data from './departments.json';
import { db } from './db';

await db.deleteFrom('Departments').execute();

for (const department of data) {
	let facultyId = await db
		.selectFrom('Faculties')
		.where('name', 'like', department.faculty)
		.select('id')
		.executeTakeFirst();
	if (facultyId) {
		await db
			.insertInto('Departments')
			.values({
				id: crypto.randomUUID(),
				name: department.name,
				facultyId: facultyId.id
			})
			.execute();
	}
}
