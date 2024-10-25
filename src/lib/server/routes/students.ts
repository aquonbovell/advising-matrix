import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '$lib/db';
import { getName, paginatable } from '$lib/utils';
import { TRPCError } from '@trpc/server';
import { gradeSchema, type CourseWithPrerequisites, type Degree } from '$lib/types';
import type { Requirement } from '$lib/types';

const UpdateGradeInputSchema = z.object({
	courseId: z.number(),
	grade: gradeSchema
});

export const studentRouter = router({
	getStudents: protectedProcedure
		.input(
			paginatable({
				order: z.enum(['asc', 'desc']).optional().default('asc')
			})
		)
		.query(async ({ input, ctx }) => {
			const { order, page, size } = input;
			const userId = ctx.user?.id;

			if (!userId) {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}

			if (ctx.user?.role !== 'ADVISOR') {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
			}

			try {
				const [studentsData, countResult, majors, minors] = await Promise.all([
					db
						.selectFrom('Advisor')
						// .where('Advisor.advisor_id', '=', userId)
						.innerJoin('Student', 'Student.id', 'Advisor.student_id')
						.innerJoin('User as StudentUser', 'StudentUser.id', 'Student.user_id')
						.innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisor_id')
						.select([
							'AdvisorUser.name as advisor_name',
							'Student.id as student_id',
							'Student.user_id',
							'StudentUser.name as student_name',
							'Student.major_id',
							'Student.minor_id',
							'StudentUser.email',
							'Student.created_at',
							'Student.updated_at',
							'Student.invite_token',
							'Student.invite_expires'
						])
						.limit(size)
						.offset(page * size)
						.orderBy('StudentUser.name', order)
						.execute(),
					db
						.selectFrom('Advisor')
						.where('Advisor.advisor_id', '=', userId)
						.innerJoin('Student', 'Student.id', 'Advisor.student_id')
						.select(db.fn.countAll<number>().as('count'))
						.executeTakeFirst(),
					db.selectFrom('Majors').selectAll().execute(),
					db.selectFrom('Minors').selectAll().execute()
				]);

				const count = countResult?.count ?? 0;

				const students = studentsData.map((student) => {
					const major = majors.find((m) => m.id === student.major_id)?.name;
					let program_name = major;

					const minor = minors.find((m) => m.id === student.minor_id)?.name;

					const major2 = majors.find((m) => m.id === student.minor_id)?.name;

					if (minor) {
						program_name = `${major} with ${minor}`;
					}

					if (major2) {
						program_name = `${major} and ${major2}`;
					}
					return {
						...student,
						program_name
					};
				});
				return { students, count };
			} catch (err) {
				console.error('Error fetching students:', err);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'An error occurred while fetching students'
				});
			}
		}),
	getMyStudents: protectedProcedure
		.input(
			paginatable({
				order: z.enum(['asc', 'desc']).optional().default('asc')
			})
		)
		.query(async ({ input, ctx }) => {
			const { order, page, size } = input;
			const userId = ctx.user?.id;

			if (!userId) {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}

			if (ctx.user?.role !== 'ADVISOR') {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
			}

			try {
				const [studentsData, countResult, majors, minors] = await Promise.all([
					db
						.selectFrom('Advisor')
						.where('Advisor.advisor_id', '=', userId)
						.innerJoin('Student', 'Student.id', 'Advisor.student_id')
						.innerJoin('User as StudentUser', 'StudentUser.id', 'Student.user_id')
						.innerJoin('User as AdvisorUser', 'AdvisorUser.id', 'Advisor.advisor_id')
						.select([
							'AdvisorUser.name as advisor_name',
							'Student.id as student_id',
							'Student.user_id',
							'StudentUser.name as student_name',
							'Student.major_id',
							'Student.minor_id',
							'StudentUser.email',
							'Student.created_at',
							'Student.updated_at',
							'Student.invite_token',
							'Student.invite_expires'
						])
						.limit(size)
						.offset(page * size)
						.orderBy('StudentUser.name', order)
						.execute(),
					db
						.selectFrom('Advisor')
						.where('Advisor.advisor_id', '=', userId)
						.innerJoin('Student', 'Student.id', 'Advisor.student_id')
						.select(db.fn.countAll<number>().as('count'))
						.executeTakeFirst(),
					db.selectFrom('Majors').selectAll().execute(),
					db.selectFrom('Minors').selectAll().execute()
				]);

				const count = countResult?.count ?? 0;

				const students = studentsData.map((student) => {
					const major = majors.find((m) => m.id === student.major_id)?.name;
					let program_name = major;

					const minor = minors.find((m) => m.id === student.minor_id)?.name;

					const major2 = majors.find((m) => m.id === student.minor_id)?.name;

					if (minor) {
						program_name = `${major} with ${minor}`;
					}

					if (major2) {
						program_name = `${major} and ${major2}`;
					}
					return {
						...student,
						program_name
					};
				});
				return { students, count };
			} catch (err) {
				console.error('Error fetching students:', err);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'An error occurred while fetching students'
				});
			}
		}),

	getStudentCourses: protectedProcedure.query(async ({ ctx }) => {
		const student = await db
			.selectFrom('Student')
			.select(['id'])
			.where('user_id', '=', ctx.user.id)
			.executeTakeFirst();

		if (!student) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Student not found at getStudentCourses'
			});
		}

		const courses = await db
			.selectFrom('StudentCourses')
			.innerJoin('Course', 'Course.id', 'StudentCourses.courseId')
			.select([
				'StudentCourses.id as id',
				'StudentCourses.courseId',
				'StudentCourses.requirementId',
				'StudentCourses.grade',
				'Course.credits'
			])
			.where('StudentCourses.studentId', '=', student.id)
			.execute();

		return { courses };
	}),

	getStudentProgram: protectedProcedure.query(async ({ ctx }) => {
		const program = await db
			.selectFrom('Student')
			.select(['id', 'major_id', 'minor_id'])
			.where('user_id', '=', ctx.user.id)
			.executeTakeFirst();

		if (!program) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Student not found at getStudentProgram'
			});
		}

		return { program };
	}),

	getStudentDegree: protectedProcedure
		.input(
			z.object({
				majorId: z.string().uuid(),
				minorId: z.string().uuid().nullable()
			})
		)
		.query(async ({ input, ctx }) => {
			const { majorId, minorId } = input;

			const program = [majorId, minorId].filter(Boolean);

			const [major, minor] = await Promise.all([
				db
					.selectFrom('Majors')
					.innerJoin('MajorRequirements', 'Majors.id', 'MajorRequirements.majorId')
					.where('Majors.id', 'in', program)
					.selectAll()
					.execute(),
				db
					.selectFrom('Minors')
					.innerJoin('MinorRequirements', 'Minors.id', 'MinorRequirements.minorId')
					.where('Minors.id', 'in', program)
					.selectAll()
					.execute()
			]);

			const requirements = [...major, ...minor]
				.map(
					(m: {
						majorId?: string;
						minorId?: string;
						id: string;
						type: string;
						credits: number;
						details: unknown;
						level: number;
					}) => {
						const requirement = {
							degreeId: m.majorId || m.minorId,
							id: m.id,
							type: m.type,
							credits: m.credits,
							info: m.details,
							details: m.details,
							level: m.level
						} as Requirement;
						return requirement;
					}
				)
				.sort((a, b) => a.level - b.level || a.type.localeCompare(b.type));

			const allCourseIDs = new Set(
				requirements
					.flatMap((r) => r.info.courses || [])
					.map(Number)
					.filter((id) => !isNaN(id))
			);

			// Cause we have the IDs of the courses stored as Int and not Strings
			// const testId = Array.from(allCourseIDs)
			// 	.map(Number)
			// 	.filter((id) => !isNaN(id));

			const coursesWithPrereqs = await db
				.selectFrom('Course')
				.leftJoin('CoursePrerequisite', 'Course.id', 'CoursePrerequisite.courseId')
				.leftJoin('Course as PrereqCourse', 'CoursePrerequisite.prerequisiteId', 'PrereqCourse.id')
				.where('Course.id', 'in', Array.from(allCourseIDs))
				.select([
					'Course.id',
					'Course.code',
					'Course.name',
					'Course.level',
					'Course.credits',
					'Course.departmentId',
					'PrereqCourse.id as prereqId',
					'PrereqCourse.code as prereqCode',
					'PrereqCourse.name as prereqName',
					'PrereqCourse.level as prereqLevel',
					'PrereqCourse.credits as prereqCredits',
					'PrereqCourse.departmentId as prereqDepartmentId'
				])
				.execute();

			// const prerequisites = await db
			// 	.selectFrom('CoursePrerequisite')
			// 	.where('CoursePrerequisite.courseId', 'in', testId)
			// 	.select(['courseId', 'prerequisiteId'])
			// 	.execute();

			// prerequisites.forEach((prereq) => allCourseIDs.add(prereq.prerequisiteId.toString()));

			// const courses = await db
			// 	.selectFrom('Course')
			// 	.where(
			// 		'id',
			// 		'in',
			// 		Array.from(allCourseIDs)
			// 			.map(Number)
			// 			.filter((id) => !isNaN(id))
			// 	)
			// 	.selectAll()
			// 	.execute();

			const courseMap = new Map<string, CourseWithPrerequisites>();
			coursesWithPrereqs.forEach((row) => {
				if (!courseMap.has(row.id.toString())) {
					courseMap.set(row.id.toString(), {
						id: row.id,
						code: row.code,
						name: row.name,
						level: row.level,
						credits: row.credits,
						departmentId: row.departmentId,
						prerequisites: []
					});
				}

				if (row.prereqId) {
					const course = courseMap.get(row.id.toString())!;
					course.prerequisites.push({
						id: row.prereqId,
						code: row.prereqCode!,
						name: row.prereqName!,
						level: row.prereqLevel!,
						credits: row.prereqCredits!,
						departmentId: row.prereqDepartmentId!
					});
				}
			});

			// courses.forEach((course) => {
			// 	courseMap.set(course.id.toString(), {
			// 		...course,
			// 		prerequisites: []
			// 	});
			// });

			// prerequisites.forEach((prereq) => {
			// 	const course = courseMap.get(prereq.courseId.toString());
			// 	const prerequisite = courseMap.get(prereq.prerequisiteId.toString());
			// 	if (course && prerequisite) {
			// 		course.prerequisites.push(prerequisite);
			// 	}
			// });

			for (const requirement of requirements) {
				if (requirement.info.courses) {
					requirement.details = requirement.info.courses
						.map((id) => courseMap.get(id))
						.filter((c): c is CourseWithPrerequisites => c !== undefined);
				}
			}

			return {
				degree: {
					id: `${majorId}${minorId ? `x${minorId}` : ''}`,
					requirements,
					name: getName(major, minor, program)
				} as Degree
			};
		}),

	getStudentGrades: protectedProcedure
		.input(
			z.object({
				studentId: z.string().uuid()
			})
		)
		.query(async ({ input }) => {
			const { studentId } = input;

			const student = await db
				.selectFrom('Student')
				.select(['id'])
				.where('id', '=', studentId)
				.executeTakeFirst();

			if (!student) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Student not found'
				});
			}

			const grades = await db
				.selectFrom('StudentCourses')
				.selectAll()
				.where('studentId', '=', studentId)
				.execute();

			return { grades };
		}),

	updateStudentGrades: protectedProcedure
		.input(z.array(UpdateGradeInputSchema))
		.mutation(async ({ input, ctx }) => {
			const student = await db
				.selectFrom('Student')
				.select(['id'])
				.where('id', '=', ctx.user.id)
				.executeTakeFirst();

			if (!student) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Student not found'
				});
			}

			const updatePromises = input.map(async (update) => {
				db.updateTable('StudentCourses')
					.set({ grade: update.grade })
					.where('studentId', '=', student.id)
					.where('courseId', '=', update.courseId)
					.execute();
			});

			await Promise.all(updatePromises);

			return { success: true };
		})
});
