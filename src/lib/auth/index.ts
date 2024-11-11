import { dev } from '$app/environment';
import { db } from '$lib/db';
import type { DB } from '$lib/db/schema';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCase, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import type { Selectable } from 'kysely';

const ONE_DAY = 1000 * 60 * 60 * 24;

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	return encodeBase32LowerCase(bytes);
}

export async function createSession(token: string, userId: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
	};

	await db
		.insertInto('Session')
		.values({
			id: session.id,
			user_id: session.userId,
			expires_at: Math.floor(session.expiresAt.getTime() / 1000)
		})
		.execute();

	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const row = await db
		.selectFrom('Session as s')
		.innerJoin('User as u', 'u.id', 's.user_id')
		.select([
			's.id',
			's.user_id',
			's.expires_at',
			'u.email',
			'u.name',
			'u.role',
			'u.alternate_email'
		])
		.where('s.id', '=', sessionId)
		.executeTakeFirst();

	if (!row) {
		return { session: null, user: null };
	}

	const session: Session = {
		id: row.id,
		userId: row.user_id,
		expiresAt: new Date(row.expires_at * 1000)
	};

	if (Date.now() >= session.expiresAt.getTime()) {
		await invalidateSession(sessionId);
		return { session: null, user: null };
	}

	const user: User = {
		id: row.user_id,
		email: row.email,
		name: row.name,
		role: row.role,
		alternate_email: row.alternate_email
	};

	if (Date.now() > session.expiresAt.getTime() - ONE_DAY * 15) {
		session.expiresAt = new Date(Date.now() + ONE_DAY * 30);

		await db
			.updateTable('Session')
			.set({ expires_at: Math.floor(session.expiresAt.getTime() / 1000) })
			.where('id', '=', sessionId)
			.execute();
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.deleteFrom('Session').where('id', '=', sessionId).execute();
}

export async function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set('session', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		secure: !dev
	});
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export type User = Omit<Selectable<DB['User']>, 'password' | 'created_at' | 'updated_at'>;

export * as password from './password';
