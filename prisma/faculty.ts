import 'dotenv/config';
import data from './faculties.json';
import { db } from './db';

await db.deleteFrom('Faculties').execute();

for (const faculty of data) {
	let id = await db
		.selectFrom('Faculties')
		.where('name', 'like', faculty.name)
		.select('id')
		.executeTakeFirst();
	if (!id) {
		await db
			.insertInto('Faculties')
			.values({
				id: crypto.randomUUID(),
				name: faculty.name
			})
			.execute();
	}
}
