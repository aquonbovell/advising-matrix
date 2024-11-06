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

export async function createMinor(minorData: { name: string; requirements: requirement[] }) {
	try {
		await db.transaction().execute(async (db) => {
			const minor = await db
				.insertInto('Minors')
				.values({
					id: crypto.randomUUID(),
					name: minorData.name
				})
				.returning('id')
				.executeTakeFirst();

			if (minor) {
				for (const requirement of minorData.requirements) {
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
			}
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating minor:', error);
		return { success: false };
	}
}

export async function updateMinor(minorData: {
	id: string;
	name: string;
	requirements: requirement[];
}) {
	try {
		const result = await db.transaction().execute(async (db) => {
			const minor = await db
				.selectFrom('Minors')
				.where('id', '=', minorData.id)
				.select('id')
				.executeTakeFirst();

			if (!minor) {
				throw new Error('Minor not found');
			}

			await db
				.updateTable('Minors')
				.set({
					name: minorData.name
				})
				.where('id', '=', minor.id)
				.execute();

			const requirementIds: string[] = [];

			for (const requirement of minorData.requirements) {
				const requirementId = await db
					.selectFrom('MinorRequirements')
					.where('id', '=', requirement.id)
					.select('id')
					.executeTakeFirst();

				if (requirementId) {
					await db
						.updateTable('MinorRequirements')
						.set({
							option: requirement.option as requirementOption,
							credits: requirement.credits,
							details: JSON.stringify(requirement.details),
							detailsType: requirement.detailsType as requirementDetailsType,
							level: JSON.stringify(requirement.level)
						})
						.where('id', '=', requirementId.id)
						.execute();
					requirementIds.push(requirementId.id);
				} else {
					const newRequirementId = await db
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
					if (!newRequirementId) {
						throw new Error('Failed to create new requirement');
					}
					requirementIds.push(newRequirementId.id);
				}
			}

			await db
				.selectFrom('MinorRequirements')
				.where('minorId', '=', minor.id)
				.where('id', 'not in', requirementIds)
				.execute();

			return minor;
		});
		return result.id ? { success: true } : { success: false };
	} catch (error) {
		console.error('Error updating minor:', error);
		throw error;
	}
}

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

export async function fetchMinors() {
	const data = [];

	const minors = await db.selectFrom('Minors').selectAll().execute();

	for (const minor of minors) {
		const minorRequirements = await db
			.selectFrom('MinorRequirements')
			.where('minorId', '=', minor.id)
			.selectAll()
			.execute();
		const minorData = {
			...minor,
			requirements: minorRequirements.map((requirement) => {
				return {
					...requirement,
					details: JSON.parse(requirement.details) as string[],
					level: requirement.level
				};
			})
		};
		data.push(minorData);
	}
	return data;
}

export async function deleteMinor(id: string) {
	try {
		await db.transaction().execute(async (db) => {
			const minor = await db
				.selectFrom('Minors')
				.where('id', '=', id)
				.select('id')
				.executeTakeFirst();

			if (minor) {
				await db.deleteFrom('MinorRequirements').where('minorId', '=', minor.id).execute();
				await db.deleteFrom('Minors').where('id', '=', minor.id).execute();
			}
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating minor:', error);
		return { success: false };
	}
}
