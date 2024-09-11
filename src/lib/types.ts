import type {
	Course,
	RequirementType,
	StudentCourses
} from './db/schema';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'F1' | 'F2' | 'F3' | null;

export const gradePoints: Record<NonNullable<Grade>, number> = {
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
};

export type Student =
	| {
			id: string;
			user_id: string;
			program_id: string | null;
	  }
	| undefined;

export type CourseWithPrerequisite = {
	id: number;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
	prequisites: Course[];
};


export type CourseWithPrerequisites = {
	id: number;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
	prequisites: Course[];
};

export type Requirement = {
	dgId: string;
	id: string;
	type: RequirementType;
	credits: number;
	details: CourseWithPrerequisites[];
	level: number | null;
};

export type Degree = {
	name: string;
	dgId: string[];
	requirements: Requirement[];
};