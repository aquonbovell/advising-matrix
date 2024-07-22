import type { RequirementGroup } from '$lib/types';

const requirements: RequirementGroup[] = [
	{
		type: 'CREDITS',
		credits: 15,
		courses: ['150', '9508', '197', '12804', '154']
	},
	{
		type: 'POOL',
		credits: 9,
		levelPool: ['I'],
		facultyPool: 'any'
	},
	{
		type: 'CREDITS',
		credits: 15,
		courses: ['13653', '11926', '657', '703', '8431']
	},
	{
		type: 'CREDITS',
		credits: 9,
		courses: ['12803', '12802', '12801']
	},
	{
		type: 'POOL',
		credits: 6,
		levelPool: ['II', 'III'],
		facultyPool: 'any'
	},
	{
		type: 'POOL',
		credits: 30,
		levelPool: ['II', 'III'],
		facultyPool: 'any'
	},
	{
		type: 'CREDITS',
		credits: 15,
		courses: ['657', '703', '449', '488', '8431']
	},
	{
		type: 'CREDITS',
		credits: 9,
		courses: ['12801', '12794', '12792']
	}
];

type DegreePath = RequirementGroup[];

function buildDegreePath(indices: number[]): DegreePath {
	return indices
		.filter((index) => index >= 0 && index < requirements.length)
		.map((index) => requirements[index]) as DegreePath;
}

export const computerScienceDegreePath: DegreePath = buildDegreePath([0, 1, 2, 3, 4, 5]);

export const informationTechnologyDegreePath: DegreePath = buildDegreePath([0, 1, 7, 8, 5, 6]);
