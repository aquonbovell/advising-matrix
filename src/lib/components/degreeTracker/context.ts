import { writable, get, type Writable } from 'svelte/store';
import type { CourseWithPrerequisites } from '$lib/types';

const poolCourses = new Map<string, Writable<CourseWithPrerequisites[]>>();

export function getPoolCourses(requirementId: string) {
	if (!poolCourses.has(requirementId)) {
		poolCourses.set(requirementId, writable([]));
	}
	return poolCourses.get(requirementId);
}

export function setPoolCourses(requirementId: string, courses: CourseWithPrerequisites[]) {
	if (!poolCourses.has(requirementId)) {
		poolCourses.set(requirementId, writable(courses));
	} else {
		const store = poolCourses.get(requirementId);
		store!.set(courses);
	}
}

export function updatePoolCourses(requirementId: string) {
	const store = getPoolCourses(requirementId);
	store!.update((courses) => [...courses]);
	// setPoolCourses(requirementId, get(store));
	getPoolCourses(requirementId)?.subscribe((courses) => {
		console.log('Courses:', courses);
	});
}
