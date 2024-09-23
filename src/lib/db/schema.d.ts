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
export const RequirementType = {
	CREDITS: 'CREDITS',
	POOL: 'POOL'
} as const;
export type RequirementType = (typeof RequirementType)[keyof typeof RequirementType];
export type Advisor = {
	advisor_id: string;
	student_id: string;
};
export type Course = {
	id: number;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
};
export type CoursePrerequisite = {
	id: Generated<string>;
	courseId: number;
	prerequisiteId: number;
};
export type Department = {
	id: Generated<string>;
	name: string;
};
export type MajorRequirements = {
	id: string;
	majorId: string;
	type: RequirementType;
	credits: number;
	details: unknown;
	level: number;
};
export type Majors = {
	id: string;
	name: string;
};
export type MinorRequirements = {
	id: string;
	minorId: string;
	type: RequirementType;
	credits: number;
	details: unknown;
	level: number;
};
export type Minors = {
	id: string;
	name: string;
};
export type Session = {
	id: Generated<string>;
	expires_at: Timestamp;
	user_id: string;
};
export type Student = {
	id: string;
	user_id: string;
	major_id: string;
	minor_id: string | null;
	invite_token: string | null;
	invite_expires: Timestamp | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
};
export type StudentCourses = {
	id: string;
	grade: string;
	requirementId: string;
	studentId: string;
	courseId: number;
};
export type User = {
	id: string;
	name: string;
	email: string;
	password: string;
	role: UserRole;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
	alternate_email: string;
};
export type DB = {
	Advisor: Advisor;
	Course: Course;
	CoursePrerequisite: CoursePrerequisite;
	Department: Department;
	MajorRequirements: MajorRequirements;
	Majors: Majors;
	MinorRequirements: MinorRequirements;
	Minors: Minors;
	Session: Session;
	Student: Student;
	StudentCourses: StudentCourses;
	User: User;
};
