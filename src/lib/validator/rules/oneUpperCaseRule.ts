import vine from '@vinejs/vine';
import type { FieldContext } from '@vinejs/vine/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Options = {};

async function containsUpperCase(value: unknown, options: Options, field: FieldContext) {
	if (typeof value !== 'string') {
		return;
	}

	if (!field.isValid) {
		return;
	}

	const hasUpperCase = /[A-Z]/.test(value);

	if (!hasUpperCase) {
		return field.report(
			'This {{ field }} must contain at least one uppercase letter.',
			'containsUpperCase',
			field
		);
	}

	return;
}

export const containsUpperCaseRule = vine.createRule(containsUpperCase, {
	isAsync: true
});
