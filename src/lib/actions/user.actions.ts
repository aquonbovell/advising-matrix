import { generateId, hashPassword, verifyPassword } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { env } from '$env/dynamic/private';
import type { User } from '$lib/server/db/schema';

export const createUser = async (
	user: Omit<User, 'id' | 'onboarded' | 'role' | 'passwordHash' | 'created_at' | 'updated_at'>
) => {
	try {
		const result = await db
			.insertInto('User')
			.values({
				...user,
				id: generateId(),
				onboarded: 0,
				role: 'STUDENT',
				passwordHash: await hashPassword(env.DEFAULT_PASSWORD),
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

export const getUserByCredentials = async (
	email: string,
	password: string
): Promise<null | string> => {
	const user = await db
		.selectFrom('User')
		.where((eb) => eb('email', '=', email).or('alternateEmail', '=', email))
		.select(['id', 'passwordHash'])
		.executeTakeFirst();

	if (!user) {
		return null;
	}

	const valid = await verifyPassword(user.passwordHash, password);

	if (!valid) {
		return null;
	}

	return user.id;
};

export const fetchUsers = async () => {
	return db
		.selectFrom('User')
		.select(['id', 'name', 'username', 'role', 'alternateEmail', 'email'])
		.where('role', '!=', 'ADMIN')
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
	user: Omit<User, 'passwordHash' | 'updated_at' | 'created_at'>
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
