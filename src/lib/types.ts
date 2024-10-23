import { z } from 'zod';
import type { Course, RequirementType } from './db/schema';

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

export const calculateGradePoint = (grade: NonNullableGrade): number => {
	return gradePoints[grade];
};

export type Student =
	| {
			id: string;
			user_id: string;
			major_id: string;
			minor_id: string;
	  }
	| undefined;

export type CourseWithPrerequisites = Course & {
	prerequisites: Course[];
};

export type Requirement = {
	degreeId: string;
	id: string;
	type: RequirementType;
	credits: number;
	info: {
		courses?: string[];
		area?: string[];
	};
	details: CourseWithPrerequisites[];
	level: number;
};

export type Degree = {
	name: string;
	id: string;
	requirements: Requirement[];
};

export type Toast = {
	id: string;
	title: string;
	message: string;
	type: 'info' | 'success' | 'error';
};
