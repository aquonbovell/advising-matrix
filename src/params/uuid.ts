import { validate } from 'uuid';
export function match(value) {
	return validate(value);
}
