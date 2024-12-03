import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchCourses } from '$lib/server/actions/course.actions';

export const GET: RequestHandler = async () => {
	const courses = await fetchCourses();
	return json(courses);
};
