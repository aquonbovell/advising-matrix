import { writable } from 'svelte/store';

export const gpa = writable('6.5');

export const completedCourses = writable<Record<string, boolean>>({});
