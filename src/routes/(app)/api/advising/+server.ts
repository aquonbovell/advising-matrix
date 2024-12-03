import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchAdvisingStudents } from '$lib/server/actions/student.actions';

export const GET: RequestHandler = async ({ url }) => {
	const userId = url.searchParams.get('userId');
	if (!userId) {
		return json({ error: 'No user ID provided' }, { status: 400 });
	}
	const students = await fetchAdvisingStudents(userId);
	return json(students);
};
