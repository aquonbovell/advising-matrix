import { db } from './db';
import { Argon2id } from 'oslo/password';
import 'dotenv/config';

const seed = async () => {
	console.log('Seeding database...');
	const encoder = new TextEncoder();
	const secret = encoder.encode(process.env.SECRET!);
	const argon2id = new Argon2id({ secret });

	const hashedPassword = await argon2id.hash(process.env.DEFAULT_PASSWORD!);

	await db.transaction().execute(async (db) => {
		const users = await db.selectFrom('User').select('User.id').execute();

		for (const user of users) {
			await db
				.updateTable('User')
				.set({ password: hashedPassword, updated_at: new Date().toISOString() })
				.where('User.id', '=', user.id)
				.execute();
		}
	});

	db.destroy();
	console.log('Connection closed');
};

seed()
	.then(() => {
		console.log('Database seeded successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
