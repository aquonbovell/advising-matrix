import {
	generateId,
	generateTokenWithExpiration,
	hashPassword,
	verifyPassword
} from '$lib/server/auth';
import { db } from '$lib/server/db';
import { DEFAULT_PASSWORD } from '$env/static/private';
import type { DB, User } from '$lib/server/db/schema';

import type { ReferenceExpression } from 'kysely';

export const createUser = async (
	user: Omit<
		User,
		| 'id'
		| 'onboarded'
		| 'passwordHash'
		| 'created_at'
		| 'updated_at'
		| 'invite_token'
		| 'invite_expires'
	>
) => {
	try {
		const access = generateTokenWithExpiration();
		const result = await db
			.insertInto('User')
			.values({
				...user,
				invite_expires: access.expiresAt,
				invite_token: access.token,
				id: generateId(),
				role: user.role,
				onboarded: 0,
				passwordHash: await hashPassword(DEFAULT_PASSWORD),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.returning('id')
			.executeTakeFirstOrThrow();
		return result.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const verifyUserByCredentials = async (
	email: string,
	password: string
): Promise<boolean> => {
	const user = await db
		.selectFrom('User')
		.where((eb) => eb('email', '=', email).or('alternateEmail', '=', email))
		.select(['id', 'passwordHash'])
		.executeTakeFirst();

	if (!user) {
		return false;
	}

	return await verifyPassword(user.passwordHash, password);
};
export const fetchUserByEmail = async (email: string): Promise<string> => {
	const user = await db
		.selectFrom('User')
		.where((eb) => eb('email', '=', email).or('alternateEmail', '=', email))
		.select('id')
		.executeTakeFirstOrThrow();

	return user.id;
};

export const fetchUsers = async () => {
	return db
		.selectFrom('User')
		.select([
			'id',
			'name',
			'username',
			'role',
			'alternateEmail',
			'email',
			'invite_token',
			'invite_expires',
			'onboarded'
		])
		.where('role', '!=', 'ADMIN')
		.execute();
};

export const getUsers = async (page: number = 0, size: number = 10) => {
	return db
		.selectFrom('User')
		.select([
			'id',
			'name',
			'username',
			'role',
			'alternateEmail',
			'email',
			'invite_token',
			'invite_expires',
			'onboarded'
		])
		.where('role', '!=', 'ADMIN')
		.offset(page * size)
		.limit(size)
		.execute();
};

export const fetchUser = async (id: string) => {
	const user = await db
		.selectFrom('User')

		.select(['id', 'name', 'username', 'role', 'alternateEmail', 'email', 'onboarded'])
		.where('id', '=', id)
		.where('role', '!=', 'ADMIN')
		.executeTakeFirstOrThrow();

	if (user.role === 'ADMIN') {
		throw new Error('Admins cannot be edited');
	}
	return user;
};

export const deleteUser = async (id: string) => {
	await db.deleteFrom('User').where('id', '=', id).execute();
};

export const updateUser = async (
	user: Omit<User, 'passwordHash' | 'updated_at' | 'created_at' | 'invite_token' | 'invite_expires'>
) => {
	await db
		.updateTable('User')
		.set({
			email: user.email,
			name: user.name,
			username: user.username,
			alternateEmail: user.alternateEmail,
			onboarded: user.onboarded,
			role: user.role,
			updated_at: new Date().toISOString()
		})
		.where('id', '=', user.id)
		.execute();
};

export async function exist(
	value: string,
	field: ReferenceExpression<DB, 'User'>,
	id: string | undefined = undefined
) {
	let query = db.selectFrom('User').where(field, '=', value).select('id');
	if (id) {
		query = query.where('id', '!=', id);
	}
	const user = await query.executeTakeFirst();

	return user !== undefined;
}

export async function resetUser(id: string) {
	const user = generateTokenWithExpiration();
	await db
		.updateTable('User')
		.set({
			invite_expires: user.expiresAt,
			invite_token: user.token,
			updated_at: new Date().toISOString()
		})
		.where('id', '=', id)
		.execute();
}

export async function userTokenExpiration(id: string, token: string) {
	const user = await db
		.selectFrom('User')
		.where('id', '=', id)
		.where('invite_token', '=', token)
		.select('invite_expires')
		.executeTakeFirst();
	return user;
}

export async function completeOnboarding(userId: string, password: string) {
	await db
		.updateTable('User')
		.set({
			onboarded: 1,
			invite_expires: null,
			invite_token: null,
			passwordHash: await hashPassword(password),
			updated_at: new Date().toISOString()
		})
		.where('id', '=', userId)
		.execute();
}
