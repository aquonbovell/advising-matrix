import type { ColumnType } from 'kysely';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Advisor = {
	advisorId: string;
	studentId: string;
};
export type Course = {
	id: string;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
	prerequisiteCount: number;
	comment: string;
	/**
	 * @kyselyType('ALL' | 'ONE')
	 */
	prerequisiteType: 'ALL' | 'ONE';
};
export type Department = {
	id: string;
	facultyId: string;
	name: string;
};
export type Faculty = {
	id: string;
	name: string;
};
export type LevelRestriction = {
	id: string;
	courseId: string;
	area: string;
	credits: number;
	level: string;
};
export type MajorRequirement = {
	id: string;
	majorId: string;
	credits: number;
	details: string;
	/**
	 * @kyselyType('COURSES' | 'DISCIPLINES' | 'FACULTIES')
	 */
	type: 'COURSES' | 'DISCIPLINES' | 'FACULTIES';
	/**
	 * @kyselyType('ALL' | 'AT MOST' | 'AT LEAST')
	 */
	option: 'ALL' | 'AT MOST' | 'AT LEAST';
	level: number;
};
export type Majors = {
	id: string;
	name: string;
};
export type MinorRequirement = {
	id: string;
	minorId: string;
	credits: number;
	details: string;
	/**
	 * @kyselyType('COURSES' | 'DISCIPLINES' | 'FACULTIES')
	 */
	type: 'COURSES' | 'DISCIPLINES' | 'FACULTIES';
	/**
	 * @kyselyType('ALL' | 'AT MOST' | 'AT LEAST')
	 */
	option: 'ALL' | 'AT MOST' | 'AT LEAST';
	level: number;
};
export type Minors = {
	id: string;
	name: string;
};
export type Prerequisites = {
	id: string;
	courseId: string;
	prerequisiteId: string;
};
export type Session = {
	id: string;
	userId: string;
	expiresAt: number;
};
export type Student = {
	id: string;
	userId: string;
	majorId: string;
	minor_id: string | null;
	invite_token: string | null;
	invite_expires: string | null;
};
export type StudentCourses = {
	id: string;
	grade: string;
	requirementId: string;
	studentId: string;
	courseId: string;
	userId: string | null;
};
export type User = {
	id: string;
	email: string;
	alternateEmail: string;
	name: string;
	username: string;
	passwordHash: string;
	/**
	 * @kyselyType('STUDENT' | 'ADVISOR' | 'ADMIN')
	 */
	role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
	onboarded: number;
	created_at: string;
	updated_at: string;
};
export type DB = {
	Advisor: Advisor;
	Course: Course;
	Department: Department;
	Faculty: Faculty;
	LevelRestriction: LevelRestriction;
	MajorRequirement: MajorRequirement;
	Majors: Majors;
	MinorRequirement: MinorRequirement;
	Minors: Minors;
	Prerequisites: Prerequisites;
	Session: Session;
	Student: Student;
	StudentCourses: StudentCourses;
	User: User;
};
