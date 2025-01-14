import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchFaculties } from '$lib/server/actions/faculty.actions';

export const GET: RequestHandler = async () => {
	const faculties = await fetchFaculties();
	return json(faculties);
};
