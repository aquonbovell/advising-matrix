import { writable, derived, type Writable, type Readable, get } from 'svelte/store';
import { isCompleted } from '$lib/utils';
import { gradePoints, type Grade, type Requirement } from '$lib/types';
import type { Course, RequirementType } from '$lib/db/schema';
import type { Selected } from 'bits-ui';
import { getToastState } from '$lib/components/toast/toast-state.svelte';
import { fetchCourses, fetchDegree } from './utils';

export class CourseManager {
	// Stores
	public courseGrades: Writable<Record<string, { requirementId: string; grade: Grade[] }>>;
	public courses: Writable<{ id: number; credits: number; code: string }[]>;
	public requiredCourses: Writable<{ id: number; credits: number }[]>;
	public dialogRequirementID = writable<string | null>(null);
	public totalCredits: Writable<number>;
	public totalCourses: Writable<number>;
	public requirements: Writable<Requirement[]>;

	constructor() {
		// Initialize stores
		this.courseGrades = writable({});
		this.courses = writable([]);
		this.requiredCourses = writable([]);
		this.totalCredits = writable(0);
		this.totalCourses = writable(0);
		this.requirements = writable([]);
	}

	// Method to add a course
	addCourse(selectedCourseId: Selected<number>, dialogRequirementID: string | null) {
		const courseGrade: Record<string, { requirementId: string; grade: Grade[] }> = {};
		console.log(selectedCourseId);

		if (!selectedCourseId) {
			return;
		}

		courseGrade[selectedCourseId.value] = {
			grade: [],
			requirementId: dialogRequirementID!
		};

		this.courseGrades.update((grades) => ({ ...grades, ...courseGrade }));

		selectedCourseId = {
			value: 0,
			label: ''
		};
		console.log(this.courseGrades.subscribe((value) => console.log(value)));
	}

	// Method to save grades
	async saveGrades(id: string) {
		const response = await fetch(`/api/student/${id}/grades`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ grades: get(this.courseGrades) })
		});

		const content = await response.json();
	}

	// Method to fetch degree data and initialize courses
	async initializeCourses(major_id: string, minor_id: string, id: string) {
		const degree = await fetchDegree(major_id, minor_id);
		const studentCourses = await fetchCourses(id);

		console.log(degree);

		const coursesDB = degree.requirements
			.flatMap((req) => req.details)
			.map((course) => ({ id: course.id, credits: course.credits, code: course.code }));

		this.courses.set(coursesDB);

		const requiredCoursesDegree = degree.requirements
			.filter((req) => req.type === 'CREDITS')
			.flatMap((req) => req.details)
			.map((course) => ({ id: course.id, credits: course.credits }));

		this.requiredCourses.update((courses) => [...courses, ...requiredCoursesDegree]);

		studentCourses.forEach((course) => {
			if (!course.courseId) return;
			const courseGrade: Record<string, { requirementId: string; grade: Grade[] }> = {};
			courseGrade[course.courseId] = {
				grade: course.grades as Grade[],
				requirementId: course.requirementId!
			};
			this.courseGrades.update((grades) => ({ ...grades, ...courseGrade }));
		});

		let totalDegreeCredits = 0;
		let totalDegreeCourses = 0;

		degree.requirements.forEach((req) => {
			this.requirements.update((requirements) => [...requirements, req]);
			totalDegreeCredits += req.credits;
			totalDegreeCourses += req.credits / 3;
		});

		this.totalCredits.set(totalDegreeCredits);
		this.totalCourses.set(totalDegreeCourses);

		console.log(this.courseGrades);
	}

	// GPA Calculation method
	calculateGPA(): Readable<number> {
		return derived([this.courseGrades, this.courses], ([$courseGrades, $courses]) => {
			let totalGradePoints = 0;
			let totalCredits = 0;

			for (const [courseId, { grade }] of Object.entries($courseGrades)) {
				if (isCompleted(grade)) {
					totalGradePoints +=
						this.getGradePoint(grade) *
						($courses.find((course) => course.id === parseInt(courseId))?.credits || 0);
					totalCredits += $courses.find((course) => course.id === parseInt(courseId))?.credits || 0;
				}
			}

			return totalCredits === 0 ? 0 : parseFloat((totalGradePoints / totalCredits).toFixed(2));
		});
	}

	getRequirementDetails(requirementId: string) {
		const requirement = get(this.requirements).find((req) => req.id === requirementId);
		if (!requirement) return [];
		if (requirement.type === 'POOL') {
			return requirement.details.filter((course) => {
				const grades = get(this.courseGrades);
				if (Object.keys(grades).includes(course.id.toString()) && grades[course.id] !== undefined) {
					return true;
					// return grades[course.id].requirementId === requirementId;
				}
			});
		} else {
			return requirement.details;
		}
	}

	getDialogCourses(requirementId: string) {
		// requirement.details.filter((course) => !$courseGrades[course.id] && !$requiredCourses
		// 										.flatMap((c) => c.id)
		// 										.includes(course.id))
		const requirement = get(this.requirements).find((req) => req.id === requirementId);
		if (!requirement) return [];
		return requirement.details.filter((course) => {
			const grades = get(this.courseGrades);
			if (
				Object.keys(grades).includes(course.id.toString()) &&
				grades[course.id.toString()] !== undefined
			) {
				return false;
			} else {
				return true;
			}
		});
	}

	// Helper method to calculate grade points
	private getGradePoint(grade: Grade[]): number {
		const gradeValue = grade[grade.length - 1];
		return gradePoints[gradeValue!];
	}
}
