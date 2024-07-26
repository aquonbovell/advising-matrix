import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ProgramRequirement, RequirementDetails } from '$lib/types';
import type { Course, RequirementType } from '$lib/db/schema';
import { fail } from 'sveltekit-superforms';
import { generateId } from 'lucia';

async function getStudent(userId: string) {
	return db
		.selectFrom('Student')
		.where('Student.user_id', '=', userId)
		.select('id')
		.executeTakeFirst();
}

async function getProgram(programName: string) {
	const program = await db
		.selectFrom('Program')
		.leftJoin('ProgramRequirement', 'Program.id', 'ProgramRequirement.programId')
		.select([
			'Program.id',
			'Program.name',
			'ProgramRequirement.id as requirementId',
			'ProgramRequirement.programId',
			'ProgramRequirement.type',
			'ProgramRequirement.credits',
			'ProgramRequirement.details'
		])
		.where('Program.name', '=', programName)
		.execute();

	if (!program.length) return null;

	const requirements: ProgramRequirement[] = program.map((req) => ({
		id: req.requirementId!,
		programId: req.programId!,
		type: req.type as RequirementType,
		credits: req.credits!,

		details:
			typeof req.details === 'string'
				? JSON.parse(req.details)
				: (req.details as RequirementDetails)
	}));

	return {
		id: program[0]!.id,
		name: program[0]!.name,
		requirements: requirements
	};
}

async function getLevel1credits(programName: string) {
	const program = await db
		.selectFrom('Program')
		.leftJoin('ProgramRequirement', 'Program.id', 'ProgramRequirement.programId')
		.select(['ProgramRequirement.credits'])
		.where('Program.name', '=', programName)
		.where('ProgramRequirement.type', '=', 'POOL')
		.execute();

	return program[0]!.credits;
}

async function getProgramCourses(programRequirements: ProgramRequirement[]) {
	const courseIds = programRequirements.flatMap((req) =>
		req.type === 'CREDITS' && 'courses' in req.details ? req.details.courses : []
	);

	const [courses, coursePrerequisites] = await Promise.all([
		db.selectFrom('Course').where('Course.id', 'in', courseIds).selectAll().execute(),
		db
			.selectFrom('CoursePrerequisite as CP')
			.innerJoin('Course as C', 'CP.prerequisiteId', 'C.id')
			.where('CP.courseId', 'in', courseIds)
			.select([
				'CP.courseId',
				'CP.prerequisiteId',
				'C.code as prerequisiteCode',
				'C.name as prerequisiteName'
			])
			.execute()
	]);

	return courses.map((course: Course) => ({
		...course,
		prerequisites: coursePrerequisites
			.filter((prereq) => prereq.courseId === course.id)
			.map(({ prerequisiteId, prerequisiteCode, prerequisiteName }) => ({
				id: prerequisiteId,
				code: prerequisiteCode,
				name: prerequisiteName
			}))
	}));
}

async function getElectiveCourses(programRequirements: ProgramRequirement[], userId: string) {
	const electiveIDs = await db
		.selectFrom('Student')
		.where('user_id', '=', userId)
		.select('electivePool')
		.executeTakeFirst();

	console.log('electiveIDs:', electiveIDs?.electivePool);
	const courseIds = electiveIDs?.electivePool || [];
	console.log('courseIds:', courseIds);

	const [courses, coursePrerequisites] = await Promise.all([
		db.selectFrom('Course').where('Course.id', 'in', courseIds).selectAll().execute(),
		db
			.selectFrom('CoursePrerequisite as CP')
			.innerJoin('Course as C', 'CP.prerequisiteId', 'C.id')
			.where('CP.courseId', 'in', courseIds)
			.select([
				'CP.courseId',
				'CP.prerequisiteId',
				'C.code as prerequisiteCode',
				'C.name as prerequisiteName'
			])
			.execute()
	]);

	return courses.map((course: Course) => ({
		...course,
		prerequisites: coursePrerequisites
			.filter((prereq) => prereq.courseId === course.id)
			.map(({ prerequisiteId, prerequisiteCode, prerequisiteName }) => ({
				id: prerequisiteId,
				code: prerequisiteCode,
				name: prerequisiteName
			}))
	}));
}

async function getStudentCourses(studentId: string) {
	return db
		.selectFrom('StudentCourse')
		.selectAll()
		.where('StudentCourse.studentId', '=', studentId)
		.execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createStudentCoursesMap(studentCourses: any[]) {
	return studentCourses.reduce(
		(acc, sc) => {
			acc[sc.courseId] = { id: sc.id, grade: sc.grade };
			return acc;
		},
		{} as Record<string, { id: string; grade: string }>
	);
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	if (!userId) throw error(401, 'Unauthorized');

	const [student, program] = await Promise.all([
		getStudent(userId),
		getProgram('Computer Science')
	]);

	if (!student) throw error(404, 'Student not found');
	if (!program) throw error(404, 'Program not found');

	const [coursesWithPrerequisites, studentCourses, studentElectiveCourses] = await Promise.all([
		getProgramCourses(program.requirements),
		getStudentCourses(student.id),
		getElectiveCourses(program.requirements, userId)
	]);
	console.log('studentCourses:', studentElectiveCourses);
	const studentCoursesMap = createStudentCoursesMap(studentCourses);

	console.log('studentCoursesMap:', studentCoursesMap);

	const courses = await db
		.selectFrom('Course')
		.selectAll()
		.where('Course.code', 'like', '____1%')
		.execute();

	return {
		program: {
			id: program.id,
			name: program.name,
			requirement: program.requirements
		},
		programCourses: coursesWithPrerequisites,
		studentCourses: studentCoursesMap,
		studentElectiveCourses: studentElectiveCourses,
		level1credits: await getLevel1credits(program.name),
		courses: courses.filter((course) => {
			return coursesWithPrerequisites.findIndex((sc) => sc.id === course.id) === -1;
		})
	};
};

export const actions: Actions = {
	saveChanges: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const formData = await request.formData();

		try {
			const student = await db
				.selectFrom('Student')
				.where('Student.user_id', '=', userId)
				.select('id')
				.executeTakeFirst();

			if (!student) {
				return fail(404, { message: 'Student not found' });
			}

			const courseEntries = Array.from(formData.entries())
				.filter(([key, value]) => key.startsWith('courses[') && key.endsWith('].grade'))
				.map(([key, value]) => ({
					courseId: key.slice(8, -7),
					grade: value as string
				}));

			await db.transaction().execute(async (trx) => {
				// First, delete all existing entries for this student
				await trx.deleteFrom('StudentCourse').where('studentId', '=', student.id).execute();

				// Then, insert new entries
				for (const { courseId, grade } of courseEntries) {
					if (grade) {
						await trx
							.insertInto('StudentCourse')
							.values({
								id: generateId(16),
								studentId: student.id,
								courseId,
								grade
							})
							.execute();
					}
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Error saving changes:', err);
			return fail(500, { message: 'Failed to save changes' });
		}
	},

	addElectives: async ({ request, locals }) => {
		const data = await request.formData();
		const electiveID = data.get('elective');

		if (!electiveID) {
			return fail(400, { message: 'Elective ID is required' });
		}

		const existingElectives = await db
			.selectFrom('Student')
			.select('electivePool')
			.where('user_id', '=', locals.user!.id)
			.executeTakeFirst();

		if (!existingElectives) {
			return fail(404, { message: 'Student not found' });
		}

		let updatedElectivePool = existingElectives.electivePool;

		if (!updatedElectivePool) {
			updatedElectivePool = [];
		} else if (updatedElectivePool.includes(electiveID.toString())) {
			return fail(400, { message: 'Elective already added' });
		}

		if (!updatedElectivePool.includes(electiveID.toString())) {
			updatedElectivePool.push(electiveID.toString());
		}

		const res = await db
			.updateTable('Student')
			.set({ electivePool: updatedElectivePool })
			.where('user_id', '=', locals.user!.id)
			.execute();

		return { success: true };
	}
};
