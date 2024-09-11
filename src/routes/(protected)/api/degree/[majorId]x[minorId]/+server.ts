import { db } from '$lib/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { RequirementType } from '$lib/db/schema';

type CourseWithPrerequisites = {
	id: number;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
	prequisites: Course[];
};

type Requirement = {
	dgId: string;
	id: string;
	type: RequirementType;
	credits: number;
	details: CourseWithPrerequisites[];
	level: number | null;
};

type Course = {
	id: number;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
};

type Degree = {
	name: string;
	dgId: string[];
	requirements: Requirement[];
};

export const GET: RequestHandler = async ({ params }) => {
	const { majorId, minorId } = params;

	if (!majorId) {
		return json({ error: 'Major ID is required' }, { status: 400 });
	}
	const program = [
		...new Set(
			[majorId, minorId].filter(
				(id) => id !== 'null' && id !== 'undefined' && id !== undefined && id !== null
			)
		)
	];

	const majorName = await db
		.selectFrom('Majors')
		.where('id', '=', majorId)
		.select('name')
		.executeTakeFirst();
	const minorName = await db
		.selectFrom('Minors')
		.where('id', '=', minorId)
		.select('name')
		.executeTakeFirst();
	let data: Degree = {
		dgId: program,
		requirements: [],
		name:
			minorName?.name === 'No Minor'
				? majorName?.name!
				: `${majorName?.name} with ${minorName?.name}`
	};
	const major = await db
		.selectFrom('MajorRequirements')
		.where('majorId', '=', majorId)
		.selectAll()
		.execute();

	const minor = await db
		.selectFrom('MinorRequirements')
		.where('minorId', '=', minorId)
		.selectAll()
		.execute();

	let degree = [
		...major.map((m) => {
			return {
				dgId: m.majorId,
				id: m.id,
				type: m.type,
				credits: m.credits,
				details: m.details,
				level: m.level
			};
		}),
		...minor.map((m) => {
			return {
				dgId: m.minorId,
				id: m.id,
				type: m.type,
				credits: m.credits,
				details: m.details,
				level: m.level
			};
		})
	];

	// This removes the level 1 pool requirement if there are already 2 level 1 credit requirements
	const noLevelOnePool =
		degree.filter((req) => req.level === 1 && req.type === 'CREDITS').length >= 2 &&
		program.length > 1;

	if (noLevelOnePool) {
		const poolReq = degree.filter((req) => req.level === 1 && req.type === 'POOL');
		degree = degree.filter((req) => !poolReq.map((r) => r.id).includes(req.id));
	}

	// This combines all level 1 credit requirements into a single requirement

	if (
		degree.filter((req) => req.level === 1 && req.type === 'CREDITS').length > 0 &&
		program.length > 1
	) {
		const req = degree.filter((req) => req.level === 1 && req.type === 'CREDITS');

		const newRequirement = {
			dgId: degree[0]?.dgId!,
			id: req[0]!.id,
			type: 'CREDITS' as RequirementType,
			credits: degree
				.filter((req) => req.level === 1 && req.type === 'CREDITS')
				.reduce((acc, req) => acc + req.credits, 0),
			details: {
				courses: degree
					.filter((req) => req.level === 1 && req.type === 'CREDITS')
					.flatMap((req) => {
						const details = req.details as { courses?: string[]; area?: string[] };
						return details.courses ?? [];
					})
			},
			level: 1
		};

		const ids = degree
			.filter((req) => req.level === 1 && req.type === 'CREDITS')
			.flatMap((req) => req.id);

		degree = degree.filter((req) => !ids.includes(req.id));
		degree.push(newRequirement);
	}

	// This removes the level elective pool requirement if the program has 2 majors / 1 minor

	const removeElectivePool =
		degree.filter(
			(req) =>
				req.level === 4 &&
				req.type === 'POOL' &&
				Object.entries(req.details as { courses?: string[]; area?: string[] }).length === 0
		) && program.length > 1;

	if (removeElectivePool) {
		const ids = degree
			.filter(
				(req) =>
					req.level === 4 &&
					req.type === 'POOL' &&
					Object.entries(req.details as { courses?: string[]; area?: string[] }).length === 0
			)
			.flatMap((req) => req.id);
		degree = degree.filter((req) => !ids.includes(req.id));
	}

	const CoursesDB = await db.selectFrom('Course').selectAll().execute();

	const CoursePrerequisitesDB = await db
		.selectFrom('CoursePrerequisite')
		.innerJoin('Course', 'Course.id', 'CoursePrerequisite.prerequisiteId')
		.select([
			'CoursePrerequisite.courseId',
			'Course.id',
			'Course.code',
			'Course.name',
			'Course.level',
			'Course.credits',
			'Course.departmentId'
		])
		.execute();

	for (const requirement of degree) {
		const details = requirement.details as { courses?: string[]; area?: string[] };
		if (details.courses) {
			let courses: CourseWithPrerequisites[] = [];
			for (const courseId of details.courses) {
				const course = CoursesDB.find((c) => c.id === parseInt(courseId));
				const CoursePrerequisites: Course[] = CoursePrerequisitesDB.filter(
					(c) => c.courseId === course!.id
				);
				courses.push({ ...course!, prequisites: CoursePrerequisites });
			}
			data.requirements.push({ ...requirement, details: courses });
		}
		if (details.area) {
			const courses: CourseWithPrerequisites[] = [];
			for (const area of details.area) {
				const areaCourses = CoursesDB.filter(
					(c) =>
						(requirement.level === 4 ? [2, 3] : [requirement.level]).includes(c.level) &&
						c.code.startsWith(area)
				);
				for (const course of areaCourses) {
					courses.push({ ...course, prequisites: [] as Course[] });
				}
			}

			for (const course of courses) {
				const CoursePrerequisites: Course[] = CoursePrerequisitesDB.filter(
					(c) => c.courseId === course.id
				);
				course.prequisites = CoursePrerequisites;
			}
			data.requirements.push({ ...requirement, details: courses });
		}
		if (!details.area && !details.courses) {
			const courses: CourseWithPrerequisites[] = [];
			const anyCourses = CoursesDB.filter((c) =>
				(requirement.level === 4 ? [2, 3] : [requirement.level]).includes(c.level)
			);

			for (const course of anyCourses) {
				courses.push({ ...course, prequisites: [] as Course[] });
			}

			for (const course of courses) {
				const CoursePrerequisites: Course[] = CoursePrerequisitesDB.filter(
					(c) => c.courseId === course.id
				);
				course.prequisites = CoursePrerequisites;
			}
			data.requirements.push({ ...requirement, details: courses });
		}
	}

	return json(data);
};
