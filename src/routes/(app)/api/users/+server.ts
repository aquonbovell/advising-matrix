import { fetchUsers } from '$lib/actions/user.actions';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const users = await fetchUsers();
	return json(users);
};