import type { RequestEvent } from '@sveltejs/kit';
import { authdb } from '../db';
import { dev } from '$app/environment';
import { encodeBase32 } from '@oslojs/encoding';
import { generateRandomOTP } from '../utils';

export interface EmailVerificationRequest {
	id: string;
	userId: string;
	code: string;
	email: string;
	expiresAt: Date;
}

export async function getUserEmailVerificationRequest(
	userId: string,
	id: string
): Promise<EmailVerificationRequest | null> {
	const row = await authdb
		.selectFrom('email_verification_request')
		.select(['id', 'userId', 'code', 'email', 'expiresAt'])
		.where('id', '==', id)
		.where('userId', '==', userId)
		.executeTakeFirst();

	if (row === undefined) {
		return null;
	}

	const request: EmailVerificationRequest = {
		id: row.id,
		userId: row.userId,
		code: row.code,
		email: row.email,
		expiresAt: new Date(row.expiresAt)
	};
	return request;
}

export function deleteEmailVerificationRequestCookie(event: RequestEvent): void {
	event.cookies.set('email_verification', '', {
		httpOnly: true,
		path: '/',
		secure: !dev,
		sameSite: 'lax',
		maxAge: 0
	});
}

export function setEmailVerificationRequestCookie(
	event: RequestEvent,
	request: EmailVerificationRequest
): void {
	event.cookies.set('email_verification', request.id, {
		httpOnly: true,
		path: '/',
		secure: !dev,
		sameSite: 'lax',
		expires: request.expiresAt
	});
}

export async function getUserEmailVerificationRequestFromRequest(
	event: RequestEvent
): Promise<EmailVerificationRequest | null> {
	if (event.locals.user === null) {
		return null;
	}
	const id = event.cookies.get('email_verification') ?? null;
	if (id === null) {
		return null;
	}
	const request = await getUserEmailVerificationRequest(event.locals.user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie(event);
	}
	return request;
}
export async function deleteUserEmailVerificationRequest(userId: string): Promise<void> {
	await authdb.deleteFrom('email_verification_request').where('userId', '==', userId).execute();
}

export async function createEmailVerificationRequest(
	userId: string,
	email: string
): Promise<EmailVerificationRequest> {
	await deleteUserEmailVerificationRequest(userId);
	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32(idBytes).toLowerCase();

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

	await authdb
		.insertInto('email_verification_request')
		.values({
			id,
			userId,
			code,
			email,
			expiresAt: expiresAt.toTimeString()
		})
		.execute();

	const request: EmailVerificationRequest = {
		id,
		userId,
		code,
		email,
		expiresAt
	};
	return request;
}

export function sendVerificationEmail(email: string, code: string): void {
	console.log(`To ${email}: Your verification code is ${code}`);
}
