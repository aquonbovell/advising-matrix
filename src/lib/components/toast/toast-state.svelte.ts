import type { Toast } from '$lib/types';
import { getContext, onDestroy, setContext } from 'svelte';
import { writable } from 'svelte/store';

export class ToastState {
	toasts = writable<Toast[]>([]);
	toastsMapTimeout = new Map<string, NodeJS.Timeout>();

	constructor() {
		onDestroy(() => {
			for (const timeout of this.toastsMapTimeout.values()) {
				clearTimeout(timeout);
			}

			this.toastsMapTimeout.clear();
		});
	}

	add(title: string, message: string, type: 'info' | 'success' | 'error', durationMs = 5000) {
		const id = crypto.randomUUID();

		this.toasts.update((t) => [...t, { id: id, title, message, type }]);

		this.toastsMapTimeout.set(
			id,
			setTimeout(() => {
				this.remove(id);
			}, durationMs)
		);
	}

	remove(id: string) {
		const timeout = this.toastsMapTimeout.get(id);

		if (timeout) {
			clearTimeout(timeout);
			this.toastsMapTimeout.delete(id);
		}

		this.toasts.update((t) => t.filter((toast) => toast.id !== id));
	}
}

const TOAST_KET = Symbol('toast');

export function setToastState() {
	return setContext(TOAST_KET, new ToastState());
}

export function getToastState() {
	return getContext<ReturnType<typeof setToastState>>(TOAST_KET);
}
