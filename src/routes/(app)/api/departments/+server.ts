import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchDepartments } from '$lib/server/actions/department.actions';

export const GET: RequestHandler = async () => {
	const departments = await fetchDepartments();
	return json(departments);
};
