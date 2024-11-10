import { z } from 'zod';
import { procedure, router } from '$lib/server/trpc';
import { courseRouter } from './course';
import { studentRouter } from './student';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { adminRouter } from './admin';
import { advisorRouter } from './advisor';

export const appRouter = router({
	hello: procedure.input(z.object({ text: z.string() })).query(({ input }) => {
		return {
			greeting: `hello ${input.text}`
		};
	}),
	admin: adminRouter,
	advisor: advisorRouter,
	courses: courseRouter,
	students: studentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
