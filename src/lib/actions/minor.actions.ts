import { invalidate } from '$app/navigation';
import { db } from '$lib/db';
import type { requirementDetailsType, requirementOption } from '$lib/db/schema';
import minors from '../../../minors.json';

type requirement = {
	id: string;
	option: requirementOption;
	details: string[];
	detailsType: requirementDetailsType;
	credits: number;
	level: number[];
};

export async function initMinors() {
	await db.deleteFrom('MinorRequirements').execute();
	await db.deleteFrom('Minors').execute();

	for (const minor of minors) {
		const minorId = await db
			.insertInto('Minors')
			.values({
				id: crypto.randomUUID(),
				name: minor.name
			})
			.returning('id')
			.executeTakeFirst();
		if (minorId) {
			const minorRequirements = minor.requirements;
			for (const requirement of minorRequirements) {
				await db
					.insertInto('MinorRequirements')
					.values({
						id: crypto.randomUUID(),
						minorId: minorId.id,
						detailsType: requirement.detailsType.toUpperCase() as requirementDetailsType,
						level: JSON.stringify(requirement.level),
						credits: requirement.credits,
						details: JSON.stringify(requirement.details || []),
						option: requirement.option.toUpperCase() as requirementOption
					})
					.execute();
			}
		}
	}
}

export async function createMinor(name: string, requirements: requirement[]) {
	try {
		const id = await db.transaction().execute(async (db) => {
			// Create minor
			const minor = await db
				.insertInto('Minors')
				.values({
					id: crypto.randomUUID(),
					name: name
				})
				.returning('id')
				.executeTakeFirst();

			// If minor was not created, throw error
			if (!minor) {
				throw new Error('Failed to create minor');
			}

			// If minor was created, create requirements
			for (const requirement of requirements) {
				await db
					.insertInto('MinorRequirements')
					.values({
						id: crypto.randomUUID(),
						minorId: minor.id,
						option: requirement.option as requirementOption,
						credits: requirement.credits,
						details: JSON.stringify(requirement.details),
						detailsType: requirement.detailsType as requirementDetailsType,
						level: JSON.stringify(requirement.level)
					})
					.execute();
			}
			return minor.id;
		});
		// return minor id
		return { id };
	} catch (error) {
		console.error('Failed to create minor: ', error);
		throw error;
	}
}

export async function updateMinor(id: string, name: string, requirements: requirement[]) {
	try {
		await db.transaction().execute(async (db) => {
			// Check if minor exists
			const minor = await db
				.selectFrom('Minors')
				.where('id', '=', id)
				.select('id')
				.executeTakeFirst();

			// If minor does not exist, throw error
			if (!minor) {
				throw new Error('Minor not found');
			}

			// Update minor name
			await db
				.updateTable('Minors')
				.set({
					name: name
				})
				.where('id', '=', minor.id)
				.execute();

			// Delete existing requirements
			await db.deleteFrom('MinorRequirements').where('minorId', '=', minor.id).execute();

			// Create new requirements
			for (const requirement of requirements) {
				const requirementId = await db
					.insertInto('MinorRequirements')
					.values({
						id: crypto.randomUUID(),
						minorId: minor.id,
						option: requirement.option as requirementOption,
						credits: requirement.credits,
						details: JSON.stringify(requirement.details),
						detailsType: requirement.detailsType as requirementDetailsType,
						level: JSON.stringify(requirement.level)
					})
					.returning('id')
					.executeTakeFirst();
				// If requirement was not created, throw error
				if (!requirementId) {
					throw new Error('Failed to create new requirement for minor');
				}
			}
		});
	} catch (error) {
		console.error('Failed to update minor: ', error);
		throw error;
	}
}

export async function fetchMinors() {
	const data = [];

	// Get all minors
	const minors = await db.selectFrom('Minors').select(['id', 'name']).execute();

	// Get all requirements for each minor
	for (const minor of minors) {
		const minorRequirements = await db
			.selectFrom('MinorRequirements')
			.where('minorId', '=', minor.id)
			.select(['id', 'option', 'details', 'detailsType', 'credits', 'level'])
			.execute();

		// Create DTO for minor
		const minorDTO = {
			...minor,
			requirements: minorRequirements.map((requirement) => {
				return {
					...requirement,
					details: JSON.parse(requirement.details) as string[],
					level: JSON.parse(requirement.level) as number[]
				};
			})
		};
		data.push(minorDTO);
	}
	return data;
}
export async function fetchPaginatedMinors(
	page: number = 0,
	size: number = 10,
	search: string = '',
	orderBy: 'asc' | 'desc' = 'asc'
) {
	// Get paginated minors
	let query = db
		.selectFrom('Minors')
		.select(['id', 'name'])
		.offset(page * size)
		.limit(size)
		.orderBy('name', orderBy);

	// If search is provided, filter by name
	if (search) {
		query = query.where('name', 'ilike', `%${search}%`);
	}

	const minors = await query.execute();

	return minors;
}

export async function fetchMinorsCount() {
	// Get total number of minors
	const minors = await db
		.selectFrom('Minors')
		.select(db.fn.countAll<number>().as('count'))
		.executeTakeFirst();
	return minors;
}

export async function fetchMinor(id: string) {
	// Get minor
	const minor = await db
		.selectFrom('Minors')
		.select(['id', 'name'])
		.where('id', '=', id)
		.executeTakeFirst();

	// If minor does not exist, throw error
	if (!minor) {
		throw new Error('Minor not found');
	}

	// Get all requirements for minor
	const minorRequirements = await db
		.selectFrom('MinorRequirements')
		.where('minorId', '=', minor.id)
		.select(['id', 'option', 'details', 'detailsType', 'credits', 'level'])
		.execute();

	// Create DTO for minor
	const minorDTO = {
		...minor,
		requirements: minorRequirements.map((requirement) => {
			return {
				...requirement,
				details: JSON.parse(requirement.details) as string[],
				level: JSON.parse(requirement.level) as number[]
			};
		})
	};
	return minorDTO;
}

export async function deleteMinor(id: string) {
	try {
		// Check if minor exists
		const minor = await db
			.selectFrom('Minors')
			.where('id', '=', id)
			.select('id')
			.executeTakeFirst();

		// If minor does not exist, throw error
		if (!minor) {
			throw new Error('Minor not found');
		}

		// Delete minor and requirements
		await db.transaction().execute(async (db) => {
			await db.deleteFrom('MinorRequirements').where('minorId', '=', minor.id).execute();
			await db.deleteFrom('Minors').where('id', '=', minor.id).execute();
		});
		invalidate('/admin/minors');
	} catch (error) {
		console.error('Failed to delete minor:', error);
		throw error;
	}
}
