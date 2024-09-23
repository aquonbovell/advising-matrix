import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from './context';
import { transformer } from '$lib/trpc/transformer';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

const t = initTRPC.context<Context>().create({
	transformer
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
	if (!ctx.session || !ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			user: ctx.user,
			session: ctx.session
		}
	});
});

// export type Router = typeof router;

// export type RouterInputs = inferRouterInputs<Router>;
// export type RouterOutputs = inferRouterOutputs<Router>;
