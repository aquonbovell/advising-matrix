import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
	const { id } = params;
	if (!id) {
		return {
			status: 404,
			redirect: '/error'
		};
	}
	const response = await fetch(`/api/student/${id}/details`);
	const data = await response.json();
	return { props: { id }, student: data };
}) satisfies PageLoad;
