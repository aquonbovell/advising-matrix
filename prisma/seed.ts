import { Kysely } from 'kysely';
import 'dotenv/config';
import { LibsqlDialect } from '@libsql/kysely-libsql';

export function generateId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

export async function hashPassword(password: string): Promise<string> {
	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	return passwordHash;
}

import type { ColumnType } from 'kysely';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { hash } from '@node-rs/argon2';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Session = {
	id: string;
	userId: string;
	expiresAt: number;
};
export type User = {
	id: string;
	email: string;
	alternateEmail: string;
	name: string;
	username: string;
	passwordHash: string;
	/**
	 * @kyselyType('STUDENT' | 'ADVISOR' | 'ADMIN')
	 */
	role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
	onboarded: number;
};
export type DB = {
	Session: Session;
	User: User;
};
const defaultPassword = process.env.DEFAULT_PASSWORD;
const tursoAuth = process.env.TURSO_AUTH_TOKEN;
const tursoDatabase = process.env.TURSO_DATABASE_URL;

if (!defaultPassword) {
	throw new Error('SECRET or DEFAULT_PASSWORD not found in .env');
}

if (!tursoAuth || !tursoDatabase) {
	throw new Error('TURSO_AUTH_TOKEN or TURSO_DATABASE_URL not found in .env');
}

export const db = new Kysely<DB>({
	dialect: new LibsqlDialect({
		url: 'file:/dev.db',
		syncUrl: tursoDatabase,
		authToken: tursoAuth,
		syncInterval: 60000
	})
});

const seed = async () => {
	console.log('Seeding database...');

	const defaultHash = await hashPassword(defaultPassword);

	await db.transaction().execute(async (db) => {
		console.log('Connection established');

		await db.deleteFrom('User').execute();

		await db
			.insertInto('User')
			.values({
				id: generateId(),
				name: 'Administrator',
				email: 'admin@cavehill.uwi.edu',
				role: 'ADMIN',
				alternateEmail: 'administrator@outlook.com',
				passwordHash: defaultHash,
				onboarded: 1,
				username: 'admin'
			})
			.execute();

		// Insert User - Advisor
		const [advisor_id, student_id] = [generateId(), generateId()];

		await db
			.insertInto('User')
			.values({
				id: advisor_id,
				name: 'Advisor',
				email: 'advisor@cavehill.uwi.edu',
				role: 'ADVISOR',
				alternateEmail: 'advisor@outlook.com',
				passwordHash: defaultHash,
				onboarded: 1,
				username: 'advisor'
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
				alternateEmail: 'student@outlook.com',
				passwordHash: defaultHash,
				onboarded: 1,
				username: 'student'
			})
			.execute();
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
