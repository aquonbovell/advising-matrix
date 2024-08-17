import { db } from '$lib/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) return new Response('Missing ID', { status: 400 });
	const studentProgram = await db
		.selectFrom('Student')
		.innerJoin('ProgramRequirement', 'Student.program_id', 'ProgramRequirement.programId')
		.where('Student.id', '=', id)
		.selectAll()
		.execute();
	return json(studentProgram);
};
