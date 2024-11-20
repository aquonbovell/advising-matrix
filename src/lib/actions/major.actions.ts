import { generateId } from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { MajorDetails, requirementOption, requirementType } from '$lib/types';

export const fetchMajors = async () => {
	return db.selectFrom('Majors').select(['name', 'id']).execute();
};

export const createMajor = async (major: Omit<MajorDetails, 'id'>) => {
	try {
		const majorId = await db
			.insertInto('Majors')
			.values({
				id: generateId(),
				name: major.name
			})
			.returning('id')
			.executeTakeFirstOrThrow();

		for (const requirement of major.requirements) {
			await db
				.insertInto('MajorRequirement')
				.values({
					id: generateId(),
					majorId: majorId.id,
					option: requirement.option as requirementOption,
					details: requirement.details.join(','),
					type: requirement.type as requirementType,
					credits: requirement.credits,
					level: requirement.level.join(',')
				})
				.execute();
		}
		return majorId.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const updateMajor = async (major: MajorDetails) => {
	try {
		const majorId = await db
			.updateTable('Majors')
			.set({
				name: major.name
			})
			.where('id', '=', major.id)
			.returning('id')
			.executeTakeFirstOrThrow();

		await db.deleteFrom('MajorRequirement').where('majorId', '=', majorId.id).execute();

		for (const requirement of major.requirements) {
			await db
				.insertInto('MajorRequirement')
				.values({
					id: generateId(),
					majorId: majorId.id,
					option: requirement.option as requirementOption,
					details: requirement.details.join(','),
					type: requirement.type as requirementType,
					credits: requirement.credits,
					level: requirement.level.join(',')
				})
				.execute();
		}
		return majorId.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const fetchMajor = async (majorId: string) => {
	try {
		const major = await db
			.selectFrom('Majors')
			.where('id', '=', majorId)
			.select(['id', 'name'])
			.executeTakeFirstOrThrow();

		const requirements = await db
			.selectFrom('MajorRequirement')
			.where('majorId', '=', majorId)
			.select(['id', 'option', 'details', 'type', 'credits', 'level'])
			.execute();

		console.log(requirements);

		return {
			...major,
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

export const fetchMajorDetails = async (majorId: string) => {
	try {
		const major = await db.selectFrom('Majors').where('id', '=', majorId).executeTakeFirstOrThrow();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteMajor = async (majorId: string) => {
	return db.deleteFrom('Majors').where('id', '=', majorId).execute();
};
