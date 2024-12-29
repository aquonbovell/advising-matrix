import { db } from '$lib/server/db';
import { generateRandomId } from '$lib/server/utils';
import majors from '$lib/server/data/majors.json';
import { writeFile } from 'fs/promises';
import { log } from 'console';

export async function checkMajorAvailability(
	name: string,
	id: string | null = null
): Promise<boolean> {
	if (id) {
		const row = await db
			.selectFrom('major')
			.select('name')
			.where('name', '==', name)
			.where('id', '!=', id)
			.execute();
		return row.length === 0;
	}
	const row = await db.selectFrom('major').select('name').where('name', '==', name).execute();
	return row.length === 0;
}

export async function createMajor(name: string): Promise<Major> {
	const result = await db
		.insertInto('major')
		.values({
			id: generateRandomId(),
			name: name
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const major: Major = {
		id: result.id,
		name
	};
	return major;
}

export async function updateMajor(Id: string, name: string): Promise<Major> {
	const result = await db
		.updateTable('major')
		.set({
			name: name
		})
		.where('id', '==', Id)
		.returning('id')
		.executeTakeFirstOrThrow();

	const major: Major = {
		id: result.id,
		name
	};
	return major;
}

export async function getMajorFromId(Id: string) {
	const result = await db
		.selectFrom('major')
		.select(['major.id', 'major.name'])
		.where('major.id', '==', Id)
		.executeTakeFirst();
	return result;
}

export async function deleteMajorFromId(Id: string): Promise<boolean> {
	const result = await db.deleteFrom('major').where('id', '==', Id).executeTakeFirstOrThrow();

	return result.numDeletedRows > 0;
}

export async function getMajors() {
	const result = await db.selectFrom('major').select(['major.id', 'major.name']).execute();
	return result;
}

export interface Major {
	id: string;
	name: string;
}

export async function loadMajors() {
	await db.deleteFrom('major').execute();

	for (const major of majors) {
		log(major.name);
		const result = await db
			.insertInto('major')
			.values({
				id: generateRandomId(),
				name: major.name
			})
			.returning('id')
			.executeTakeFirst();

		if (!result) {
			return false;
		}
	}
	return true;
}
