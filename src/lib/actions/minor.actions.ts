import { generateId } from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { MinorDetails, requirementOption, requirementType } from '$lib/types';

export const fetchMinors = async () => {
	return db.selectFrom('Minors').select(['name', 'id']).execute();
};

export const createMinor = async (minor: Omit<MinorDetails, 'id'>) => {
	try {
		const minorId = await db
			.insertInto('Minors')
			.values({
				id: generateId(),
				name: minor.name
			})
			.returning('id')
			.executeTakeFirstOrThrow();

		for (const requirement of minor.requirements) {
			await db
				.insertInto('MinorRequirement')
				.values({
					id: generateId(),
					minorId: minorId.id,
					option: requirement.option as requirementOption,
					details: requirement.details.join(','),
					type: requirement.type as requirementType,
					credits: requirement.credits,
					level: requirement.level.join(',')
				})
				.execute();
		}
		return minorId.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const updateMinor = async (minor: MinorDetails) => {
	try {
		const minorId = await db
			.updateTable('Minors')
			.set({
				name: minor.name
			})
			.where('id', '=', minor.id)
			.returning('id')
			.executeTakeFirstOrThrow();

		await db.deleteFrom('MinorRequirement').where('minorId', '=', minorId.id).execute();

		for (const requirement of minor.requirements) {
			await db
				.insertInto('MinorRequirement')
				.values({
					id: generateId(),
					minorId: minorId.id,
					option: requirement.option as requirementOption,
					details: requirement.details.join(','),
					type: requirement.type as requirementType,
					credits: requirement.credits,
					level: requirement.level.join(',')
				})
				.execute();
		}
		return minorId.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const fetchMinor = async (minorId: string) => {
	try {
		const minor = await db
			.selectFrom('Minors')
			.where('id', '=', minorId)
			.select(['id', 'name'])
			.executeTakeFirstOrThrow();

		const requirements = await db
			.selectFrom('MinorRequirement')
			.where('minorId', '=', minorId)
			.select(['id', 'option', 'details', 'type', 'credits', 'level'])
			.execute();

		console.log(requirements);

		return {
			...minor,
			requirements: requirements.map((requirement) => ({
				...requirement,
				level: requirement.level.split(',').map((level) => parseInt(level)),
				details: requirement.details.split(',')
			}))
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const fetchMinorDetails = async (minorId: string) => {
	try {
		const minor = await db.selectFrom('Minors').where('id', '=', minorId).executeTakeFirstOrThrow();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteMinor = async (minorId: string) => {
	return db.deleteFrom('Minors').where('id', '=', minorId).execute();
};
