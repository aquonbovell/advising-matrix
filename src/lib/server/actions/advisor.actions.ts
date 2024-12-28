import { authdb, db } from '../db';
import { generateRandomId } from '../utils';

export async function createAdvisor(userId: string) {
	await db
		.insertInto('advisor')
		.values({
			id: generateRandomId(),
			userId: userId
		})
		.execute();
}

export async function deleteAdvisorFromId(userId: string) {
	await db.deleteFrom('advisor').where('userId', '==', userId).execute();
}

export async function getAdvisors() {
	const advisors = await authdb
		.selectFrom('user')
		.select(['user.id', 'user.email', 'user.username', 'user.role', 'user.emailVerified'])
		.where('role', '==', 'advisor')
		.execute();

	return [...advisors].map((advisor, i) => ({
		...advisor,
		email: advisor.email.concat(i.toLocaleString()),
		emailVerified: advisor.emailVerified === 1 ? true : false
	}));
}
