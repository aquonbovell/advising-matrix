import { hashPassword } from '$lib/server/auth';
import { authdb, db } from '$lib/server/db';
import { generateRandomId, generateRandomRecoveryCode } from '$lib/server/utils';
import { decrypt, decryptToString, encryptString } from '$lib/server/auth/encryption';
import { createStudent, deleteStudentFromId } from '$lib/server/actions/student.actions';
import { createAdvisor, deleteAdvisorFromId } from '$lib/server/actions/advisor.actions';
import { DEFAULT_PASSWORD } from '$env/static/private';

export async function getUsers() {
	const result = await authdb
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
	const result = await authdb
		.selectFrom('user')
		.leftJoin('session', 'user.id', 'session.userId')
		.select(['user.id', 'twoFactorVerified', 'user.emailVerified', 'user.totpKey as registered2FA'])
		.where('email', '==', email)
		.executeTakeFirst();
	return result;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const row = await authdb.selectFrom('user').select('email').where('email', '==', email).execute();
	return row.length === 0;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
	const row = await authdb
		.selectFrom('user')
		.select('username')
		.where('username', '==', username)
		.execute();
	return row.length === 0;
}

export async function getPasswordHashFromId(id: string) {
	const result = await authdb
		.selectFrom('user')
		.select('passwordHash')
		.where('id', '==', id)
		.executeTakeFirst();

	if (!result) {
		return undefined;
	}
	return result.passwordHash;
}

export async function createUser(
	username: string,
	email: string,
	role: 'student' | 'advisor' | 'superadvisor' | 'admin'
): Promise<User> {
	const passwordHash = await hashPassword(DEFAULT_PASSWORD);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);
	const result = await authdb
		.insertInto('user')
		.values({
			id: generateRandomId(),
			username: username,
			email: email,
			role: role,
			emailVerified: 0,
			passwordHash: passwordHash,
			recoveryCode: Buffer.from(encryptedRecoveryCode)
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const user: User = {
		id: result.id,
		email: email,
		role: role,
		username: username,
		emailVerified: false,
		registered2FA: false
	};

	if (role === 'student') {
		await createStudent(user.id);
	}

	if (role === 'advisor' || role === 'superadvisor') {
		await createAdvisor(user.id);
	}
	return user;
}

export async function registerUser(
	username: string,
	email: string,
	password: string,
	role: 'student' | 'advisor' | 'superadvisor' | 'admin'
): Promise<User> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);
	const result = await authdb
		.insertInto('user')
		.values({
			id: generateRandomId(),
			username: username,
			email: email,
			role: role,
			emailVerified: 0,
			passwordHash: passwordHash,
			recoveryCode: Buffer.from(encryptedRecoveryCode)
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const user: User = {
		id: result.id,
		email: email,
		role: role,
		username: username,
		emailVerified: false,
		registered2FA: false
	};

	if (role === 'student') {
		await createStudent(user.id);
	}

	if (role === 'advisor' || role === 'superadvisor') {
		await createAdvisor(user.id);
	}
	return user;
}

export async function updateUser(
	userId: string,
	username: string,
	email: string,
	role: 'student' | 'advisor' | 'superadvisor' | 'admin'
): Promise<User> {
	const passwordHash = await hashPassword(DEFAULT_PASSWORD);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);
	const result = await authdb
		.updateTable('user')
		.set({
			username: username,
			email: email,
			role: role,
			emailVerified: 0,
			passwordHash: passwordHash,
			recoveryCode: Buffer.from(encryptedRecoveryCode),
			totpKey: null
		})
		.where('id', '==', userId)
		.returning('id')
		.executeTakeFirstOrThrow();

	const user: User = {
		id: result.id,
		email: email,
		role: role,
		username: username,
		emailVerified: false,
		registered2FA: false
	};

	if (role === 'student') {
		await deleteStudentFromId(user.id);
		await deleteAdvisorFromId(user.id);
		await createStudent(user.id);
	}

	if (role === 'advisor' || role === 'superadvisor') {
		await deleteStudentFromId(user.id);
		await deleteAdvisorFromId(user.id);
		await createAdvisor(user.id);
	}
	return user;
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: string,
	email: string
): Promise<void> {
	await authdb
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
	role: 'student' | 'advisor' | 'superadvisor' | 'admin';
	emailVerified: boolean;
	registered2FA: boolean;
}

export async function getUserRecoverCode(userId: string): Promise<string> {
	const row = await authdb
		.selectFrom('user')
		.select('recoveryCode')
		.where('id', '==', userId)
		.executeTakeFirstOrThrow();
	return decryptToString(new Uint8Array(row.recoveryCode));
}

export async function getUserTOTPKey(userId: string): Promise<Uint8Array<ArrayBufferLike> | null> {
	const row = await authdb
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

export async function getUserFromId(
	Id: string,
	role: ('student' | 'advisor' | 'superadvisor' | 'admin')[]
): Promise<User | undefined> {
	const result = await authdb
		.selectFrom('user')
		.select([
			'user.id',
			'user.username',
			'user.email',
			'user.emailVerified',
			'user.role',
			'user.totpKey as registered2FA'
		])
		.where('id', '==', Id)
		.where('role', 'in', role)
		.executeTakeFirst();

	if (!result) {
		return undefined;
	}

	const user: User = {
		id: result.id,
		email: result.email,
		role: result.role,
		username: result.username,
		emailVerified: result.emailVerified !== 0,
		registered2FA: result.registered2FA !== null
	};
	return user;
}

export async function deleteUserFromId(Id: string): Promise<boolean> {
	const result = await authdb
		.deleteFrom('user')
		.where('id', '==', Id)
		.where('role', 'is not', 'admin')
		.executeTakeFirst();

	if (result.numDeletedRows > 0) {
		await db.deleteFrom('student').where('userId', '==', Id).executeTakeFirst();
		await db.deleteFrom('advisor').where('userId', '==', Id).executeTakeFirst();
	}

	return result.numDeletedRows > 0;
}
