import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { restrict } from '$lib/utils';
import { trpcServer } from '$lib/server/server';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;

	if (!userId) {
		error(401, 'Unauthorized');
	}

	const order = restrict(event.url.searchParams.get('order'), ['asc', 'desc']) ?? 'asc';
	const pageIndex = Math.max(0, parseInt(event.url.searchParams.get('pageIndex') ?? '0', 10));
	const pageSize = Math.max(
		1,
		Math.min(100, parseInt(event.url.searchParams.get('pageSize') ?? '10', 10))
	);

	const result = await trpcServer.courses.getCourses.ssr(
		{
			order,
			page: pageIndex,
			size: pageSize
		},
		event
	);

	return {
		courses: result!.courses,
		count: result!.count
	};
};
