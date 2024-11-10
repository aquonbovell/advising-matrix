import { db } from '$lib/db';
import type { requirementDetailsType, requirementOption } from '$lib/db/schema';
import majors from '../../../majors.json';

export async function updateMajor(majorData: {
	id: string;
	name: string;
	requirements: requirement[];
}) {
	try {
		const result = await db.transaction().execute(async (db) => {
			const major = await db
				.selectFrom('Majors')
				.where('id', '=', majorData.id)
				.select('id')
				.executeTakeFirst();

			if (!major) {
				throw new Error('Major not found');
			}

			await db
				.updateTable('Majors')
				.set({
					name: majorData.name
				})
				.where('id', '=', major.id)
				.execute();

			await db.deleteFrom('MajorRequirements').where('majorId', '=', major.id).execute();

			for (const requirement of majorData.requirements) {
				await db
					.insertInto('MajorRequirements')
					.values({
						id: crypto.randomUUID(),
						majorId: major.id,
						option: requirement.option as requirementOption,
						credits: requirement.credits,
						details: JSON.stringify(requirement.details),
						detailsType: requirement.detailsType as requirementDetailsType,
						level: JSON.stringify(requirement.level)
					})
					.execute();
			}

			return major;
		});

		return result.id ? { success: true } : { success: false };
	} catch (error) {
		console.error('Error updating major:', error);
		throw error;
	}
}

export async function createMajor(majorData: { name: string; requirements: requirement[] }) {
	try {
		await db.transaction().execute(async (db) => {
			const major = await db
				.insertInto('Majors')
				.values({
					id: crypto.randomUUID(),
					name: majorData.name
				})
				.returning('id')
				.executeTakeFirst();

			if (major) {
				for (const requirement of majorData.requirements) {
					await db
						.insertInto('MajorRequirements')
						.values({
							id: crypto.randomUUID(),
							majorId: major.id,
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
		console.error('Error updating major:', error);
		return { success: false };
	}
}

type requirement = {
	id: string;
	option: requirementOption;
	details: string[];
	detailsType: requirementDetailsType;
	credits: number;
	level: number[];
};

export async function initMajors() {
	await db.deleteFrom('Advisor').execute();
	await db.deleteFrom('Student').execute();
	await db.deleteFrom('MajorRequirements').execute();
	await db.deleteFrom('Majors').execute();

	for (const major of majors) {
		const majorId = await db
			.insertInto('Majors')
			.values({
				id: crypto.randomUUID(),
				name: major.name
			})
			.returning('id')
			.executeTakeFirst();
		if (majorId) {
			const majorRequirements = major.requirements;
			for (const requirement of majorRequirements) {
				await db
					.insertInto('MajorRequirements')
					.values({
						id: crypto.randomUUID(),
						majorId: majorId.id,
						detailsType: requirement.detailsType.toUpperCase() as requirementDetailsType,
						level: JSON.stringify(requirement.level),
						credits: requirement.credits,
						details: JSON.stringify(requirement.details),
						option: requirement.option.toUpperCase() as requirementOption
					})
					.execute();
			}
		}
	}
}

export async function fetchMajors() {
	const data = [];

	const majors = await db.selectFrom('Majors').selectAll().execute();

	for (const major of majors) {
		const majorRequirements = await db
			.selectFrom('MajorRequirements')
			.where('majorId', '=', major.id)
			.selectAll()
			.execute();
		const majorData = {
			...major,
			requirements: majorRequirements.map((requirement) => {
				return {
					...requirement,
					details: JSON.parse(requirement.details) as string[],
					level: requirement.level
				};
			})
		};
		data.push(majorData);
	}
	return data;
}

export async function deleteMajor(id: string) {
	try {
		await db.transaction().execute(async (db) => {
			const major = await db
				.selectFrom('Majors')
				.where('id', '=', id)
				.select('id')
				.executeTakeFirst();

			if (major) {
				await db.deleteFrom('MajorRequirements').where('majorId', '=', major.id).execute();
				await db.deleteFrom('Majors').where('id', '=', major.id).execute();
			}
		});
		return { success: true };
	} catch (error) {
		console.error('Error updating major:', error);
		return { success: false };
	}
}
