import { error, fail, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Mailjet from 'node-mailjet';
import { MJ_APIKEY_PRIVATE, MJ_APIKEY_PUBLIC } from '$env/static/private';
import { message } from 'sveltekit-superforms';

export const POST: RequestHandler = async ({ request }) => {
	const requestData = await request.formData();
	console.log(requestData);

	const email = requestData.get('email');
	const alternate = requestData.get('alternate');
	const token = requestData.get('token');
	const url = requestData.get('url');

	if (!email) {
		return json({ status: 404, message: 'Official email is required' });
	}
	if (!alternate) {
		return json({ status: 404, message: 'Alternate email is required' });
	}
	if (!token) {
		return json({ status: 404, message: 'token is required' });
	}
	if (!url) {
		return json({ status: 404, message: 'domain is required' });
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
						Email: email,
						Name: 'You'
					},
					{
						Email: alternate,
						Name: 'You'
					}
				],
				Subject: 'FST Matrix',
				TextPart: '[FST Matrix] Your registration token is here!',
				HTMLPart: `<h3>Hi Student,</h3><p>Your token is ${token}. Register at ${url}.</p>`
			}
		]
	});

	const data = (await mailRequest).response;

	if (data.status !== 200) {
		return json({ status: 404, message: 'Error sending email try again' });
	}

	return json({ status: 200 });
};
