import { z } from 'zod';
import { generateSecret, splitSecret } from '~/utils/secret-generator';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { encrypt } from '~/utils/encryption';
import { sendEmail } from '~/utils/send-email';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Environment } from '~/misc/environments';

const SECRET_LENGTH: number = 10;
const MAXIMUM_REQUESTS_AMOUNT: number = 5;
const MAXIMUM_REQUESTS_DURATION: number = 60;

const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(MAXIMUM_REQUESTS_AMOUNT, `${MAXIMUM_REQUESTS_DURATION} s`),
	analytics: true
});

export const uploadRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z
				.object({
					type: z.union([z.literal('file'), z.literal('text')]),
					content: z.string().optional(),
					file: z
						.object({
							name: z.string(),
							size: z.number(),
							contentType: z.string()
						})
						.optional(),
					duration: z.string(),
					email: z.string()
				})
				.refine(
					(data) => {
						if (data.type === 'text') return data.content !== undefined && data.content.trim() !== '';
						else if (data.type === 'file') return data.file?.size !== 0;
					},
					{
						message: "Either 'content' or 'file' is missing."
					}
				)
		)
		.mutation(async ({ ctx, input }) => {
			if (process.env.NODE_ENV !== 'test') {
				const { success } = await ratelimit.limit(ctx.session?.user?.id);

				if (!success) throw new Error('Too many requests');
			}

			const date = new Date(); // Get current date/time
			const currentDate = new Date(date.getTime() + 60 * 60 * 1000); // Change to our timezone (UTC +1)
			const expirationDate = new Date(currentDate);

			if (input.duration.charAt(1) === 'd')
				// If duration input is day -> increment by X days
				expirationDate.setDate(currentDate.getDate() + Number.parseInt(input.duration.charAt(0)));
			else if (input.duration.charAt(1) === 'h')
				// If duration input is hour -> increment by X hours
				expirationDate.setHours(currentDate.getHours() + Number.parseInt(input.duration.charAt(0)));

			// Generates a hex string with a specified length
			const secret = generateSecret(SECRET_LENGTH);
			const [shareStart, shareEnd] = splitSecret(secret);

			if (!ctx.session.user) throw new Error('User not found');

			if (process.env.NODE_ENV !== Environment.Test) {
				try {
					await sendEmail(input.email, shareStart as string, ctx.session?.user?.name, ctx.session?.user.email);
				} catch {
					throw new Error('Could not send email');
				}
			}

			const uploadResponse = await ctx.db.upload.create({
				data: {
					type: input.type,
					content: input?.content ? encrypt(input.content, secret) : undefined,
					createdAt: currentDate.toISOString(),
					expiresAt: expirationDate.toISOString(),
					secret: secret,
					userId: ctx.session?.user.id
				}
			});

			if (input.file && uploadResponse) {
				await ctx.db.file.create({
					data: {
						name: encrypt(input.file.name, secret),
						size: input.file.size,
						contentType: input.file?.contentType,
						uploadId: uploadResponse.id
					}
				});
			}

			return {
				secret: shareEnd,
				type: input.type
			};
		})
});
