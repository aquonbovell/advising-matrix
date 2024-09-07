import { db } from '$lib/db';
import { generateTokenWithExpiration } from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
	const { id } = params;
	const { expiresAt, token } = generateTokenWithExpiration();
	console.log('Resetting token for student:', id);
	console.log('New token:', token);
	console.log('Expires at:', expiresAt);

	const result = await db
		.updateTable('Student')
		.set({ invite_token: token, invite_expires: new Date(expiresAt) })
		.where('id', '=', id)
		.execute();

	return json({ success: Number(result[0]?.numUpdatedRows.toString()) > 0 });
};
