import { db } from '$lib/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type {
	CourseWithPrerequisites,
	Program,
	ProgramRequirement,
	ProgramRequirementCourses,
	RequirementDetails,
	Student,
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
async function getStudent(userId: string): Promise<Student> {
	const student = await db
		.selectFrom('Student')
		.where('id', '=', userId)
		.select(['id', 'user_id', 'program_id'])
		.executeTakeFirst();
	return student;
}

async function getProgram(programId: string): Promise<Program | null> {
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
		.where('Program.id', '=', programId)
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
				const courseIds: string[] = cos.flatMap(
					(req) => req.details.courses || req.details.facultyPool
				);

				const courses = await getCourses(
					query.flatMap((course) => String(course.id)).filter((id) => !courseIds.includes(id))
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
					query.flatMap((course) => String(course.id)).filter((id) => !courseIds.includes(id))
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
							.filter((course) => req.details.facultyPool.includes(String(course.id)))
							.flatMap((course) => String(course.id))
					)
				});
			}
		}
	}

	return {
		id: program[0]!.id,
		name: program[0]!.name,
		requirements,
		requirementsWithCourses: data,
		degreeCredits: program.reduce((acc, req) => acc + req.credits, 0),

		degreeCourses: program.reduce((acc, req) => acc + req.credits / 3, 0)
	};
}

async function getCourses(courseIds: string[]): Promise<CourseWithPrerequisites[]> {
	if (courseIds.length === 0) {
		return [];
	}

	const cIds = courseIds.map((id) => parseInt(id));

	const [courses, prerequisites] = await Promise.all([
		db.selectFrom('Course').where('id', 'in', cIds).selectAll().execute(),
		db
			.selectFrom('CoursePrerequisite as CP')
			.innerJoin('Course as C', 'CP.prerequisiteId', 'C.id')
			.where('CP.courseId', 'in', cIds)
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
	const flattenedCourseIdsString = flattenedCourseIds.map((id) => id.toString());
	return flattenedCourseIds.length > 0 ? getCourses(flattenedCourseIdsString) : [];
}

async function getStudentCourses(studentId: string): Promise<Record<string, StudentGrade>> {
	return await db
		.selectFrom('StudentCourse')
		.innerJoin('Course', 'StudentCourse.courseId', 'Course.id')
		.select([
			'StudentCourse.id',
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
					if (Object.keys(acc).includes(sc.courseId?.toString()!)) {
						acc[sc.courseId?.toString()!]?.grades.push({ grade: sc.grade as Grade, id: sc.id });
					} else {
						acc[sc.courseId?.toString()!] = {
							grades: [{ grade: sc.grade as Grade, id: sc.id }],
							requirementId: sc.requirementId,
							course: {
								id: sc.courseId!,
								code: sc.code,
								name: sc.name,
								level: sc.level,
								credits: sc.credits
							}
						};
					}
					return acc;
				},
				{} as Record<string, StudentGrade>
			)
		);
}
export const load: PageServerLoad = async ({ locals, params }) => {
	if (!params.id) throw error(400, 'Missing student ID');

	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const student = await getStudent(params.id);

	if (!student) throw error(404, 'Student not found or not assigned to advisor');

	const program = await getProgram(student.program_id!);

	if (!program) error(404, 'Program not found');

	const [programCourses, electiveCourses, studentCourses] = await Promise.all([
		getCourses(
			program.requirements.flatMap((req) => {
				if (req.type === 'CREDITS') {
					return req.details.courses;
				}
				return [];
			})
		),
		getElectiveCourses(program.requirements.filter((req) => req.type === 'POOL')),
		getStudentCourses(student.id)
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
