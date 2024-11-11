import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from './context';
import { transformer } from '$lib/trpc/transformer';

const trpc = initTRPC.context<Context>().create({
	transformer
});

export const router = trpc.router;

export const procedure = trpc.procedure;

export const protectedProcedure = procedure.use(({ ctx, next }) => {
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
