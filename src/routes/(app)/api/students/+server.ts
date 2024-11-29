import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchStudents } from '$lib/actions/student.actions';

export const GET: RequestHandler = async () => {
	const students = await fetchStudents();
	return json(students);
};
