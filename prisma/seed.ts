import { db } from './db';
import { Argon2id } from 'oslo/password';
import 'dotenv/config';

const seed = async () => {
	console.log('Seeding database...');
	const secret = process.env.SECRET;
	const defaultPassword = process.env.DEFAULT_PASSWORD;

	if (!secret || !defaultPassword) {
		throw new Error('SECRET or DEFAULT_PASSWORD not found in .env');
	}
	const encoder = new TextEncoder();
	const encodedSecret = encoder.encode(secret);
	const argon2id = new Argon2id({ secret: encodedSecret });

	const hashedPassword = await argon2id.hash(defaultPassword);

	await db.transaction().execute(async (db) => {
		console.log('Connection established');

		await db.deleteFrom('User').execute();

		await db.deleteFrom('Advisor').execute();

		await db.deleteFrom('Student').execute();

		await db
			.insertInto('User')
			.values({
				id: crypto.randomUUID(),
				name: 'Administrator',
				email: 'admin@cavehill.uwi.edu',
				role: 'ADMIN',
				alternate_email: 'administrator@outlook.com',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Insert User - Advisor
		const [advisor_id, student_id] = [crypto.randomUUID(), crypto.randomUUID()];

		await db
			.insertInto('User')
			.values({
				id: advisor_id,
				name: 'Advisor',
				email: 'advisor@cavehill.uwi.edu',
				role: 'ADVISOR',
				alternate_email: 'advisor@outlook.com',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Insert User - Student
		await db
			.insertInto('User')
			.values({
				id: student_id,
				name: 'Student',
				email: 'student@mycavehill.uwi.edu',
				role: 'STUDENT',
				alternate_email: 'student@outlook.com',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		const major_id = await db
			.selectFrom('Majors')
			.where('name', '=', 'Biochemistry')
			.select('id')
			.executeTakeFirst();
		const minor_id = await db
			.selectFrom('Majors')
			.where('name', '=', 'Chemistry')
			.select('id')
			.executeTakeFirst();

		if (major_id && minor_id) {
			// Get Student ID from db
			const student = await db
				.insertInto('Student')
				.values({
					id: crypto.randomUUID(),
					user_id: student_id,
					major_id: major_id.id,
					minor_id: minor_id.id,
					invite_token: null,
					invite_expires: null,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				})
				.returning('id')
				.executeTakeFirst();

			if (!student) {
				throw new Error('Student not found');
			}

			// Insert Advisor data - Students
			await db
				.insertInto('Advisor')
				.values({
					advisor_id: advisor_id,
					student_id: student.id
				})
				.execute();
		}
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
