import { hashPassword } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { generateRandomId, generateRandomRecoveryCode } from '$lib/server/utils';
import { decrypt, decryptToString, encryptString } from '$lib/server/auth/encryption';

export async function getUsers() {
	const result = await db
		.selectFrom('user')
		.select([
			'user.id',
			'user.username',
			'user.email',
			'user.emailVerified',
			'user.recoveryCode',
			'user.passwordHash'
		])
		.execute();
	return result;
}

export async function getUserFromEmail(email: string) {
	const result = await db
		.selectFrom('user')
		.leftJoin('session', 'user.id', 'session.userId')
		.select(['user.id', 'twoFactorVerified', 'user.emailVerified', 'user.totpKey as registered2FA'])
		.where('email', '==', email)
		.executeTakeFirst();
	return result;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const row = await db.selectFrom('user').select('email').where('email', '==', email).execute();
	return row.length === 0;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
	const row = await db
		.selectFrom('user')
		.select('username')
		.where('username', '==', username)
		.execute();
	return row.length === 0;
}

export async function getPasswordHashFromId(id: string) {
	const result = await db
		.selectFrom('user')
		.select('passwordHash')
		.where('id', '==', id)
		.executeTakeFirst();

	if (!result) {
		return undefined;
	}
	return result.passwordHash;
}

export async function createUser(username: string, email: string, password: string) {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);
	const result = await db
		.insertInto('user')
		.values({
			id: generateRandomId(),
			username: username,
			email: email,
			emailVerified: 0,
			passwordHash: passwordHash,
			recoveryCode: Buffer.from(encryptedRecoveryCode)
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const user: User = {
		id: result.id,
		email: email,
		username: username,
		emailVerified: false,
		registered2FA: false
	};
	return user;
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: string,
	email: string
): Promise<void> {
	await db
		.updateTable('user')
		.set('email', email)
		.set('emailVerified', 1)
		.where('id', '==', userId)
		.execute();
}

export interface User {
	id: string;
	email: string;
	username: string;
	emailVerified: boolean;
	registered2FA: boolean;
}

export async function getUserRecoverCode(userId: string): Promise<string> {
	const row = await db
		.selectFrom('user')
		.select('recoveryCode')
		.where('id', '==', userId)
		.executeTakeFirstOrThrow();
	return decryptToString(new Uint8Array(row.recoveryCode));
}

export async function getUserTOTPKey(userId: string): Promise<Uint8Array<ArrayBufferLike> | null> {
	const row = await db
		.selectFrom('user')
		.select('totpKey')
		.where('id', '==', userId)
		.executeTakeFirst();

	if (row === undefined) {
		throw new Error('Invalid user ID');
	}
	const encrypted = row.totpKey === null ? null : new Uint8Array(row.totpKey);
	if (encrypted === null) {
		return null;
	}
	return decrypt(encrypted);
}
