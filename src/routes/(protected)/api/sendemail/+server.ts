import { error, fail, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Mailjet from 'node-mailjet';
import { MJ_APIKEY_PRIVATE, MJ_APIKEY_PUBLIC } from '$env/static/private';
import { message } from 'sveltekit-superforms';
import { db } from '$lib/db';
import { getStudentById } from '$lib/actions/student.actions';

export const POST: RequestHandler = async ({ request, url }) => {
	const requestData = await request.json();

	if (!requestData.id) {
		return json({ status: 401, message: 'Missing id' });
	}

	const student = await db
		.selectFrom('Student')
		.where('id', '=', requestData.id)
		.executeTakeFirst();

	if (!student) {
		return json({ status: 401, message: 'Student not found' });
	}

	const result = await getStudentById(requestData.id);

	if (!result) {
		return json({ status: 404, message: 'Error fetching student' });
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
						Email: result.email,
						Name: 'You'
					},
					{
						Email: result.alternate_email,
						Name: 'You'
					}
				],
				Subject: 'FST Matrix',
				TextPart: '[FST Matrix] Your registration token is here!',
				HTMLPart: `<h3>Hi Student,</h3><p>Your token is ${result.invite_token}. Register at ${url.hostname}.</p>`
			}
		]
	});

	const data = (await mailRequest).response;

	if (data.status !== 200) {
		return json({ status: 404, message: 'Error sending email try again' });
	}

	return json({ status: 200, message: 'Email sent successfully' });
};
