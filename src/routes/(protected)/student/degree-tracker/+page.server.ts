import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { CourseRequirement, ProgramRequirement, RequirementDetails } from '$lib/types';
import type { Course, RequirementType } from '$lib/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	// const student = await db
	// 	.selectFrom('Student')
	// 	.where('Student.user_id', '=', userId)
	// 	.executeTakeFirst();

	// if (!student) {
	// 	throw error(404, 'Student not found');
	// }

	const courses = await db
		.selectFrom('Course')
		.selectAll()
		.where('Course.departmentId', '=', '1')
		.execute();

	const program = await db
		.selectFrom('Program')
		.leftJoin('ProgramRequirement', 'Program.id', 'ProgramRequirement.programId')
		.select([
			'Program.id',
			'Program.name',
			'ProgramRequirement.id as requirementId',
			'ProgramRequirement.type',
			'ProgramRequirement.credits',
			'ProgramRequirement.details'
		])
		.where('Program.name', '=', 'Computer Science')
		.executeTakeFirst();

	if (!program) {
		throw error(404, 'Program not found');
	}

	const parsedDetails: RequirementDetails =
		typeof program.details === 'string'
			? JSON.parse(program.details)
			: (program.details as RequirementDetails);

	const programRequirement: ProgramRequirement = {
		id: program.requirementId!,
		programId: program.id,
		type: program.type as RequirementType,
		credits: program.credits!,
		details: parsedDetails
	};

	let programCourses: Course[] = [];
	if (programRequirement.type === 'CREDITS' && 'courses' in programRequirement.details) {
		programCourses = await db
			.selectFrom('Course')
			.selectAll()
			.where('Course.id', 'in', programRequirement.details.courses)
			.execute();
	}

	return {
		program: {
			id: program.id,
			name: program.name,
			requirement: programRequirement
		},
		programCourses
	};
};
