import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { completedCourses } from './stores/student';
import type { CourseWithPrerequisites, Grade } from './types';
import bcrypt from 'bcrypt';

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

export function createMajorMinor(name: string): {
	major: string[];
	minor: string;
} {
	let degree: { major: string[]; minor: string } = {
		major: [],
		minor: ''
	};

	if (name && name.includes(' with ')) {
		const [major, minor] = name.split(' with ');
		degree.major = [...(major || 'None')];
		degree.minor = minor || 'None';
	} else if (name && name.includes(' and ')) {
		const [major1, major2] = name.split(' and ');
		degree.major = [major1 || 'None', major2 || 'None'];
		degree.major = degree.major.filter((m) => m !== 'None');
		degree.minor = 'None';
	} else {
		degree.major = [name || 'None'];
		degree.minor = 'None';
	}

	return degree;
}

// Helper functions

// TODO: Implement the function `arePrerequisitesMet` that takes a course object and returns a boolean value
export function arePrerequisitesMet(course: CourseWithPrerequisites): boolean {
	if (!course.prerequisites || course.prerequisites.length === 0) return true;
	let courses: Record<string, boolean> = {};
	// completedCourses.subscribe((value) => (courses = value));
	return course.prerequisites.every((prereq) => courses[prereq.id]);
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

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, process.env.SECRET!)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}