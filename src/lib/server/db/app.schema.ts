import type { ColumnType } from 'kysely';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type advising = {
	advisorId: string;
	studentId: string;
};
export type advisor = {
	id: string;
	userId: string;
};
export type course = {
	id: string;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
	prerequisiteCount: number;
	description: string;
	/**
	 * @kyselyType('all' | 'one')
	 */
	prerequisiteType: 'all' | 'one';
};
export type department = {
	id: string;
	facultyId: string;
	name: string;
};
export type faculty = {
	id: string;
	name: string;
};
export type levelRestriction = {
	id: string;
	courseId: string;
	area: string;
	credits: number;
	level: string;
};
export type major = {
	id: string;
	name: string;
};
export type majorRequirement = {
	majorId: string;
	requirementId: string;
};
export type minor = {
	id: string;
	name: string;
};
export type minorRequirement = {
	minorId: string;
	requirementId: string;
};
export type prerequisites = {
	id: string;
	courseId: string;
	prerequisiteId: string;
};
export type requirement = {
	id: string;
	credits: number;
	details: string;
	/**
	 * @kyselyType('courses' | 'disciplines' | 'faculties')
	 */
	type: 'courses' | 'disciplines' | 'faculties';
	/**
	 * @kyselyType('all' | 'at most' | 'at least')
	 */
	option: 'all' | 'at most' | 'at least';
	level: string;
};
export type student = {
	id: string;
	userId: string;
	majorId: string | null;
	minorId: string | null;
};
export type studentCourse = {
	id: string;
	grade: string;
	requirementId: string;
	studentId: string;
	courseId: string;
	userId: string;
};
export type DB = {
	advising: advising;
	advisor: advisor;
	course: course;
	department: department;
	faculty: faculty;
	levelRestriction: levelRestriction;
	major: major;
	majorRequirement: majorRequirement;
	minor: minor;
	minorRequirement: minorRequirement;
	prerequisites: prerequisites;
	requirement: requirement;
	student: student;
	studentCourse: studentCourse;
};
