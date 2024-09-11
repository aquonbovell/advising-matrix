import type { Course } from '$lib/db/schema';
import type { Grade } from '$lib/types';
import { isCompleted } from '$lib/utils';
import type { Selected } from 'bits-ui';
import { derived, writable } from 'svelte/store';

export const courseGrades = writable<Record<string, { requirementId: string; grade: Grade[] }>>({});

export const courses = writable<{ id: number; credits: number }[]>([]);

export const requiredCourses = writable<{ id: number; credits: number }[]>([]);
export const dialogRequirementID = writable<string | null>(null);

export const selectedCourse = writable<Selected<Course | null>>(undefined);

export const totalCredits = writable<number>(0);
export const totalCourses = writable<number>(0);

export const completedCredits = derived([courseGrades, courses], ([$courseGrades, $courses]) => {
	return Object.entries($courseGrades).reduce((acc, courseGrade) => {
		if (isCompleted(courseGrade[1].grade)) {
			const course = $courses.find((course) => course.id === parseInt(courseGrade[0]));

			if (course) {
				acc += course.credits;
			} else {
				return acc;
			}
		}
		return acc;
	}, 0);
});
export const completedCourses = derived([courseGrades, courses], ([$courseGrades, $courses]) => {
	return Object.values($courseGrades).reduce((acc, { grade }) => {
		if (isCompleted(grade)) {
			return acc + 1;
		}
		return acc;
	}, 0);
});

export const pendingCourses = derived(
	[courseGrades, requiredCourses],
	([$courseGrades, $requiredCourses]) => {
		const requiredCoursesCount = $requiredCourses.reduce((acc, requiredCourse) => {
			if (
				$courseGrades[requiredCourse.id.toString()] &&
				isCompleted($courseGrades[requiredCourse.id.toString()]?.grade)
			) {
				return acc;
			}
			return acc + 1;
		}, 0);
		const electiveCoursesCount = Object.values($courseGrades).reduce((acc, { grade }) => {
			if (isCompleted(grade)) {
				return acc;
			}
			return acc + 1;
		}, 0);
		return requiredCoursesCount + electiveCoursesCount;
	}
);

export const outstandingCourses = derived(
	[completedCourses, pendingCourses, totalCourses],
	([$completedCourses, $pendingCourses, $totalCourses]) => {
		return $totalCourses - $completedCourses - $pendingCourses;
	}
);

const TIMEOUT = 3000;

function createNotificationStore(timeout: number = TIMEOUT) {
	const _notifications = writable<{ id: string; type: string; message: string; timeout: number }[]>(
		[]
	);

	function send(message: string, type = 'default', timeout: number) {
		_notifications.update((state) => {
			return [...state, { id: id(), type, message, timeout }];
		});
	}

	let timers = [];

	const notifications = derived(_notifications, ($_notifications, set) => {
		set($_notifications);
		if ($_notifications.length > 0) {
			const timer = setTimeout(() => {
				_notifications.update((state) => {
					state.shift();
					return state;
				});
			}, $_notifications[0]?.timeout);
			return () => {
				clearTimeout(timer);
			};
		}
	});
	const { subscribe } = notifications;

	return {
		subscribe,
		send,
		default: (msg: string, timeout: number) => send(msg, 'default', timeout),
		danger: (msg: string, timeout: number) => send(msg, 'danger', timeout),
		warning: (msg: string, timeout: number) => send(msg, 'warning', timeout),
		info: (msg: string, timeout: number) => send(msg, 'info', timeout),
		success: (msg: string, timeout: number) => send(msg, 'success', timeout)
	};
}

function id() {
	return '_' + Math.random().toString(36).substr(2, 9);
}

export const notifications = createNotificationStore();
