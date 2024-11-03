import 'dotenv/config';
import data from './courses.json';
import { db } from './db';

await db.deleteFrom('Courses').execute();

await db.deleteFrom('Prerequisites').execute();

await db.deleteFrom('LevelRestriction').execute();

for (const course of data) {
	let departmentId = await db
		.selectFrom('Departments')
		.where('name', 'like', course.departmentId)
		.select('id')
		.executeTakeFirst();
	if (departmentId) {
		await db
			.insertInto('Courses')
			.values({
				id: course.id.toString(),
				code: course.code,
				name: course.name,
				level: course.level,
				credits: course.credits,
				departmentId: departmentId.id,
				comment: course.prerequisiteNote || course.warning || ''
			})
			.execute();
	}
}

for (const course of data) {
	const prerequisites = course.prerequisites;

	for (const level of course.levelRestriction || []) {
		await db
			.insertInto('LevelRestriction')
			.values({
				id: crypto.randomUUID(),
				courseId: course.id.toString(),
				level: level.level.join(','),
				credits: level.credits,
				area: level.area.join(',')
			})
			.execute();
	}

	for (const prerequisite of prerequisites) {
		await db
			.insertInto('Prerequisites')
			.values({
				id: crypto.randomUUID(),
				courseId: course.id.toString(),
				prerequisiteId: prerequisite.prerequisiteId.toString()
			})
			.execute();
	}
}
