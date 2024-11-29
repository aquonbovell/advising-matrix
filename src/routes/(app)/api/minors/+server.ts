import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchMinors } from '$lib/actions/minor.actions';

export const GET: RequestHandler = async () => {
	const minors = await fetchMinors();
	return json(minors);
};
