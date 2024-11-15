import { db } from '$lib/db';

export async function fetchFaculties() {
	// Get all faculties
	const faculties = await db.selectFrom('Faculties').select(['id', 'name']).execute();

	// Return all faculties
	return faculties;
}
