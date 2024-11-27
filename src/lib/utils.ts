import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
	GRADE_VALUES,
	gradePoints,
	type CourseRequirementDetails,
	type NonNullableGrade,
	type StudentCourse
} from './types';
import { codes, completedCourses } from '$lib/stores/matrix';
import type { RandomReader } from '@oslojs/crypto/random';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isGrade = (value: unknown): value is NonNullableGrade => {
	return typeof value === 'string' && GRADE_VALUES.includes(value as NonNullableGrade);
};

export const calculateGradePoint = (grade: NonNullableGrade[], credits: number): number => {
	let courseGradePoint = 0;
	grade.forEach((g) => {
		courseGradePoint += gradePoints[g] * credits;
	});
	return courseGradePoint;
};

// ChatGPT generated
export function isValidUUID(uuid: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function getName(
	major: {
		id: string;

		name: string;
	}[],
	minor: {
		id: string;
		name: string;
	}[]
): string {
	const majors: { id: string; name: string }[] = [];
	for (const m of major) {
		if (majors.find((major) => major.name.toLocaleLowerCase() === m.name.toLocaleLowerCase()))
			continue;
		majors.push({ id: m.id, name: m.name });
	}

	console.log(majors);

	const minors: { id: string; name: string }[] = [];
	for (const m of minor) {
		if (minors.find((minor) => minor.id === m.id)) continue;
		minors.push({ id: m.id, name: m.name });
	}

	console.log(minors);

	if (majors.length === 2) {
		return majors.map((m) => m.name).join(' and ');
	} else if (majors.length === 1 && minors.length === 1) {
		return majors.at(0)?.name + ' with ' + minors.at(0)?.name;
	} else if (majors.length === 1 && minors.length === 0) {
		return majors.at(0)?.name ?? 'None';
	} else {
		return 'None';
	}
}

export const isValidCourse = (course: StudentCourse | undefined) => {
	return !course ? false : Boolean(course.grade.length > 0);
};

export const isCourseCompleted = (course: StudentCourse | undefined): boolean => {
	if (!course) return false;
	return isValidCourse(course) && course.grade.filter((g) => !g.startsWith('F')).length > 0;
};

export function arePrerequisitesMet(course: CourseRequirementDetails): boolean {
	if (
		(!course.prerequisites || course.prerequisites.length === 0) &&
		(!course.restrictions || course.restrictions.length === 0)
	)
		return true;
	let courses: string[] = [];

	completedCourses.subscribe((value) => (courses = value));
	return (
		course.prerequisites.every((prerequisite) => courses.includes(prerequisite.id)) &&
		areLevelRestrictionsMet(course)
	);
}

export function areLevelRestrictionsMet(course: CourseRequirementDetails): boolean {
	console.log(JSON.stringify(course.restrictions));
	let courses: string[] = [];
	completedCourses.subscribe((value) => (courses = value));
	let completedCourseCodes: { id: string; code: string; credits: number }[] = [];
	codes.subscribe((value) => (completedCourseCodes = value));

	const usedCourses: string[] = [];
	completedCourseCodes = completedCourseCodes.filter((course) => courses.includes(course.id));
	const restrictions = course.restrictions.map((level) => {
		const levelCourses: { id: string; code: string; credits: number }[] = [];
		level.area.forEach((area) => {
			const areaCourses = completedCourseCodes.filter(
				(course) =>
					course.code.startsWith(area) &&
					level.level.includes(parseInt(course.code[4]) as number) &&
					!usedCourses.includes(course.id)
			);

			areaCourses.forEach((course) => {
				if (!usedCourses.includes(course.id)) usedCourses.push(course.id);
			});
			levelCourses.push(...areaCourses);
		});

		return levelCourses.reduce((acc, course) => acc + course.credits, 0) >= level.credits;
	});

	return restrictions.every(Boolean);
}

export function requiredCourses(course: CourseRequirementDetails): string[] {
	if (!course.prerequisites || course.prerequisites.length === 0) return [];
	let courses: string[] = [];
	completedCourses.subscribe((value) => (courses = value));
	return course.prerequisites
		.filter((prerequisite) => !courses.includes(prerequisite.id))
		.map((prerequisite) => prerequisite.code);
}

export const random: RandomReader = {
	read(bytes: Uint8Array): void {
		crypto.getRandomValues(bytes);
	}
};
