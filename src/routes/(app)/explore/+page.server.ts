import { fetchCourseCodes, fetchCourseHierarchy } from '$lib/actions/course.actions';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const courseId = url.searchParams.get('courseId') as string;
	let course;
	if (courseId) {
		course = await fetchCourseHierarchy(courseId);
		console.log(course);
	}

	return { courses: await fetchCourseCodes(), course };
}) satisfies PageServerLoad;
