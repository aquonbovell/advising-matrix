import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchMajors } from '$lib/actions/major.actions';

export const GET: RequestHandler = async () => {
	const majors = await fetchMajors();
	return json(majors);
};
