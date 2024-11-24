import { db } from '$lib/server/db';
import type { LevelRestriction } from '$lib/server/db/schema';
import type {
	CourseRequirementDetails,
	Program,
	Requirement,
	requirementOption,
	requirementType
} from '$lib/types';
import { getName } from '$lib/utils';

export async function fetchDegree(studentId: string): Promise<Program> {
	const student = await db
		.selectFrom('Student')
		.innerJoin('User', 'Student.userId', 'User.id')
		.where('Student.id', '=', studentId)
		.select(['majorId', 'minorId', 'name'])
		.executeTakeFirstOrThrow();

	const major = await db
		.selectFrom('Majors')
		.innerJoin('MajorRequirement', 'Majors.id', 'MajorRequirement.majorId')
		.where('Majors.id', 'in', [student.majorId, student.minorId])
		.select([
			'Majors.name',
			'MajorRequirement.id',
			'MajorRequirement.credits',
			'MajorRequirement.level',
			'MajorRequirement.type',
			'MajorRequirement.details',
			'MajorRequirement.option'
		])
		.execute();

	const minor = await db
		.selectFrom('Minors')
		.innerJoin('MinorRequirement', 'Minors.id', 'MinorRequirement.minorId')
		.where('Minors.id', 'in', [student.majorId, student.minorId])
		.select([
			'Minors.name',
			'MinorRequirement.id',
			'MinorRequirement.credits',
			'MinorRequirement.level',
			'MinorRequirement.type',
			'MinorRequirement.details',
			'MinorRequirement.option'
		])
		.execute();

	let studentData: Program = {
		id: [student.majorId, student.minorId].join('x'),
		requirements: [],
		name: getName(major, minor),
		studentName: student.name
	};

	studentData.requirements = [...major, ...minor].map((requirement) => {
		const mappedRequirement = {
			id: requirement.id,
			credits: requirement.credits,
			type: requirement.type as requirementType,
			option: requirement.option as requirementOption,
			details: requirement.details.split(',') as string[],
			courses: [],
			level: requirement.level.split(',').map((level) => parseInt(level))
		} as Requirement;
		return mappedRequirement;
	});

	const levelOneRequirements = studentData.requirements.filter(
		(requirement) =>
			requirement.level.includes(1) &&
			requirement.details.length > 0 &&
			requirement.option === 'ALL'
	);

	let levelOneCredits = levelOneRequirements.reduce((acc, requirement) => {
		return acc + requirement.credits;
	}, 0);

	if (levelOneCredits >= 12) {
		const requirementPool = studentData.requirements.filter(
			(requirement) =>
				requirement.level.includes(1) &&
				requirement.details.length === 0 &&
				requirement.option === 'AT MOST'
		);

		const requirementPoolIds = requirementPool.map((requirement) => requirement.id);
		studentData.requirements = studentData.requirements.filter(
			(requirement) => !requirementPoolIds.includes(requirement.id)
		);

		let totalCredits = 0;

		const requirementDetails: string[] = [];
		levelOneRequirements.forEach((requirement) => {
			if (requirement.type === 'COURSES') {
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
				option: 'AT MOST',
				type: 'COURSES',
				credits: 24 - totalCredits,
				details: [],
				courses: [],
				level: [1]
			} as Requirement;
			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	if (levelOneRequirements.length > 1) {
		const requirementIds = levelOneRequirements.map((requirement) => requirement.id);
		let totalCredits = 0;

		const requirementDetails: string[] = [];
		levelOneRequirements.forEach((requirement) => {
			if (requirement.type === 'COURSES') {
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
				option: 'ALL',
				type: 'COURSES',
				credits: totalCredits,
				details: requirementDetails,
				level: [1]
			} as Requirement;
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
				requirement.option === 'AT MOST'
		);
		const requirementPoolIds = requirementPool.map((requirement) => requirement.id);
		studentData.requirements = studentData.requirements.filter(
			(requirement) => !requirementPoolIds.includes(requirement.id)
		);
		const requirement = requirementPool.at(0);
		if (60 - requiredCredits > 0 && requirement) {
			const newRequirement = {
				id: requirement.id,
				option: 'AT MOST',
				type: 'COURSES',
				courses: [],
				credits: 60 - requiredCredits,
				details: [],
				level: [2, 3]
			} as Requirement;

			studentData.requirements = [newRequirement, ...studentData.requirements];
		}
	}

	const Courses = await db
		.selectFrom('Course')
		.select([
			'Course.id',
			'Course.code',
			'Course.name',
			'Course.level',
			'Course.credits',
			'Course.prerequisiteCount',
			'Course.prerequisiteType',
			'Course.departmentId',
			'Course.comment'
		])
		.execute();

	const restrictions = await db.selectFrom('LevelRestriction').selectAll().execute();

	const Prerequisites = await db
		.selectFrom('Prerequisites')
		.innerJoin('Course', 'Course.id', 'Prerequisites.prerequisiteId')
		.select([
			'Course.id',
			'Course.code',
			'Course.name',
			'Course.level',
			'Course.credits',
			'Prerequisites.courseId'
		])
		.execute();

	// GET the level one credits

	for (const requirement of studentData.requirements) {
		if (requirement.type === 'COURSES') {
			let courses: CourseRequirementDetails[] = [];
			if (requirement.details.length === 0) {
				for (const course of Courses.filter((course) => requirement.level.includes(course.level))) {
					const prerequisites = Prerequisites.filter(
						(prerequisite) => prerequisite.courseId === course.id
					);
					const levelRestrictions: LevelRestriction[] = restrictions.filter(
						(restriction) => restriction.courseId === course.id
					);
					courses.push({
						...course,
						prerequisites: prerequisites,
						restrictions: levelRestrictions.map((restriction) => {
							return {
								...restriction,
								level: restriction.level.split(',').map((level) => parseInt(level)),
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
					const prerequisites = Prerequisites.filter(
						(prerequisite) => prerequisite.courseId === course.id
					);
					const levelRestrictions: LevelRestriction[] = restrictions.filter(
						(restriction) => restriction.courseId === course.id
					);
					courses.push({
						...course,
						prerequisites: prerequisites,
						restrictions: levelRestrictions.map((restriction) => {
							return {
								...restriction,
								level: restriction.level.split(',').map((level) => parseInt(level)),
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
		if (requirement.type === 'DISCIPLINES') {
			const courses: CourseRequirementDetails[] = [];
			for (const area of requirement.details) {
				const areaCourses = Courses.filter(
					(course) => requirement.level.includes(course.level) && course.code.startsWith(area)
				);
				for (const course of areaCourses) {
					courses.push({
						...course,
						prerequisites: [] as {
							id: string;
							name: string;
							credits: number;
							level: number;
							code: string;
							courseId: string;
						}[],
						restrictions: [] as { id: string; level: number[]; credits: number; area: string[] }[]
					});
				}
			}

			for (const course of courses) {
				const CoursePrerequisites = Prerequisites.filter(
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
		if (requirement.type === 'FACULTIES') {
			const courses: CourseRequirementDetails[] = [];
			const anyCourses = Courses.filter((course) => requirement.level.includes(course.level));

			for (const course of anyCourses) {
				courses.push({
					...course,
					prerequisites: [] as {
						id: string;
						name: string;
						credits: number;
						level: number;
						code: string;
						courseId: string;
					}[],
					restrictions: [] as { id: string; level: number[]; credits: number; area: string[] }[]
				});
			}

			for (const course of courses) {
				const CoursePrerequisites = Prerequisites.filter(
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

export async function fetchStudentCourses(studentId: string) {
	return db
		.selectFrom('StudentCourses')
		.leftJoin('User', 'StudentCourses.userId', 'User.id')
		.where('studentId', '=', studentId)
		.select([
			'StudentCourses.id',
			'userId',
			'courseId',
			'studentId',
			'grade',
			'User.name',
			'requirementId'
		])
		.execute();
}
