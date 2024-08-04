import { db } from '$lib/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type {
	CourseWithPrerequisites,
	Program,
	ProgramRequirement,
	ProgramRequirementCourses,
	RequirementDetails,
	StudentGrade
} from '$lib/types';
import type { Course, RequirementType } from '$lib/db/schema';
import { generateId } from 'lucia';

async function getStudentId(userId: string): Promise<string | null> {
	return await db
		.selectFrom('Student')
		.where('user_id', '=', userId)
		.select('id')
		.executeTakeFirst()
		.then((result) => result?.id ?? null);
}

async function getProgram(userId: string): Promise<Program | null> {
	const user = await db
		.selectFrom('Student')
		.where('user_id', '=', userId)
		.select('Student.program_id')
		.executeTakeFirst();
	const program = await db
		.selectFrom('Program')
		.leftJoin('ProgramRequirement', 'Program.id', 'ProgramRequirement.programId')
		.select([
			'Program.id',
			'Program.name',
			'ProgramRequirement.id as requirementId',
			'ProgramRequirement.programId',
			'ProgramRequirement.type',
			'ProgramRequirement.level',
			'ProgramRequirement.credits',
			'ProgramRequirement.details'
		])
		.where('Program.id', '=', user!.program_id)
		.execute();

	if (!program.length) return null;

	const requirements: ProgramRequirement[] = program.map((req) => ({
		id: req.requirementId!,
		programId: req.programId!,
		type: req.type as RequirementType,
		level: req.level!,
		credits: req.credits!,
		details:
			typeof req.details === 'string'
				? JSON.parse(req.details)
				: (req.details as RequirementDetails)
	}));

	const data: ProgramRequirementCourses[] = [];

	for (const req of requirements) {
		if (req.type === 'POOL') {
			const details = req.details;
			let query = await db
				.selectFrom('Course')
				.select('id')
				.where(
					'level',
					'in',
					details.levelPool.map((level: string) => (level === 'I' ? 1 : level === 'II' ? 2 : 3))
				)
				.execute();
			if (typeof req.details.facultyPool === 'string' && req.details.facultyPool === 'any') {
				const cos = requirements.filter(
					(req) =>
						(req.type === 'CREDITS' && 'courses' in req.details) ||
						(req.type === 'POOL' &&
							Array.isArray(req.details.facultyPool) &&
							!Number.isNaN(+req.details.facultyPool.join('')))
				);
				const courseRequirementCodes = requirements.filter(
					(req) =>
						req.details.facultyPool !== 'any' &&
						!(
							Array.isArray(req.details.facultyPool) &&
							!Number.isNaN(+req.details.facultyPool.join(''))
						)
				);
				const courseIds = cos.flatMap((req) => req.details.courses || req.details.facultyPool);

				const courses = await getCourses(
					query.flatMap((course) => course.id).filter((id) => !courseIds.includes(id))
				);
				const filtered = courses.filter(
					(course) =>
						!courseRequirementCodes
							.flatMap((req) => req.details.facultyPool)
							.includes(course.code.substring(0, 4))
				);
				data.push({
					id: req.id!,
					programId: req.programId!,
					type: req.type as RequirementType,
					level: req.level!,
					credits: req.credits!,
					details: req.details,
					courses: filtered
				});
			} else if (
				Array.isArray(req.details.facultyPool) &&
				Number.isNaN(+req.details.facultyPool.join(''))
			) {
				const cos = requirements.filter(
					(req) =>
						(req.type === 'CREDITS' && 'courses' in req.details) ||
						(req.type === 'POOL' &&
							Array.isArray(req.details.facultyPool) &&
							!Number.isNaN(+req.details.facultyPool.join('')))
				);
				const courseRequirementCodes = requirements.filter(
					(req) =>
						req.details.facultyPool !== 'any' &&
						!(
							Array.isArray(req.details.facultyPool) &&
							!Number.isNaN(+req.details.facultyPool.join(''))
						)
				);
				const courseIds = cos.flatMap((req) => req.details.courses || req.details.facultyPool);

				const courses = await getCourses(
					query.flatMap((course) => course.id).filter((id) => !courseIds.includes(id))
				);
				const filtered = courses.filter((course) =>
					courseRequirementCodes
						.flatMap((req) => req.details.facultyPool)
						.includes(course.code.substring(0, 4))
				);
				data.push({
					id: req.id!,
					programId: req.programId!,
					type: req.type as RequirementType,
					level: req.level!,
					credits: req.credits!,
					details: req.details,
					courses: filtered
				});
			} else {
				data.push({
					id: req.id!,
					programId: req.programId!,
					type: req.type as RequirementType,
					level: req.level!,
					credits: req.credits!,
					details: req.details,
					courses: await getCourses(
						query
							.filter((course) => req.details.facultyPool.includes(course.id))
							.flatMap((course) => course.id)
					)
				});
			}
		}
	}
	return {
		id: program[0]!.id,
		name: program[0]!.name,
		requirements,
		requirementsWithCourses: data
	};
}

async function getCourses(courseIds: string[]): Promise<CourseWithPrerequisites[]> {
	if (courseIds.length === 0) {
		return [];
	}
	const [courses, prerequisites] = await Promise.all([
		db.selectFrom('Course').where('id', 'in', courseIds).selectAll().execute(),
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
		prerequisites: prerequisites
			.filter((prereq) => prereq.courseId === course.id)
			.map(({ prerequisiteId, prerequisiteCode, prerequisiteName }) => ({
				id: prerequisiteId,
				code: prerequisiteCode,
				name: prerequisiteName
			}))
	}));
}

async function getElectiveCourses(
	requirements: ProgramRequirement[]
): Promise<CourseWithPrerequisites[]> {
	const poolRequirements = requirements.filter((req) => req.type === 'POOL');
	if (poolRequirements.length === 0) {
		return [];
	}
	const courseIds = await Promise.all(
		poolRequirements.map(async (req) => {
			const details = req.details as { levelPool: string[]; facultyPool: string[] | 'any' };
			let query = db
				.selectFrom('Course')
				.select('id')
				.where(
					'level',
					'in',
					details.levelPool.map((level) => (level === 'I' ? 1 : level === 'II' ? 2 : 3))
				);

			// if (details.facultyPool !== 'any') {
			// 	query = query
			// 		.innerJoin('Department', 'Department.id', 'Course.departmentId')
			// 		.where('Department.name', 'in', details.facultyPool);
			// }

			return query.execute().then((results) => results.map((r) => r.id));
		})
	);
	const flattenedCourseIds = courseIds.flat();
	return flattenedCourseIds.length > 0 ? getCourses(flattenedCourseIds) : [];
}

async function getStudentCourses(studentId: string): Promise<Record<string, StudentGrade>> {
	return await db
		.selectFrom('StudentCourse')
		.innerJoin('Course', 'StudentCourse.courseId', 'Course.id')
		.select([
			'StudentCourse.courseId',
			'StudentCourse.grade',
			'StudentCourse.requirementId',
			'Course.id as courseId',
			'Course.code',
			'Course.name',
			'Course.level',
			'Course.credits'
		])
		.where('StudentCourse.studentId', '=', studentId)
		.execute()
		.then((courses) =>
			courses.reduce(
				(acc, sc) => {
					acc[sc.courseId] = {
						grade: sc.grade as StudentGrade['grade'],
						requirementId: sc.requirementId,
						course: {
							id: sc.courseId,
							code: sc.code,
							name: sc.name,
							level: sc.level,
							credits: sc.credits
						}
					};
					return acc;
				},
				{} as Record<string, StudentGrade>
			)
		);
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const studentId = await getStudentId(userId);
	if (!studentId) throw error(404, 'Student not found');

	const program = await getProgram(userId);
	if (!program) throw error(404, 'Program not found');

	const [programCourses, electiveCourses, studentCourses] = await Promise.all([
		getCourses(
			program.requirements.flatMap((req) =>
				req.type === 'CREDITS' && 'courses' in req.details ? req.details.courses : []
			)
		),
		getElectiveCourses(program.requirements.filter((req) => req.type === 'POOL')),
		getStudentCourses(studentId)
	]);

	// *Debugging
	// console.log('Program:', program);
	// console.log('Program Courses:', programCourses);
	// console.log('Elective Courses:', electiveCourses);
	// console.log('Student Courses:', studentCourses);

	return {
		program,
		degreeCourses: programCourses,
		electiveCourses,
		studentCourses,
		requirements: program.requirements
	};
};

export const actions: Actions = {
	saveChanges: async ({ request, locals }) => {
		const userId = locals.user?.id;
		if (!userId) return fail(401, { message: 'Unauthorized' });

		const studentId = await getStudentId(userId);
		if (!studentId) return fail(404, { message: 'Student not found' });

		const formData = await request.formData();

		console.log('Form Data:', formData);
		const courseEntries = Array.from(formData.entries())
			.filter(([key, value]) => key.startsWith('courses[') && key.endsWith('].grade'))
			.map(([key, value]) => {
				const courseId = key.slice(8, -7);
				return {
					courseId,
					grade: value as string,
					requirementId: formData.get(`courses[${courseId}].requirementId`) as string | null
				};
			});

		console.log('Course Entries:', courseEntries);
		try {
			await db.transaction().execute(async (trx) => {
				await trx.deleteFrom('StudentCourse').where('studentId', '=', studentId).execute();

				for (const { courseId, grade, requirementId } of courseEntries) {
					if (grade) {
						await trx
							.insertInto('StudentCourse')
							.values({
								id: generateId(16),
								studentId,
								courseId,
								grade,
								...(requirementId ? { requirementId } : {})
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
	removeCourse: async ({ request, locals }) => {
		const userId = locals.user?.id;
		if (!userId) return fail(401, { message: 'Unauthorized' });

		const studentId = await getStudentId(userId);
		if (!studentId) return fail(404, { message: 'Student not found' });

		const formData = await request.formData();
		const courseId = formData.get('courseId') as string;
		const requirementId = formData.get('requirementId') as string;

		console.log('Removing course:', courseId, requirementId);

		console.log('Form Data:', formData);

		if (!courseId || !requirementId) {
			return fail(400, { message: 'Missing course or requirement ID' });
		}

		try {
			await db.transaction().execute(async (trx) => {
				await trx
					.deleteFrom('StudentCourse')
					.where('studentId', '=', studentId)
					.where('courseId', '=', courseId)
					.where('requirementId', '=', requirementId)
					.execute();
			});

			return { success: true };
		} catch (err) {
			console.error('Error removing course:', err);
			return fail(500, { message: 'Failed to remove course' });
		}
	}
};
