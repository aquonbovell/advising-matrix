import { db } from '$lib/db';
import type { Courses, LevelRestriction } from '$lib/db/schema';
import type { CoursesWithPrerequisites, Degree, requirement, restriction } from '$lib/types';
import { getName, isValidUUID } from '$lib/utils';

export async function fetchDegree(majorId: string, minorId: string) {
	if (!isValidUUID(majorId)) {
		throw new Error('Invalid majorId');
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
			'MajorRequirements.credits',
			'MajorRequirements.level',
			'MajorRequirements.details',
			'MajorRequirements.detailsType',
			'MajorRequirements.option',
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
			'MinorRequirements.credits',
			'MinorRequirements.level',
			'MinorRequirements.details',
			'MinorRequirements.detailsType',
			'MinorRequirements.option',
			'MinorRequirements.minorId'
		])
		.execute();

	let studentData: Degree = {
		id: program.join('x'),
		requirements: [],
		name: getName(major, minor)
	};

	studentData.requirements = [...major, ...minor].map((requirement) => {
		const mappedRequirement = {
			...requirement,
			details: JSON.parse(requirement.details) as string[],
			courses: [],
			level: JSON.parse(requirement.level) as number[]
		} as requirement;
		return mappedRequirement;
	});

	const levelOneRequirements = studentData.requirements.filter(
		(requirement) =>
			requirement.level.includes(1) &&
			requirement.details.length > 0 &&
			requirement.option === 'REQUIRED'
	);

	let levelOneCredits = levelOneRequirements.reduce((acc, requirement) => {
		return acc + requirement.credits;
	}, 0);

	if (levelOneCredits >= 12) {
		const requirementPool = studentData.requirements.filter(
			(requirement) =>
				requirement.level.includes(1) &&
				requirement.details.length === 0 &&
				requirement.option === 'OPTIONAL'
		);
		const requirementPoolIds = requirementPool.map((requirement) => requirement.id);
		studentData.requirements = studentData.requirements.filter(
			(requirement) => !requirementPoolIds.includes(requirement.id)
		);

		let totalCredits = 0;

		const requirementDetails: string[] = [];
		levelOneRequirements.forEach((requirement) => {
			if (requirement.detailsType === 'COURSES') {
				for (const courseId of requirement.details) {
					if (!requirementDetails.includes(courseId)) {
						requirementDetails.push(courseId);
						totalCredits += 3;
					}
				}
			}
		});

		const requirement = requirementPool.at(0);

		if (totalCredits < 24 && requirement) {
			const newRequirement = {
				id: requirement.id,
				option: 'OPTIONAL',
				detailsType: 'COURSES',
				credits: 24 - totalCredits,
				details: [],
				courses: [],
				level: [1]
			} as requirement;
			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	if (levelOneRequirements.length > 1) {
		const requirementIds = levelOneRequirements.map((requirement) => requirement.id);
		let totalCredits = 0;

		const requirementDetails: string[] = [];
		levelOneRequirements.forEach((requirement) => {
			if (requirement.detailsType === 'COURSES') {
				for (const courseId of requirement.details) {
					if (!requirementDetails.includes(courseId)) {
						requirementDetails.push(courseId);
						totalCredits += 3;
					}
				}
			}
		});

		const requirement = levelOneRequirements.at(0);

		if (requirement) {
			const newRequirement = {
				id: requirement.id,
				option: 'REQUIRED',
				detailsType: 'COURSES',
				credits: totalCredits,
				details: requirementDetails,
				level: [1]
			} as requirement;
			studentData.requirements = studentData.requirements.filter(
				(requirement) => !requirementIds.includes(requirement.id)
			);
			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	const requiredCredits = studentData.requirements
		.filter((requirement) => {
			return requirement.details.length !== 0 && !requirement.level.includes(1);
		})
		.reduce((acc, requirement) => {
			return acc + requirement.credits;
		}, 0);

	if (requiredCredits >= 30) {
		const requirementPool = studentData.requirements.filter(
			(requirement) =>
				!requirement.level.includes(1) &&
				requirement.details.length === 0 &&
				requirement.option === 'OPTIONAL'
		);
		const requirementPoolIds = requirementPool.map((requirement) => requirement.id);
		studentData.requirements = studentData.requirements.filter(
			(requirement) => !requirementPoolIds.includes(requirement.id)
		);
		const requirement = requirementPool.at(0);
		if (60 - requiredCredits > 0 && requirement) {
			const newRequirement = {
				id: requirement.id,
				option: 'OPTIONAL',
				detailsType: 'COURSES',
				courses: [],
				credits: 60 - requiredCredits,
				details: [],
				level: [2, 3]
			} as requirement;

			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	const Courses = await db
		.selectFrom('Courses')
		.select([
			'Courses.id',
			'Courses.code',
			'Courses.name',
			'Courses.level',
			'Courses.credits',
			'Courses.prerequisiteAmount',
			'Courses.prerequisiteType',
			'Courses.departmentId',
			'Courses.comment'
		])
		.execute();

	const restrictions = await db.selectFrom('LevelRestriction').selectAll().execute();

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
		if (requirement.detailsType === 'COURSES') {
			let courses: CoursesWithPrerequisites[] = [];
			if (requirement.details.length === 0) {
				for (const course of Courses.filter((course) => requirement.level.includes(course.level))) {
					const prerequisites: Courses[] = Prerequisites.filter(
						(prerequisite) => prerequisite.courseId === course.id
					);
					const levelRestrictions: LevelRestriction[] = restrictions.filter(
						(restriction) => restriction.courseId === course.id
					);
					courses.push({
						...course,
						prerequisites: prerequisites,
						levelRestriction: levelRestrictions.map((restriction) => {
							return {
								...restriction,
								level: restriction.level.split(','),
								area: restriction.area.split(',')
							};
						})
					});
				}
			} else {
				for (const courseId of requirement.details) {
					const course = Courses.find((course) => course.id === courseId);
					if (!course) {
						continue;
					}
					const prerequisites: Courses[] = Prerequisites.filter(
						(prerequisite) => prerequisite.courseId === course.id
					);
					const levelRestrictions: LevelRestriction[] = restrictions.filter(
						(restriction) => restriction.courseId === course.id
					);
					courses.push({
						...course,
						prerequisites: prerequisites,
						levelRestriction: levelRestrictions.map((restriction) => {
							return {
								...restriction,
								level: restriction.level.split(','),
								area: restriction.area.split(',')
							};
						})
					});
				}
			}
			const index = studentData.requirements.findIndex(
				(studentRequirement) => studentRequirement.id === requirement.id
			);

			if (index >= 0 && studentData.requirements[index]) {
				studentData.requirements[index].courses = [...courses];
			}
		}
		if (requirement.detailsType === 'AREAS') {
			const courses: CoursesWithPrerequisites[] = [];
			for (const area of requirement.details) {
				const areaCourses = Courses.filter(
					(course) => requirement.level.includes(course.level) && course.code.startsWith(area)
				);
				for (const course of areaCourses) {
					courses.push({
						...course,
						prerequisites: [] as Courses[],
						levelRestriction: [] as restriction[]
					});
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

			if (index && studentData.requirements[index]) {
				studentData.requirements[index].courses = [...courses];
			}
		}
		if (requirement.detailsType === 'FACULTIES') {
			const courses: CoursesWithPrerequisites[] = [];
			const anyCourses = Courses.filter((course) => requirement.level.includes(course.level));

			for (const course of anyCourses) {
				courses.push({
					...course,
					prerequisites: [] as Courses[],
					levelRestriction: [] as restriction[]
				});
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

			if (index && studentData.requirements[index]) {
				studentData.requirements[index].courses = [...courses];
			}
		}
	}

	const sortedRequirements = studentData.requirements.sort(
		(a, b) =>
			a.level.reduce((accumulator, currentValue) => accumulator + currentValue, 0) -
			b.level.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
	);

	studentData.requirements = sortedRequirements;

	return { ...studentData };
}
