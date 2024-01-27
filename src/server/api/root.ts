import { uploadRouter } from '~/server/api/routers/upload';
import { viewRouter } from '~/server/api/routers/view';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	upload: uploadRouter,
	view: viewRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
