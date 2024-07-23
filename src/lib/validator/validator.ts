import { VineString } from '@vinejs/vine';
import { containsUpperCaseRule } from './rules/oneUpperCaseRule';

declare module '@vinejs/vine' {
	interface VineString {
		/**
		 * Enforces that the string contains at least one uppercase letter.
		 */
		containsUpperCase(): this;
	}
}

VineString.macro('containsUpperCase', function (this: VineString) {
	return this.use(containsUpperCaseRule({}));
});
