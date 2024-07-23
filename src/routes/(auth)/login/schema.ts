import Vine from '@vinejs/vine';

export const loginSchema = Vine.object({
	email: Vine.string().trim().email(),
	//!FOR PROD: password: Vine.string().trim().minLength(8).containsUpperCase()
	password: Vine.string().trim()
});
