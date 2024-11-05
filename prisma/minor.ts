import type { RequirementType } from '../src/lib/db/schema';
import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises';
import { db } from './db';

const __dirname = path.dirname(__filename);

const data = await fs.readFile(path.join(__dirname, 'minors.json'), 'utf-8');
type MinorData = {
	name: string;
	details: [
		{
			type: string;
			level: number;
			credits: number;
			data: {
				courses?: string[];
				area?: string[];
			};
		}
	];
};

const MinorData: MinorData[] = JSON.parse(data);

for (const minor of MinorData) {
	let id = await db
		.selectFrom('Minors')
		.where('name', 'like', minor.name)
		.select('id')
		.executeTakeFirst();

	if (!id) {
		id = await db
			.insertInto('Minors')
			.values({
				id: crypto.randomUUID(),
				name: minor.name
			})
			.returning('id')
			.executeTakeFirst();
	}
}

await db.deleteFrom('MinorRequirements').execute();

for (const major of MinorData) {
	const id = await db
		.selectFrom('Minors')
		.where('name', 'like', major.name)
		.select('id')
		.executeTakeFirst();
	console.log(`${major.name} - ${id?.id}`);
	for (const detail of major.details) {
		await db
			.insertInto('MinorRequirements')
			.values({
				id: crypto.randomUUID(),
				minorId: id?.id!,
				type: detail.type as RequirementType,
				level: detail.level,
				credits: detail.credits,
				details: JSON.stringify(detail.data)
			})
			.execute();
		console.log(`${detail.type} ${detail.level} ${detail.credits}`);
		if (detail.data.courses) {
			const courses = await db
				.selectFrom('Courses')
				.where(
					'id',
					'in',
					detail.data.courses.map((c) => c)
				)
				.selectAll()
				.execute();

			console.log(courses.flatMap((c) => c.name).join('\n\t'));
		}
	}
}
