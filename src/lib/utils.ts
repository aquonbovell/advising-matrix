import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { TransitionConfig } from 'svelte/transition';
import type { CoursesWithPrerequisites, Grade } from './types';
import { z, type ZodRawShape } from 'zod';
import { codes, completedCourses } from './stores/newstudent';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export function isValidEmail(email: string): boolean {
	return /.+@.+/.test(email);
}

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

// Helper functions

// TODO: Implement the function `arePrerequisitesMet` that takes a course object and returns a boolean value
export function arePrerequisitesMet(course: CoursesWithPrerequisites): boolean {
	if (
		(!course.prerequisites || course.prerequisites.length === 0) &&
		(!course.levelRestriction || course.levelRestriction.length === 0)
	)
		return true;
	let courses: string[] = [];

	completedCourses.subscribe((value) => (courses = value));
	return (
		course.prerequisites.every((prerequisite) => courses.includes(prerequisite.id)) &&
		areLevelRestrictionsMet(course)
	);
}

export function areLevelRestrictionsMet(course: CoursesWithPrerequisites): boolean {
	console.log(JSON.stringify(course.levelRestriction));
	let courses: string[] = [];
	completedCourses.subscribe((value) => (courses = value));
	let completedCourseCodes: { id: string; code: string; credits: number }[] = [];
	codes.subscribe((value) => (completedCourseCodes = value));

	const usedCourses: string[] = [];
	completedCourseCodes = completedCourseCodes.filter((course) => courses.includes(course.id));
	const restrictions = course.levelRestriction.map((level) => {
		const levelCourses: { id: string; code: string; credits: number }[] = [];
		level.area.forEach((area) => {
			const areaCourses = completedCourseCodes.filter(
				(course) =>
					course.code.startsWith(area) &&
					level.level.includes(course.code[4] as string) &&
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

export function requiredCourses(course: CoursesWithPrerequisites): string[] {
	if (!course.prerequisites || course.prerequisites.length === 0) return [];
	let courses: string[] = [];
	completedCourses.subscribe((value) => (courses = value));
	return course.prerequisites
		.filter((prerequisite) => !courses.includes(prerequisite.id))
		.map((prerequisite) => prerequisite.code);
}

export function formatDate(date: Date) {
	return new Date(date).toLocaleDateString();
}

export function formatTime(date: Date) {
	const diffInMs = date.getTime() - Date.now(); // Difference in milliseconds
	const diffInSeconds = Math.floor(diffInMs / 1000);

	const days = Math.floor(diffInSeconds / (3600 * 24));
	const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((diffInSeconds % 3600) / 60);

	const dayStr = days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '';
	const hourStr = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : '';
	const minuteStr = minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : '';

	return [dayStr, hourStr, minuteStr].filter(Boolean).join(', ');
}

export function getInviteLink(inviteToken: string | null) {
	if (inviteToken === null) return '';
	if (typeof window === 'undefined') return '';
	navigator.clipboard.writeText(`${window.location.origin}/register?token=${inviteToken}`);
}

export function isCompleted(grades: Grade[] | undefined): boolean {
	if (!grades) return false;
	let foundValidGrade = false;

	for (let g of grades) {
		if (g?.startsWith('F')) {
		} else {
			foundValidGrade = true; // Set the flag to stop further processing after this grade
		}
	}
	return foundValidGrade ? true : false;
}

export function getName(
	major: {
		id: string;
		majorId: string;
		name: string;
	}[],
	minor: {
		id: string;
		minorId: string;
		name: string;
	}[]
): string {
	const majors: { majorId: string; name: string }[] = [];
	for (const m of major) {
		if (majors.find((major) => major.majorId === m.majorId)) continue;
		majors.push({ majorId: m.majorId, name: m.name });
	}

	console.log(majors);

	const minors: { minorId: string; name: string }[] = [];
	for (const m of minor) {
		if (minors.find((minor) => minor.minorId === m.minorId)) continue;
		minors.push({ minorId: m.minorId, name: m.name });
	}

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const debounce = (callback: Function, wait = 300) => {
	let timeout: ReturnType<typeof setTimeout>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), wait);
	};
};

export function restrict<T extends string>(
	value: string | null | undefined,
	allowedValues: readonly T[]
): T | null {
	if ((value ?? null) === null) return null;
	for (const allowedValue of allowedValues) {
		if (value === allowedValue) {
			return allowedValue;
		}
	}
	return null;
}

export function extractPagination(url: URL, defaultPageSize = 10, defaultPage = 1) {
	const page = Number(url.searchParams.get('page') || defaultPage);
	const pageSize = Number(url.searchParams.get('pageSize') || defaultPageSize);

	return {
		page: isNaN(page) ? defaultPage : page,
		pageSize: isNaN(pageSize) ? defaultPageSize : pageSize
	};
}

export function paginateTable<T extends ZodRawShape>(schema: T) {
	return z.object({
		...schema,
		page: z.number().int().min(0).optional().default(0),
		size: z.number().int().min(1).max(100).optional().default(10)
	});
}

export function generateId() {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const token = encodeBase32LowerCase(bytes);
	return token;
}

// ChatGPT generated
export function isValidUUID(uuid: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const site = 'Advising Matrix';
