import { fetchCourses } from '$lib/actions/course.action';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;
