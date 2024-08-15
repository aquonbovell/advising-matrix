import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response('Hello', {
		status: 200,
		headers: { 'content-type': 'text/plain', X: 'Gon give it to ya' }
	});
};
