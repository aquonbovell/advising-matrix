import { Lucia, TimeSpan } from 'lucia';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { dev } from '$app/environment';
import type { DB, User, UserRole } from '$lib/db/schema';
import { postgresql } from '$lib/db';
import { alphabet, generateRandomString } from 'oslo/crypto';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { createDate } from 'oslo';

const adapter = new NodePostgresAdapter(postgresql, {
	user: 'User',
	session: 'Session'
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes(db) {
		return {
			email: db.email,
			role: db.role
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DB['User'];
	}
}

export function requiredRole(role: UserRole) {
	return async (event: RequestEvent) => {
		const { locals } = event;
		if (!locals.user) {
			throw redirect(303, '/login');
		}
		if (locals.user.role !== role) {
			throw redirect(303, `/${locals.user.role.toLowerCase()}`);
		}
	};
}

export function generateTokenWithExpiration(
	expiresIn: TimeSpan = new TimeSpan(8, 'h'),
	tokenLength = 6,
	tokenChars = alphabet('0-9')
) {
	const expiresAt = createDate(expiresIn).getTime();
	const token = generateRandomString(tokenLength, tokenChars);
	return { token, expiresAt };
}
