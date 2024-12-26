import { db } from '$lib/server/db';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

import type { RequestEvent } from '@sveltejs/kit';
import { generateRandomOTP } from '../utils';
import type { User } from '../actions/user.actions';

export async function createPasswordResetSession(
	token: string,
	userId: string,
	email: string
): Promise<PasswordResetSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false
	};
	await db
		.insertInto('password_reset_session')
		.values({
			id: session.id,
			userId: session.userId,
			email: session.email,
			code: session.code,
			expiresAt: new Date(Math.floor(new Date(session.expiresAt).getTime() / 1000)).toISOString(),
			twoFactorVerified: session.twoFactorVerified ? 1 : 0,
			emailVerified: session.emailVerified ? 1 : 0
		})
		.execute();

	return session;
}

export async function validatePasswordResetSessionToken(
	token: string
): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = await db
		.selectFrom('password_reset_session')
		.innerJoin('user', 'user.id', 'password_reset_session.userId')
		.select([
			'password_reset_session.id as id',
			'password_reset_session.userId',
			'password_reset_session.email',
			'password_reset_session.code',
			'password_reset_session.expiresAt',
			'password_reset_session.emailVerified',
			'password_reset_session.twoFactorVerified',
			'user.id as userID',
			'user.email',
			'user.username',
			'user.emailVerified',
			'user.totpKey'
		])
		.where('password_reset_session.id', '==', sessionId)
		.executeTakeFirst();

	if (row === undefined) {
		return { session: null, user: null };
	}
	const session: PasswordResetSession = {
		id: row.id,
		userId: row.userId,
		email: row.email,
		expiresAt: new Date(new Date(row.expiresAt).getTime() * 1000),
		code: row.code,
		emailVerified: Boolean(row.emailVerified),
		twoFactorVerified: Boolean(row.twoFactorVerified)
	};
	const user: User = {
		id: row.userID,
		email: row.email,
		username: row.username,
		emailVerified: Boolean(row.emailVerified),
		registered2FA: Boolean(row.twoFactorVerified)
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		db.deleteFrom('password_reset_session').where('id', '==', session.id).execute();
		return { session: null, user: null };
	}
	return { session, user };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.updateTable('password_reset_session')
		.set('emailVerified', 1)
		.where('id', '==', sessionId)
		.execute();
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.updateTable('password_reset_session')
		.set('twoFactorVerified', 1)
		.where('id', '==', sessionId)
		.execute();
}

export async function invalidateUserPasswordResetSessions(userId: string): Promise<void> {
	await db.deleteFrom('password_reset_session').where('userId', '==', userId).execute();
}

export async function validatePasswordResetSessionRequest(
	event: RequestEvent
): Promise<PasswordResetSessionValidationResult> {
	const token = event.cookies.get('password_reset_session') ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie(event);
	}
	return result;
}

export function setPasswordResetSessionTokenCookie(
	event: RequestEvent,
	token: string,
	expiresAt: Date
): void {
	event.cookies.set('password_reset_session', token, {
		expires: expiresAt,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export function deletePasswordResetSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('password_reset_session', '', {
		maxAge: 0,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export function sendPasswordResetEmail(email: string, code: string): void {
	console.log(`To ${email}: Your reset code is ${code}`);
}

export interface PasswordResetSession {
	id: string;
	userId: string;
	email: string;
	expiresAt: Date;
	code: string;
	emailVerified: boolean;
	twoFactorVerified: boolean;
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: User }
	| { session: null; user: null };
