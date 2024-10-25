import type { Degree } from '$lib/types';

export const fetchDegree = async (majorId: string, minorId: string | null): Promise<Degree> => {
	const res = await fetch(`/api/degree/${majorId}x${minorId}`);
	let content = await res.json();
	return content.data;
};

export const fetchCourses = async (
	id: string
): Promise<
	{
		grades: string[];
		courseId: number | null;
		credits: number;
		id: string;
		requirementId: string | null;
	}[]
> => {
	const res = await fetch(`/api/student/${id}/courses`);
	const content: {
		grades: string[];
		courseId: number | null;
		credits: number;
		id: string;
		requirementId: string | null;
	}[] = await res.json();
	return content;
};
