import type { RandomReader } from '@oslojs/crypto/random';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const random: RandomReader = {
	read(bytes: Uint8Array): void {
		crypto.getRandomValues(bytes);
	}
};

// ChatGPT generated
export function isValidUUID(uuid: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}
