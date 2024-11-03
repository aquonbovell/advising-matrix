import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises';
import { db } from './db';

const __dirname = path.dirname(__filename);

const data = await fs.readFile(path.join(__dirname, 'departments.json'), 'utf-8');
type DepartmentData = {
	id: number;
	name: string;
};

const departmentsData: DepartmentData[] = JSON.parse(data);

await db.deleteFrom('Department').execute();

for (const department of departmentsData) {
	let id = await db
		.selectFrom('Department')
		.where('name', 'like', department.name)
		.select('id')
		.executeTakeFirst();
	if (!id) {
		id = await db
			.insertInto('Department')
			.values({
				id: department.id.toString(),
				name: department.name
			})
			.returning('id')
			.executeTakeFirst();
	}
}
