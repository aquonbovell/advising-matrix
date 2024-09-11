import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import type { Degree, Grade } from '$lib/types';
import { isCompleted } from '$lib/utils';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const { id } = params;
	const student = await db
		.selectFrom('StudentT')
		.where('id', '=', id)
		.select(['major_id', 'minor_id'])
		.executeTakeFirst();
	if (!student) return json({ error: 'Student not found' }, { status: 404 });
	console.log(student);

	const degreeResponse = await fetch(`/api/degree/${student.major_id}x${student.minor_id}`);

	const degree: Degree = await degreeResponse.json();

	const response = await fetch(`/api/student/${id}/grades`);

	const grades: {
		status: number;
		grades: Record<string, { id: string; grade: Grade[] }>;
	} = await response.json();

	let overview: Record<
		string,
		{
			total: number;
			completed: number;
		}
	> = {};

	if (grades.status === 200) {
		const levelOne = degree.requirements.filter((req) => req.level === 1);

		const totalOne = degree.requirements
			.filter((req) => req.level === 1)
			.reduce((acc, req) => {
				return acc + req.credits;
			}, 0);

		const levelOneCourses = levelOne.map((req) => req.details).flat();

		const levelOneCourseIds: {
			id: number;
			credits: number;
		}[] = [];
		levelOneCourses.forEach((course) => {
			if (!levelOneCourseIds.find((c) => c.id === course.id)) {
				levelOneCourseIds.push({ id: course.id, credits: course.credits });
			}
		});

		console.log(levelOneCourseIds);

		const studentCoursesOne = levelOneCourseIds.reduce((acc, course) => {
			const studentCourse = grades.grades[course.id];
			if (!studentCourse) return acc;
			if (isCompleted(studentCourse.grade)) {
				console.log(course);

				return acc + course.credits;
			}
			return acc;
		}, 0);

		overview.levelOne = {
			total: totalOne,
			completed: studentCoursesOne
		};

		const levelTwo = degree.requirements.filter((req) => req.level === 2);

		const totalTwo = degree.requirements
			.filter((req) => req.level === 2)
			.reduce((acc, req) => {
				return acc + req.credits;
			}, 0);

		const levelTwoCourses = levelTwo.map((req) => req.details).flat();

		const levelTwoCourseIds: {
			id: number;
			credits: number;
		}[] = [];
		levelTwoCourses.forEach((course) => {
			if (!levelTwoCourseIds.find((c) => c.id === course.id)) {
				levelTwoCourseIds.push({ id: course.id, credits: course.credits });
			}
		});

		console.log(levelTwoCourseIds);

		const studentCoursesTwo = levelTwoCourseIds.reduce((acc, course) => {
			const studentCourse = grades.grades[course.id];
			if (!studentCourse) return acc;
			if (isCompleted(studentCourse.grade)) {
				console.log(course);

				return acc + course.credits;
			}
			return acc;
		}, 0);

		overview.levelTwo = {
			total: totalTwo,
			completed: studentCoursesTwo
		};

		const levelThree = degree.requirements.filter((req) => req.level === 3);

		const totalThree = degree.requirements
			.filter((req) => req.level === 3)
			.reduce((acc, req) => {
				return acc + req.credits;
			}, 0);

		const levelThreeCourses = levelThree.map((req) => req.details).flat();

		const levelThreeCourseIds: {
			id: number;
			credits: number;
		}[] = [];
		levelThreeCourses.forEach((course) => {
			if (!levelThreeCourseIds.find((c) => c.id === course.id)) {
				levelThreeCourseIds.push({ id: course.id, credits: course.credits });
			}
		});

		console.log(levelThreeCourseIds);

		const studentCoursesThree = levelThreeCourseIds.reduce((acc, course) => {
			const studentCourse = grades.grades[course.id];
			if (!studentCourse) return acc;
			if (isCompleted(studentCourse.grade)) {
				console.log(course);

				return acc + course.credits;
			}
			return acc;
		}, 0);

		overview.levelThree = {
			total: totalThree,
			completed: studentCoursesThree
		};

		const levelFour = degree.requirements.filter((req) => req.level === 4);

		const totalFour = degree.requirements
			.filter((req) => req.level === 4)
			.reduce((acc, req) => {
				return acc + req.credits;
			}, 0);

		const levelFourCourses = levelFour.map((req) => req.details).flat();

		const levelFourCourseIds: {
			id: number;
			credits: number;
		}[] = [];
		levelFourCourses.forEach((course) => {
			if (!levelFourCourseIds.find((c) => c.id === course.id)) {
				levelFourCourseIds.push({ id: course.id, credits: course.credits });
			}
		});

		console.log(levelFourCourseIds);

		const studentCoursesFour = levelFourCourseIds.reduce((acc, course) => {
			const studentCourse = grades.grades[course.id];
			if (!studentCourse) return acc;
			if (isCompleted(studentCourse.grade)) {
				console.log(course);

				return acc + course.credits;
			}
			return acc;
		}, 0);

		overview.levelFour = {
			total: totalFour,
			completed: studentCoursesFour
		};
	}

	return json({ id: params.id, overview });
};
