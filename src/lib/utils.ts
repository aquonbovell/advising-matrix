import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GRADE_VALUES, gradePoints, type NonNullableGrade, type StudentCourse } from './types';

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
	return !course ? false : Boolean(course.grade.split(',').length > 0);
};

export const isCourseCompleted = (course: StudentCourse | undefined): boolean => {
	if (!course) return false;
	return (
		isValidCourse(course) && course.grade.split(',').filter((g) => !g.startsWith('F')).length > 0
	);
};
