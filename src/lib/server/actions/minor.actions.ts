import { db } from '$lib/server/db';
import { generateRandomId } from '$lib/server/utils';
import minors from '$lib/server/data/majors.json';
import { writeFile } from 'fs/promises';
import { log } from 'console';

export async function checkMinorAvailability(
	name: string,
	id: string | null = null
): Promise<boolean> {
	if (id) {
		const row = await db
			.selectFrom('minor')
			.select('name')
			.where('name', '==', name)
			.where('id', '!=', id)
			.execute();
		return row.length === 0;
	}
	const row = await db.selectFrom('minor').select('name').where('name', '==', name).execute();
	return row.length === 0;
}

export async function createMinor(name: string): Promise<Minor> {
	const result = await db
		.insertInto('minor')
		.values({
			id: generateRandomId(),
			name: name
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const minor: Minor = {
		id: result.id,
		name
	};
	return minor;
}

export async function updateMinor(Id: string, name: string): Promise<Minor> {
	const result = await db
		.updateTable('minor')
		.set({
			name: name
		})
		.where('id', '==', Id)
		.returning('id')
		.executeTakeFirstOrThrow();

	const minor: Minor = {
		id: result.id,
		name
	};
	return minor;
}

export async function getMinorFromId(Id: string) {
	const result = await db
		.selectFrom('minor')
		.select(['minor.id', 'minor.name'])
		.where('minor.id', '==', Id)
		.executeTakeFirst();
	return result;
}

export async function deleteMinorFromId(Id: string): Promise<boolean> {
	const result = await db.deleteFrom('minor').where('id', '==', Id).executeTakeFirstOrThrow();

	return result.numDeletedRows > 0;
}

export async function getMinors() {
	const result = await db.selectFrom('minor').select(['minor.id', 'minor.name']).execute();
	return result;
}

export interface Minor {
	id: string;
	name: string;
}

export async function loadMinors() {
	await db.deleteFrom('minor').execute();

	for (const minor of minors) {
		log(minor.name);
		const result = await db
			.insertInto('minor')
			.values({
				id: generateRandomId(),
				name: minor.name
			})
			.returning('id')
			.executeTakeFirst();

		if (!result) {
			return false;
		}
	}
	return true;
}
