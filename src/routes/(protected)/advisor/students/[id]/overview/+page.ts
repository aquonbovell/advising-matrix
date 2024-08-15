import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const { id } = params;
	if (!id) {
		return {
			status: 404,
			redirect: '/error'
		};
	}
	return { props: { id } };
}) satisfies PageLoad;
