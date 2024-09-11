import { derived, writable } from 'svelte/store';

const TIMEOUT = 3000;

interface Notification {
	id: string;
	type: 'default' | 'danger' | 'warning' | 'info' | 'success';
	message: string;
	timeout: number;
}

function createNotificationStore(timeout: number = TIMEOUT) {
	const _notifications = writable<Notification[]>([]);

	function send(message: string, type: Notification['type'] = 'default', timeout: number) {
		_notifications.update((state) => {
			return [...state, { id: crypto.randomUUID(), type, message, timeout }];
		});
	}

	// Function to remove a notification by its id
	function remove(id: string) {
		_notifications.update((state) => state.filter((n) => n.id !== id));
	}

	let timers: NodeJS.Timeout[] = [];

	const notifications = derived<typeof _notifications, Notification[]>(
		_notifications,
		($_notifications, set) => {
			set($_notifications);

			if ($_notifications.length > 0) {
				const timer = setTimeout(() => {
					_notifications.update((state) => {
						state.shift(); // Remove the first notification after timeout
						return state;
					});
				}, $_notifications[0]?.timeout);

				timers.push(timer);

				return () => {
					clearTimeout(timer);
				};
			}
		}
	);

	const { subscribe } = notifications;

	return {
		subscribe,
		send,
		remove, // Add remove method to allow deleting notifications
		default: (msg: string, timeout: number) => send(msg, 'default', timeout),
		danger: (msg: string, timeout: number) => send(msg, 'danger', timeout),
		warning: (msg: string, timeout: number) => send(msg, 'warning', timeout),
		info: (msg: string, timeout: number) => send(msg, 'info', timeout),
		success: (msg: string, timeout: number) => send(msg, 'success', timeout),
	};
}

export const notifications = createNotificationStore();
