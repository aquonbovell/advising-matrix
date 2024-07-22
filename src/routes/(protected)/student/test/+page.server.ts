import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { computerScienceDegreePath, informationTechnologyDegreePath } from '$lib/data/degreePaths';

export const load: PageServerLoad = async ({ url }) => {
	const major = url.searchParams.get('major') || 'cs';

	const degreePath = major === 'cs' ? computerScienceDegreePath : informationTechnologyDegreePath;

	const courseIds = degreePath.flatMap((req) => (req.type === 'CREDITS' ? req.courses : []));

	const courses = await db
		.selectFrom('Course')
		.select(['id', 'code', 'name', 'level'])
		.where('id', 'in', courseIds)
		.execute();

	const groupedRequirements = degreePath.reduce(
		(acc, req) => {
			const level =
				req.type === 'CREDITS'
					? `Level ${courses.find((c) => c.id === req.courses[0])?.level || 'Unknown'}`
					: `Level ${req.levelPool.join('/')}`;
			if (!acc[level]) acc[level] = [];
			acc[level].push(req);
			return acc;
		},
		{} as Record<string, typeof degreePath>
	);

	return {
		major,
		groupedRequirements,
		courses
	};
};
