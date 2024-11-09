import type { ColumnType } from 'kysely';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Advisor = {
	advisor_id: string;
	student_id: string;
};
export type Courses = {
	id: string;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
	prerequisiteType: string;
	prerequisiteAmount: number;
	comment: string | null;
};
export type Departments = {
	id: string;
	facultyId: string;
	name: string;
};
export type Faculties = {
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
export type MajorRequirements = {
	id: string;
	majorId: string;
	option: string;
	credits: number;
	details: string;
	detailsType: string;
	level: string;
};
export type Majors = {
	id: string;
	name: string;
};
export type MinorRequirements = {
	id: string;
	minorId: string;
	option: string;
	credits: number;
	details: string;
	detailsType: string;
	level: string;
};
export type Minors = {
	id: string;
	name: string;
};
export type Prerequisites = {
	id: Generated<string>;
	courseId: string;
	prerequisiteId: string;
};
export type Session = {
	id: Generated<string>;
	expires_at: string;
	user_id: string;
};
export type Student = {
	id: string;
	user_id: string;
	major_id: string;
	minor_id: string;
	invite_token: string | null;
	invite_expires: string | null;
	created_at: Generated<string>;
	updated_at: string;
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
	name: string;
	email: string;
	password: string;
	role: string;
	created_at: Generated<string>;
	updated_at: string;
	alternate_email: string;
};
export type DB = {
	Advisor: Advisor;
	Courses: Courses;
	Departments: Departments;
	Faculties: Faculties;
	LevelRestriction: LevelRestriction;
	MajorRequirements: MajorRequirements;
	Majors: Majors;
	MinorRequirements: MinorRequirements;
	Minors: Minors;
	Prerequisites: Prerequisites;
	Session: Session;
	Student: Student;
	StudentCourses: StudentCourses;
	User: User;
};
