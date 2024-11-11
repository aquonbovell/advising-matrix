import { z } from 'zod';
import type { Courses } from './db/schema';

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
	'F3'
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
	F3: 0.0
} as const;

export const isGrade = (value: unknown): value is NonNullableGrade => {
	return typeof value === 'string' && GRADE_VALUES.includes(value as NonNullableGrade);
};

export const calculateGradePoint = (grade: NonNullableGrade[], credits: number): number => {
	return grade.reduce((acc, g) => acc + gradePoints[g] * credits, 0);
};

export type Student =
	| {
			id: string;
			user_id: string;
			major_id: string;
			minor_id: string;
	  }
	| undefined;

export type CoursesWithPrerequisites = Courses & {
	prerequisites: Courses[];
	levelRestriction: restriction[];
};

export type Course = Courses & {
	prerequisites: string[];
	levelRestriction: {
		id: string;
		level: number[];
		credits: number;
		area: string[];
	}[];
};

export type restriction = {
	id: string;
	courseId: string;
	area: string[];
	credits: number;
	level: string[];
};

export type requirement = {
	id: string;
	option: requirementOption;
	details: string[];
	courses: CoursesWithPrerequisites[];
	detailsType: requirementDetailsType;
	credits: number;
	level: number[];
};

export type Degree = {
	name: string;
	id: string;
	requirements: requirement[];
};

export type Toast = {
	id: string;
	title: string;
	message: string;
	type: 'info' | 'success' | 'error';
};

export type StudentCoursesWithUser = {
	courseId: string;
	grade: string[];
	requirementId: string;
	userId: string | null;
	name: string | null;
};

export const options = ['REQUIRED', 'OPTIONAL'];

export const types = ['COURSES', 'AREAS', 'FACULTIES'];

export const prerequisiteTypes = ['ALL', 'ONE'];

export const requirementOption = {
	REQUIRED: 'REQUIRED',
	OPTIONAL: 'OPTIONAL'
} as const;
export type requirementOption = (typeof requirementOption)[keyof typeof requirementOption];
export const requirementDetailsType = {
	COURSES: 'COURSES',
	AREAS: 'AREAS',
	FACULTIES: 'FACULTIES'
} as const;

export type requirementDetailsType =
	(typeof requirementDetailsType)[keyof typeof requirementDetailsType];

export const prerequisiteType = {
	ALL: 'ALL',
	ONE: 'ONE'
} as const;
export type prerequisiteType = (typeof prerequisiteType)[keyof typeof prerequisiteType];
