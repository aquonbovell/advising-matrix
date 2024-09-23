import { db } from '$lib/db';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { courseRouter } from './courses';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const appRouter = router({
	greeting: publicProcedure
		.input(
			z.object({
				name: z.string().optional()
			})
		)
		.query(({ input }) => {
			return `Welcome to ${input.name ?? 'the world'}!`;
		}),
	me: publicProcedure.query(({ ctx }) => {
		return ctx.user;
	}),
	secret: protectedProcedure.query(({ ctx }) => {
		// This is a protected route
		return `Hello, ${ctx.user.email}!`;
	}),
	courses: courseRouter
});

export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
