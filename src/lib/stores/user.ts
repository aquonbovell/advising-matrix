import type { User } from '$lib/server/actions/user.actions';
import { writable } from 'svelte/store';

export const user = writable<User | null>(null);
