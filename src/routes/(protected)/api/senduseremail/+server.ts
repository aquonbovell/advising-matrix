import { error, fail, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Mailjet from 'node-mailjet';
import { MJ_APIKEY_PRIVATE, MJ_APIKEY_PUBLIC } from '$env/static/private';
import { message } from 'sveltekit-superforms';
import { db } from '$lib/db';

export const POST: RequestHandler = async ({ request, url }) => {
	const requestData = await request.formData();
	console.log(requestData);

	const token = requestData.get('token');

	if (!token) {
		return json({ status: 404, message: 'token is required' });
	}

	const user = await db
		.selectFrom('Student')
		.innerJoin('User', 'Student.user_id', 'User.id')
		.select(['User.email', 'User.alternate_email'])
		.where('invite_token', '=', token.toString())
		.executeTakeFirst();

	if (!user) {
		json({ status: 404, message: 'Invalid token for this student' });
	}

	const mailjet = Mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);
	const mailRequest = mailjet.post('send', { version: 'v3.1' }).request({
		Messages: [
			{
				From: {
					Email: 'cssuwi@outlook.com',
					Name: 'Computer Science Society'
				},
				To: [
					{
						Email: user?.email,
						Name: 'You'
					},
					{
						Email: user?.alternate_email,
						Name: 'You'
					}
				],
				Subject: 'FST Matrix',
				TextPart: '[FST Matrix] Your registration token is here!',
				HTMLPart: `<h3>Hi Student,</h3><p>Your token is ${token}. Register at ${url.hostname}.</p>`
			}
		]
	});

	const data = (await mailRequest).response;

	if (data.status !== 200) {
		return json({ status: 404, message: 'Error sending email try again' });
	}

	return json({ status: 200 });
};
