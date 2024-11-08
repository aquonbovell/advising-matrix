import { z } from 'zod';
import { procedure, router } from '$lib/server/trpc';
import { courseRouter } from './course';
import { studentRouter } from './student';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const appRouter = router({
	hello: procedure.input(z.object({ text: z.string() })).query(({ input }) => {
		return {
			greeting: `hello ${input.text}`
		};
	}),
	courses: courseRouter,
	students: studentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
