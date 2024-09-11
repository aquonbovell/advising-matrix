import { writable } from 'svelte/store';

export const selectedStudent = writable<string | null>(null);
