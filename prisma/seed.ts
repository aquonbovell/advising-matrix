import 'dotenv/config';
import { hash } from '@node-rs/argon2';
import { nanoid } from 'nanoid';

const now = () => Math.floor(Date.now() / 1000);

const seed = async () => {
	const defaultPassword = process.env.DEFAULT_PASSWORD!;
	const hashedPassword = await hash(defaultPassword, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	await db.transaction().execute(async (db) => {
		console.log('Connection established');

		await db.deleteFrom('User').execute();

		await db.deleteFrom('Advisor').execute();

		await db.deleteFrom('Student').execute();

		await db
			.insertInto('User')
			.values({
				id: nanoid(),
				name: 'Administrator',
				email: 'admin@cavehill.uwi.edu',
				role: 'ADMIN',
				alternate_email: 'administrator@outlook.com',
				password: hashedPassword,
				created_at: now(),
				updated_at: now()
			})
			.execute();

		await db
			.insertInto('User')
			.values({
				id: nanoid(),
				name: 'Advisor',
				email: 'advisor@cavehill.uwi.edu',
				role: 'ADVISOR',
				alternate_email: 'advisor@outlook.com',
				password: hashedPassword,
				created_at: now(),
				updated_at: now()
			})
			.execute();

		// Insert User - Student
		await db
			.insertInto('User')
			.values({
				id: nanoid(),
				name: 'Student',
				email: 'student@mycavehill.uwi.edu',
				role: 'STUDENT',
				alternate_email: 'student@outlook.com',
				password: hashedPassword,
				created_at: now(),
				updated_at: now()
			})
			.execute();

		// const major_id = await db
		// 	.selectFrom('Majors')
		// 	.where('name', '=', 'Biochemistry')
		// 	.select('id')
		// 	.executeTakeFirst();
		// const minor_id = await db
		// 	.selectFrom('Majors')
		// 	.where('name', '=', 'Chemistry')
		// 	.select('id')
		// 	.executeTakeFirst();

		// if (major_id && minor_id) {
		// 	// Get Student ID from db
		// 	const student = await db
		// 		.insertInto('Student')
		// 		.values({
		// 			id: crypto.randomUUID(),
		// 			user_id: student_id,
		// 			major_id: major_id.id,
		// 			minor_id: minor_id.id,
		// 			invite_token: null,
		// 			invite_expires: null,
		// 			created_at: new Date().toISOString(),
		// 			updated_at: new Date().toISOString()
		// 		})
		// 		.returning('id')
		// 		.executeTakeFirst();

		// 	if (!student) {
		// 		throw new Error('Student not found');
		// 	}

		// 	// Insert Advisor data - Students
		// 	await db
		// 		.insertInto('Advisor')
		// 		.values({
		// 			advisor_id: advisor_id,
		// 			student_id: student.id
		// 		})
		// 		.execute();
	});

	await db.destroy();
	console.log('Connection closed');
};

seed()
	.then(() => {
		console.log('Database seeded successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
