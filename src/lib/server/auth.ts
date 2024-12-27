import { env } from '$env/dynamic/private';
import { authdb } from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { hash, verify } from '@node-rs/argon2';
import type { session } from './db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string, flags: SessionFlags) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: session = {
		id: sessionId,
		userId: userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30).toISOString(),
		twoFactorVerified: flags.twoFactorVerified ? 1 : 0
	};
	await authdb.insertInto('session').values(session).execute();
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await authdb
		.selectFrom('session')
		.innerJoin('user', 'session.userId', 'user.id')
		.select([
			'user.id',
			'user.username',
			'user.email',
			'session.id as sessionId',
			'session.userId',
			'session.expiresAt',
			'session.twoFactorVerified',
			'emailVerified',
			'totpKey'
		])
		.where('session.id', '==', sessionId)
		.executeTakeFirst();

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = {
		session: {
			id: result.sessionId,
			userId: result.userId,
			expiresAt: new Date(result.expiresAt),
			twoFactorVerified: result.twoFactorVerified ? true : false
		},
		user: {
			id: result.id,
			username: result.username,
			emailVerified: result.emailVerified === 1,
			email: result.email,
			registered2FA: result.totpKey !== null
		}
	};

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await authdb.deleteFrom('session').where('session.id', '==', session.id).execute();
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await authdb
			.updateTable('session')
			.set({ expiresAt: session.expiresAt.toTimeString() })
			.where('session.id', '==', session.id)
			.execute();
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await authdb.deleteFrom('session').where('session.id', '==', sessionId).execute();
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export const validPassword = async (password: string, userPasswordHash: string) => {
	return await verify(userPasswordHash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
		secret: Buffer.from(env.ENCRYPTION_KEY)
	});
};

export const hashPassword = async (password: string) => {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
		secret: Buffer.from(env.ENCRYPTION_KEY)
	});
};

export interface SessionFlags {
	twoFactorVerified: boolean;
}

export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
	await authdb
		.updateTable('session')
		.set({ twoFactorVerified: 1 })
		.where('session.id', '==', sessionId)
		.execute();
}
