import type { Course, Majors, Minors } from '$lib/server/db/schema';

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
/// @kyselyType('ALL' | 'ONE')

export type CourseDetails = Course & {
	prerequisites: string[];
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
