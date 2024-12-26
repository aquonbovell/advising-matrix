import type { ColumnType } from 'kysely';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type email_verification_request = {
	id: string;
	userId: string;
	email: string;
	code: string;
	expiresAt: string;
};
export type password_reset_session = {
	id: string;
	userId: string;
	email: string;
	code: string;
	expiresAt: string;
	emailVerified: number;
	twoFactorVerified: number;
};
export type session = {
	id: string;
	userId: string;
	expiresAt: string;
	twoFactorVerified: number;
};
export type user = {
	id: string;
	email: string;
	username: string;
	passwordHash: string;
	emailVerified: number;
	totpKey: Buffer | null;
	recoveryCode: Buffer;
};
export type DB = {
	email_verification_request: email_verification_request;
	password_reset_session: password_reset_session;
	session: session;
	user: user;
};
