import type { Course, Majors, Minors, StudentCourses } from '$lib/server/db/schema';
import { z } from 'zod';

export const UserRole = {
	STUDENT: 'STUDENT',
	ADVISOR: 'ADVISOR',
	ADMIN: 'ADMIN'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const requirementType = {
	COURSES: 'COURSES',
	DISCIPLINES: 'DISCIPLINES',
	FACULTIES: 'FACULTIES'
};

export type requirementType = (typeof requirementType)[keyof typeof requirementType];

export const requirementOption = {
	ALL: 'ALL',
	AT_MOST: 'AT MOST',
	AT_LEAST: 'AT LEAST'
};

export type requirementOption = (typeof requirementOption)[keyof typeof requirementOption];

export const prerequisiteType = ['ALL', 'ONE'] as const;

export type prerequisiteType = (typeof prerequisiteType)[number];

export type CourseDetails = Course & {
	prerequisites: string[];
	restrictions: { id: string; level: number[]; credits: number; area: string[] }[];
};

export type CourseRequirementDetails = Course & {
	prerequisites: {
		id: string;
		name: string;
		credits: number;
		level: number;
		code: string;
		courseId: string;
	}[];
	restrictions: { id: string; level: number[]; credits: number; area: string[] }[];
};
export type MajorDetails = Majors & {
	requirements: {
		id: string;
		option: requirementOption;
		details: string[];
		type: requirementType;
		credits: number;
		level: number[];
	}[];
};

export type MinorDetails = Minors & {
	requirements: {
		id: string;
		option: requirementOption;
		details: string[];
		type: requirementType;
		credits: number;
		level: number[];
	}[];
};

export type Requirement = {
	id: string;
	option: requirementOption;
	details: string[];
	courses: CourseRequirementDetails[];
	type: requirementType;
	credits: number;
	level: number[];
};

export type Program = {
	id: string;
	name: string;
	requirements: Requirement[];
};

export const GRADE_VALUES = [
	'A+',
	'A',
	'A-',
	'B+',
	'B',
	'B-',
	'C+',
	'C',
	'F1',
	'F2',
	'F3',
	'PASS',
	'FAIL'
] as const;
export const gradeSchema = z.enum(GRADE_VALUES).optional();
export type Grade = z.infer<typeof gradeSchema>;
export type NonNullableGrade = NonNullable<Grade>;

export const gradePoints = {
	'A+': 4.3,
	A: 4.0,
	'A-': 3.7,
	'B+': 3.3,
	B: 3.0,
	'B-': 2.7,
	'C+': 2.3,
	C: 2.0,
	F1: 1.7,
	F2: 1.3,
	F3: 0.0,
	PASS: 0,
	FAIL: 0
} as const;

export type StudentCourse = Omit<StudentCourses, 'studentId'>;
