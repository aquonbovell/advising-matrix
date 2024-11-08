import { createTRPCSvelteServer } from 'trpc-svelte-query/server';
import { appRouter } from './routers';
import { createContext } from './context';

export const trpcServer = createTRPCSvelteServer({
	endpoint: '/api/trpc',
	router: appRouter,
	createContext
});
