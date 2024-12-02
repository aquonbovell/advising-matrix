import type { RandomReader } from '@oslojs/crypto/random';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
	gradePoints,
	type CourseRequirementDetails,
	type NonNullableGrade,
	type StudentCourse
} from '$lib/types';
import { codes, completedCourses } from '$lib/stores/matrix';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const random: RandomReader = {
	read(bytes: Uint8Array): void {
		crypto.getRandomValues(bytes);
	}
};

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
	const majors = new Set<string>(major.map((m) => m.name));

	const minors = new Set<string>(minor.map((m) => m.name));

	if (majors.size === 2) {
		return Array.from(majors).join(' and ');
	} else if (majors.size === 1 && minors.size === 1) {
		return Array.from(majors)[0] + ' with ' + Array.from(minors)[0];
	} else if (majors.size === 1 && minors.size === 0) {
		return Array.from(majors)[0] ?? 'None';
	} else {
		return 'None';
	}
}

export const isValidCourse = (course: StudentCourse | undefined) => {
	return !course ? false : Boolean(course.grade.length > 0);
};

export const isCourseCompleted = (course: StudentCourse | undefined): boolean => {
	if (!course) return false;
	return (
		isValidCourse(course) &&
		course.grade.filter((g) => {
			if (g.includes('FAIL')) return true;
			else if (!g.startsWith('F')) return true;
			else return false;
		}).length > 0
	);
};

export const calculateGradePoint = (grade: NonNullableGrade[], credits: number): number => {
	let courseGradePoint = 0;
	grade.forEach((g) => {
		courseGradePoint += gradePoints[g] * credits;
	});
	return courseGradePoint;
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

// ChatGPT generated
export function isValidUUID(uuid: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}
