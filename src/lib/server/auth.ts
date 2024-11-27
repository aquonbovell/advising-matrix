import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCase, encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import type { Session, User } from './db/schema';
import { hash, verify } from '@node-rs/argon2';
import { generateRandomString } from '@oslojs/crypto/random';
import { alphabet } from '$lib/constants';
import { random } from '$lib/utils';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const HOUR_IN_MS = 1000 * 60 * 60;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + HOUR_IN_MS / 2).getTime()
	};
	await db.insertInto('Session').values(session).execute();
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.selectFrom('Session')
		.innerJoin('User', 'Session.userId', 'User.id')
		.where('Session.id', '==', sessionId)
		.select([
			'User.id',
			'User.username',
			'User.email',
			'User.name',
			'User.role',
			'User.onboarded',
			'Session.id as sessionId',
			'Session.userId',
			'Session.expiresAt'
		])
		.execute();

	if (!result) {
		return { session: null, user: null };
	}
	const session: Session = {
		id: result.sessionId,
		userId: result.userId,
		expiresAt: result.expiresAt
	};

	const user: Omit<
		User,
		| 'passwordHash'
		| 'alternateEmail'
		| 'username'
		| 'created_at'
		| 'updated_at'
		| 'invite_expires'
		| 'invite_token'
	> = {
		id: result.id,
		role: result.role,
		email: result.email,
		name: result.name,
		onboarded: result.onboarded
	};

	const sessionExpired = Date.now() >= new Date(session.expiresAt).getTime();
	if (sessionExpired) {
		await db.deleteFrom('Session').where('Session.id', '==', session.id).execute();
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= new Date(session.expiresAt).getTime() - HOUR_IN_MS / 4;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + HOUR_IN_MS / 2).getTime();
		await db
			.updateTable('Session')
			.set({ expiresAt: session.expiresAt })
			.where('Session.id', '==', session.id)
			.execute();
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.deleteFrom('Session').where('Session.id', '==', sessionId).execute();
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

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
	return await verify(passwordHash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

export function generateTokenWithExpiration(
	expiresInMinutes = 30, // Default to 30 minutes
	tokenLength = 32
) {
	const expiresAt = (Date.now() + expiresInMinutes * 60 * 1000).toString(); // Calculate expiration time
	const token = generateRandomString(random, alphabet, tokenLength);
	return { token, expiresAt };
}
