import { db } from '$lib/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { renewToken } from '$lib/actions/student.actions';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	if (!data.id) {
		return json({ status: 401, message: 'Missing id' });
	}

	const student = await db.selectFrom('Student').where('id', '=', data.id).executeTakeFirst();

	if (!student) {
		return json({ status: 401, message: 'Student not found' });
	}

	const result = await renewToken(data.id);

	if (!result) {
		return json({ status: 404, message: 'Error renewing the token' });
	}

	return json({ status: 200, message: 'Token renewed  successfully' });
};
