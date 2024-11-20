import { db } from '$lib/server/db';

export const fetchAdvisors = async () => {
	return db.selectFrom('User').select(['id', 'name']).where('role', '=', 'ADVISOR').execute();
};
