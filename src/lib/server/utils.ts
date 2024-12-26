import { encodeBase32LowerCase, encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';

export function generateRandomOTP(): string {
	const bytes = new Uint8Array(5);
	crypto.getRandomValues(bytes);
	const code = encodeBase32UpperCaseNoPadding(bytes);
	return code;
}

export function generateRandomRecoveryCode(): string {
	const recoveryCodeBytes = new Uint8Array(10);
	crypto.getRandomValues(recoveryCodeBytes);
	const recoveryCode = encodeBase32UpperCaseNoPadding(recoveryCodeBytes);
	return recoveryCode;
}

export function generateRandomId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
