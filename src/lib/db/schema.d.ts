import type { ColumnType } from 'kysely';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Advisor = {
	id: string;
	user_id: string;
};
export type Session = {
	id: string;
	expires_at: Timestamp;
	user_id: string;
};
export type Student = {
	id: string;
	user_id: string;
	advisor_id: string;
	invite_token: string | null;
	invite_expires: Timestamp | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
};
export type User = {
	id: string;
	email: string;
	password: string;
	role: 'ADMIN' | 'ADVISOR' | 'STUDENT';
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
};
export type DB = {
	Advisor: Advisor;
	Session: Session;
	Student: Student;
	User: User;
};
