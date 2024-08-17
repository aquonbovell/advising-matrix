// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
		// interface PageData {}
		interface PageState {
			student: {
				completedcredits: number;
				totalcredits: number;
			};
		}
		// interface Platform {}
	}

	declare namespace svelteHTML {
		interface HTMLAttributes<T> {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			'on:clickoutside'?: (event: CustomEvent<any> & { target: EventTarget & T }) => any;
		}
	}
}

export {};
