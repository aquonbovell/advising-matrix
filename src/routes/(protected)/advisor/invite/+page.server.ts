import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/db';
import { generateTokenWithExpiration } from '$lib/server/auth';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { Argon2id } from 'oslo/password';
import { DEFAULT_PASSWORD } from '$env/static/private';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	const majors = await db
		.selectFrom('Majors')
		.select(['Majors.id as id', 'name'])
		.innerJoin('MajorRequirements', 'MajorRequirements.majorId', 'Majors.id')
		.groupBy('Majors.id')
		.execute();

	const minors = await db
		.selectFrom('Minors')
		.select(['Minors.id as id', 'name'])
		.innerJoin('MinorRequirements', 'MinorRequirements.minorId', 'Minors.id')
		.groupBy('Minors.id')
		.execute();

	return {
		form: await superValidate(zod(formSchema)),
		majors,
		minors: [
			...minors.map((m) => {
				return { id: m.id, name: m.name.concat(' (Minor)') };
			}),
			...majors
				.filter((m) => !m.name.match(/Double/i))
				.map((m) => {
					return { id: m.id, name: m.name.concat(' (Major)') };
				})
		]
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}

		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const official_email = form.data.official_email;
		const alternate_email = form.data.alternate_email;
		const name = form.data.name;
		const majorId = form.data.majorId;
		const minorId = form.data.minorId;

		const users = await db
			.selectFrom('User')
			.where((eb) =>
				eb.or([
					eb('User.email', '=', official_email),
					eb('User.alternate_email', '=', alternate_email)
				])
			)
			.select(['id', 'email', 'alternate_email'])
			.execute();

		if (users.length > 0) {
			if (users.find((u) => u.email === official_email)) {
				form.errors.official_email = [
					...(form.errors.official_email ?? []),
					'Student already exists on official email'
				];
			}
			if (users.find((u) => u.alternate_email === alternate_email)) {
				form.errors.alternate_email = [
					...(form.errors.alternate_email ?? []),
					'Student already exists on alternate email'
				];
			}
			return fail(400, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const { expiresAt, token } = generateTokenWithExpiration();

			await db.transaction().execute(async (trx) => {
				const userId = crypto.randomUUID();
				const student_id = crypto.randomUUID();
				const encoder = new TextEncoder();
				const secret = encoder.encode(process.env.SECRET!);
				const argon2id = new Argon2id({ secret });

				const hashedPassword = await argon2id.hash(DEFAULT_PASSWORD);

				await trx
					.insertInto('User')
					.values({
						id: userId,
						name: name,
						email: official_email,
						alternate_email: alternate_email,
						role: 'STUDENT',
						password: hashedPassword,
						created_at: new Date(),
						updated_at: new Date()
					})
					.execute();

				await trx
					.insertInto('Student')
					.values({
						id: student_id,
						user_id: userId,
						major_id: majorId,
						invite_token: token,
						minor_id: minorId,
						invite_expires: new Date(expiresAt),
						created_at: new Date(),
						updated_at: new Date()
					})
					.execute();

				await trx
					.insertInto('Advisor')
					.values({
						advisor_id: event.locals.user?.id!,
						student_id: student_id
					})
					.execute();
			});

			return message(form, 'Student invited successfully!');

			const emailform = new FormData();

			emailform.append('email', official_email);
			emailform.append('alternate', alternate_email);
			emailform.append('token', token);
			emailform.append('url', event.url.hostname);

			const res = await event.fetch('/api/sendemail', {
				method: 'POST',
				body: emailform
			});

			const data = await res.json();

			if (data.status === 200) return message(form, 'Invitation sent successfully!');
			return message(form, data.message);
		} catch (err) {
			console.error(err);
			error(500, { message: 'Failed to invite student' });
		}
	}
};
