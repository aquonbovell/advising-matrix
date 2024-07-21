import type { ColumnType } from 'kysely';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const UserRole = {
	STUDENT: 'STUDENT',
	ADVISOR: 'ADVISOR',
	ADMIN: 'ADMIN'
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type Advisor = {
	id: string;
	user_id: string;
};
export type Course = {
	id: string;
	code: string;
	name: string;
	level: number;
	credits: number;
	majorId: string | null;
};
export type Department = {
	id: string;
	name: string;
};
export type Major = {
	id: string;
	name: string;
	department_id: string;
};
export type Prerequisite = {
	id: string;
	course_id: string;
	prerequisite_id: string;
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
	majorId: string | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
};
export type User = {
	id: string;
	email: string;
	password: string;
	role: UserRole;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
};
export type DB = {
	Advisor: Advisor;
	Course: Course;
	Department: Department;
	Major: Major;
	Prerequisite: Prerequisite;
	Session: Session;
	Student: Student;
	User: User;
};
