import { Kysely } from 'kysely';
import 'dotenv/config';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import type { DB } from '../src/lib/server/db/schema';
import { random } from '../src/lib/utils';
import { alphabet } from '../src/lib/constants';

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

import { encodeBase32LowerCase } from '@oslojs/encoding';
import { hash } from '@node-rs/argon2';
import { generateRandomString } from '@oslojs/crypto/random';
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
		url: tursoDatabase,
		authToken: tursoAuth
	})
});

const seed = async () => {
	console.log('Seeding database...');

	const defaultHash = await hashPassword(defaultPassword);

	await db.transaction().execute(async (db) => {
		console.log('Connection established');

		await db.deleteFrom('User').execute();

		const { token, expiresAt } = generateTokenWithExpiration();
		await db
			.insertInto('User')
			.values({
				id: generateId(),
				name: 'Administrator',
				email: 'admin@cavehill.uwi.edu',
				role: 'ADMIN',
				alternateEmail: 'administrator@outlook.com',
				passwordHash: defaultHash,
				invite_expires: expiresAt,
				invite_token: token,
				onboarded: 0,
				username: 'admin',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
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

export function generateTokenWithExpiration(
	expiresInMinutes = 30, // Default to 30 minutes
	tokenLength = 32
) {
	const expiresAt = (Date.now() + expiresInMinutes * 60 * 1000).toString(); // Calculate expiration time
	const token = generateRandomString(random, alphabet, tokenLength);
	return { token, expiresAt };
}
