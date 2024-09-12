import { Lucia } from 'lucia';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { dev } from '$app/environment';
import type { DB, UserRole } from '$lib/db/schema';
import { postgresql } from '$lib/db';
import { redirect, type RequestEvent } from '@sveltejs/kit';

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
			name: db.name,
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

// export function generateTokenWithExpiration(
// 	expiresIn: TimeSpan = new TimeSpan(24, 'h'),
// 	tokenLength = 6,
// 	tokenChars = alphabet('0-9')
// ) {
// 	const expiresAt = createDate(expiresIn).getTime();
// 	const token = generateRandomString(tokenLength, tokenChars);
// 	return { token, expiresAt };
// }
