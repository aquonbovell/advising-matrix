import { db } from '$lib/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Course, RequirementType } from '$lib/db/schema';
import type { CourseWithPrerequisites, Degree, Requirement } from '$lib/types';
import { getName } from '$lib/utils';

export const GET: RequestHandler = async ({ params }) => {
	const { majorId, minorId } = params;

	if (!majorId) {
		return json({ error: 'Major ID is required' }, { status: 400 });
	}

	if (!minorId) {
		return json({ error: 'Minor ID is required' }, { status: 400 });
	}

	const program = [majorId, minorId];

	const major = await db
		.selectFrom('Majors')
		.innerJoin('MajorRequirements', 'Majors.id', 'MajorRequirements.majorId')
		.where('Majors.id', 'in', program)
		.selectAll()
		.execute();
	const minor = await db
		.selectFrom('Minors')
		.innerJoin('MinorRequirements', 'Minors.id', 'MinorRequirements.minorId')
		.where('Minors.id', 'in', program)
		.selectAll()
		.execute();

	let studentData: Degree = {
		id: major
			.map((m) => m.id)
			.join('')
			.concat(minor.map((m) => m.id).join('')),
		requirements: [],
		name: getName(major, minor, program)
	};

	studentData.requirements = [...major, ...minor].map(
		(m: {
			majorId?: string;
			minorId?: string;
			id: string;
			type: RequirementType;
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
				level: m.level
			} as Requirement;
			return requirement;
		}
	);

	const levelOneRequirements = studentData.requirements.filter(
		(req) => req.level === 1 && Object.keys(req.info).length > 0 && req.type === 'CREDITS'
	);

	let levelOne = levelOneRequirements.reduce((acc, req) => {
		return acc + req.credits;
	}, 0);

	if (levelOne >= 12) {
		const requirementPool = studentData.requirements.filter(
			(req) => req.level === 1 && req.type === 'POOL' && Object.keys(req.info).length === 0
		);
		const poolReqId = requirementPool.map((req) => req.id);
		studentData.requirements = studentData.requirements.filter(
			(req) => !poolReqId.includes(req.id)
		);

		let totalCredits = 0;

		const uniInfo: string[] = [];
		levelOneRequirements.forEach((req) => {
			const info = req.info as { courses?: string[]; area?: string[] };
			if (info.courses) {
				for (const courseId of info.courses) {
					if (!uniInfo.includes(courseId)) {
						uniInfo.push(courseId);
						totalCredits += 3;
					}
				}
			}
		});

		if (totalCredits < 24) {
			const newRequirement = {
				degreeId: requirementPool[0]!.degreeId,
				id: requirementPool[0]!.id,
				type: 'POOL',
				credits: 24 - totalCredits,
				info: {},
				level: 1
			} as Requirement;
			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	if (levelOneRequirements.length > 1) {
		const reqIds = levelOneRequirements.map((req) => req.id);
		let totalCredits = 0;
		// console.log('Enter the level one requirements credits');
		// console.log(levelOneRequirements);

		const uniInfo: string[] = [];
		levelOneRequirements.forEach((req) => {
			const info = req.info as { courses?: string[]; area?: string[] };
			if (info.courses) {
				for (const courseId of info.courses) {
					if (!uniInfo.includes(courseId)) {
						uniInfo.push(courseId);
						totalCredits += 3;
					}
				}
			}
		});

		const newRequirement = {
			degreeId: levelOneRequirements[0]!.degreeId,
			id: levelOneRequirements[0]!.id,
			type: 'CREDITS',
			credits: totalCredits,
			info: { courses: uniInfo },
			level: 1
		} as Requirement;
		studentData.requirements = studentData.requirements.filter((req) => !reqIds.includes(req.id));
		studentData.requirements = [newRequirement, ...studentData.requirements];
	}

	const requiredCredits = studentData.requirements
		.filter((req) => {
			return Object.entries(req.info).length !== 0 && req.level !== 1;
		})
		.reduce((acc, req) => {
			return acc + req.credits;
		}, 0);

	if (requiredCredits >= 30) {
		const requirementPool = studentData.requirements.filter(
			(req) => req.level !== 1 && req.type === 'POOL' && Object.keys(req.info).length === 0
		);
		const poolReqId = requirementPool.map((req) => req.id);
		studentData.requirements = studentData.requirements.filter(
			(req) => !poolReqId.includes(req.id)
		);
		if (60 - requiredCredits > 0) {
			const newRequirement = {
				degreeId: requirementPool[0]!.degreeId,
				id: requirementPool[0]!.id,
				type: 'POOL',
				credits: 60 - requiredCredits,
				info: {},
				level: 4
			} as Requirement;

			// console.log(newRequirement);

			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
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

	// GET the level one credits

	for (const requirement of studentData.requirements) {
		const details = requirement.info as { courses?: string[]; area?: string[] };

		if (details.courses) {
			let courses: CourseWithPrerequisites[] = [];
			for (const courseId of details.courses) {
				const course = CoursesDB.find((c) => c.id === parseInt(courseId));
				if (!course) {
					continue;
				}
				const CoursePrerequisites: Course[] = CoursePrerequisitesDB.filter(
					(c) => c.courseId === course.id
				);
				courses.push({ ...course, prerequisites: CoursePrerequisites });
			}
			const index = studentData.requirements.findIndex((req) => req.id === requirement.id);
			if (index !== -1 && index !== undefined) {
				studentData.requirements[index]!.details = [...courses];
			}
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
					courses.push({ ...course, prerequisites: [] as Course[] });
				}
			}

			for (const course of courses) {
				const CoursePrerequisites: Course[] = CoursePrerequisitesDB.filter(
					(c) => c.courseId === course.id
				);
				course.prerequisites = CoursePrerequisites;
			}
			const index = studentData.requirements.findIndex((req) => req.id === requirement.id);
			if (index !== -1 && index !== undefined) {
				studentData.requirements[index]!.details = [...courses];
			}
		}
		if (!details.area && !details.courses) {
			const courses: CourseWithPrerequisites[] = [];
			const anyCourses = CoursesDB.filter((c) =>
				(requirement.level === 4 ? [2, 3] : [requirement.level]).includes(c.level)
			);

			for (const course of anyCourses) {
				courses.push({ ...course, prerequisites: [] as Course[] });
			}

			for (const course of courses) {
				const CoursePrerequisites: Course[] = CoursePrerequisitesDB.filter(
					(c) => c.courseId === course.id
				);
				course.prerequisites = CoursePrerequisites;
			}
			const index = studentData.requirements.findIndex((req) => req.id === requirement.id);
			if (index !== -1 && index !== undefined) {
				studentData.requirements[index]!.details = [...courses];
			}
		}
	}

	const sortedRequirements = studentData.requirements.sort((a, b) => a.level - b.level);

	studentData.requirements = sortedRequirements;

	return json({
		majorId,
		minorId,
		data: studentData,
		major: major.map((m) => m.name),
		minor: minor.map((m) => m.name)
	});
};
