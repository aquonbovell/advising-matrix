import { db } from '$lib/db';
import type { Courses, RequirementType } from '$lib/db/schema';
import type { CoursesWithPrerequisites, Degree, Requirement } from '$lib/types';
import { getName, isValidUUID } from '$lib/utils';

export async function fetchDegree(majorId: string, minorId: string) {
	if (!isValidUUID(majorId)) {
		throw new Error('Invalid majorId');
	}

	if (!isValidUUID(minorId)) {
		throw new Error('Invalid minorId');
	}

	const program = [majorId, minorId];

	const major = await db
		.selectFrom('Majors')
		.innerJoin('MajorRequirements', 'Majors.id', 'MajorRequirements.majorId')
		.where('Majors.id', 'in', program)
		.select([
			'Majors.id',
			'Majors.name',
			'MajorRequirements.id',
			'MajorRequirements.type',
			'MajorRequirements.credits',
			'MajorRequirements.details',
			'MajorRequirements.level',
			'MajorRequirements.majorId'
		])
		.execute();
	const minor = await db
		.selectFrom('Minors')
		.innerJoin('MinorRequirements', 'Minors.id', 'MinorRequirements.minorId')
		.where('Minors.id', 'in', program)
		.select([
			'Minors.id',
			'Minors.name',
			'MinorRequirements.id',
			'MinorRequirements.type',
			'MinorRequirements.credits',
			'MinorRequirements.details',
			'MinorRequirements.level',
			'MinorRequirements.minorId'
		])
		.execute();

	let studentData: Degree = {
		id: program.join('x'),
		requirements: [],
		name: getName(major, minor)
	};

	studentData.requirements = [...major, ...minor].map(
		(requirement: {
			id: string;
			type: RequirementType;
			credits: number;
			details: unknown;
			level: number;
		}) => {
			const mappedRequirement = {
				degreeId: studentData.id,
				id: requirement.id,
				type: requirement.type,
				credits: requirement.credits,
				info: requirement.details,
				level: requirement.level
			} as Requirement;
			return mappedRequirement;
		}
	);

	const levelOneRequirements = studentData.requirements.filter(
		(requirement) =>
			requirement.level === 1 &&
			Object.keys(requirement.info).length > 0 &&
			requirement.type === 'CREDITS'
	);

	let levelOneCredits = levelOneRequirements.reduce((acc, requirement) => {
		return acc + requirement.credits;
	}, 0);

	if (levelOneCredits >= 12) {
		const requirementPool = studentData.requirements.filter(
			(requirement) =>
				requirement.level === 1 &&
				requirement.type === 'POOL' &&
				Object.keys(requirement.info).length === 0
		);
		const requirementPoolIds = requirementPool.map((requirement) => requirement.id);
		studentData.requirements = studentData.requirements.filter(
			(requirement) => !requirementPoolIds.includes(requirement.id)
		);

		let totalCredits = 0;

		const requirementDetails: string[] = [];
		levelOneRequirements.forEach((requirement) => {
			const info = requirement.info as { courses?: string[]; area?: string[] };
			if (info.courses) {
				for (const courseId of info.courses) {
					if (!requirementDetails.includes(courseId)) {
						requirementDetails.push(courseId);
						totalCredits += 3;
					}
				}
			}
		});

		if (totalCredits < 24) {
			const newRequirement = {
				degreeId: studentData.id,
				id: requirementPool.at(0)!.id,
				type: 'POOL',
				credits: 24 - totalCredits,
				info: {},
				level: 1
			} as Requirement;
			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	if (levelOneRequirements.length > 1) {
		const requirementIds = levelOneRequirements.map((requirement) => requirement.id);
		let totalCredits = 0;
		// console.log('Enter the level one requirements credits');
		// console.log(levelOneRequirements);

		const requirementDetails: string[] = [];
		levelOneRequirements.forEach((requirement) => {
			const info = requirement.info as { courses?: string[]; area?: string[] };
			if (info.courses) {
				for (const courseId of info.courses) {
					if (!requirementDetails.includes(courseId)) {
						requirementDetails.push(courseId);
						totalCredits += 3;
					}
				}
			}
		});

		const newRequirement = {
			degreeId: studentData.id,
			id: levelOneRequirements.at(0)!.id,
			type: 'CREDITS',
			credits: totalCredits,
			info: { courses: requirementDetails },
			level: 1
		} as Requirement;
		studentData.requirements = studentData.requirements.filter(
			(requirement) => !requirementIds.includes(requirement.id)
		);
		studentData.requirements = [newRequirement, ...studentData.requirements];
	}

	const requiredCredits = studentData.requirements
		.filter((requirement) => {
			return Object.entries(requirement.info).length !== 0 && requirement.level !== 1;
		})
		.reduce((acc, requirement) => {
			return acc + requirement.credits;
		}, 0);

	if (requiredCredits >= 30) {
		const requirementPool = studentData.requirements.filter(
			(requirement) =>
				requirement.level !== 1 &&
				requirement.type === 'POOL' &&
				Object.keys(requirement.info).length === 0
		);
		const requirementPoolIds = requirementPool.map((requirement) => requirement.id);
		studentData.requirements = studentData.requirements.filter(
			(requirement) => !requirementPoolIds.includes(requirement.id)
		);
		if (60 - requiredCredits > 0) {
			const newRequirement = {
				degreeId: studentData.id,
				id: requirementPool.at(0)!.id,
				type: 'POOL',
				credits: 60 - requiredCredits,
				info: {},
				level: 4
			} as Requirement;

			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	const Courses = await db.selectFrom('Courses').selectAll().execute();

	const Prerequisites = await db
		.selectFrom('Prerequisites')
		.innerJoin('Courses', 'Courses.id', 'Prerequisites.prerequisiteId')
		.select([
			'Courses.id',
			'Courses.code',
			'Courses.name',
			'Courses.level',
			'Courses.credits',
			'Courses.prerequisiteAmount',
			'Courses.prerequisiteType',
			'Courses.comment',
			'Courses.departmentId',
			'Prerequisites.courseId'
		])
		.execute();

	// GET the level one credits

	for (const requirement of studentData.requirements) {
		const details = requirement.info as { courses?: string[]; area?: string[] };

		if (details.courses) {
			let courses: CoursesWithPrerequisites[] = [];
			for (const courseId of details.courses) {
				const course = Courses.find((course) => course.id === courseId);
				if (!course) {
					continue;
				}
				const prerequisites: Courses[] = Prerequisites.filter(
					(prerequisite) => prerequisite.courseId === course.id
				);
				courses.push({ ...course, prerequisites: prerequisites });
			}
			const index = studentData.requirements.findIndex(
				(studentRequirement) => studentRequirement.id === requirement.id
			);
			if (index !== -1 && index !== undefined) {
				studentData.requirements[index]!.details = [...courses];
			}
		}
		if (details.area) {
			const courses: CoursesWithPrerequisites[] = [];
			for (const area of details.area) {
				const areaCourses = Courses.filter(
					(course) =>
						(requirement.level === 4 ? [2, 3] : [requirement.level]).includes(course.level) &&
						course.code.startsWith(area)
				);
				for (const course of areaCourses) {
					courses.push({ ...course, prerequisites: [] as Courses[] });
				}
			}

			for (const course of courses) {
				const CoursePrerequisites: Courses[] = Prerequisites.filter(
					(prerequisite) => prerequisite.courseId === course.id
				);
				course.prerequisites = CoursePrerequisites;
			}
			const index = studentData.requirements.findIndex(
				(studentRequirement) => studentRequirement.id === requirement.id
			);
			if (index !== -1 && index !== undefined) {
				studentData.requirements[index]!.details = [...courses];
			}
		}
		if (!details.area && !details.courses) {
			const courses: CoursesWithPrerequisites[] = [];
			const anyCourses = Courses.filter((course) =>
				(requirement.level === 4 ? [2, 3] : [requirement.level]).includes(course.level)
			);

			for (const course of anyCourses) {
				courses.push({ ...course, prerequisites: [] as Courses[] });
			}

			for (const course of courses) {
				const CoursePrerequisites: Courses[] = Prerequisites.filter(
					(prerequisite) => prerequisite.courseId === course.id
				);
				course.prerequisites = CoursePrerequisites;
			}
			const index = studentData.requirements.findIndex(
				(studentRequirement) => studentRequirement.id === requirement.id
			);
			if (index !== -1 && index !== undefined) {
				studentData.requirements[index]!.details = [...courses];
			}
		}
	}

	const sortedRequirements = studentData.requirements.sort((a, b) => a.level - b.level);

	studentData.requirements = sortedRequirements;

	return {
		data: studentData
	};
}
