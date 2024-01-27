import { z } from 'zod';
import { env } from '../../../env.mjs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { decrypt } from '~/utils/encryption';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { splitSecret } from '~/utils/secret-generator';

const MAXIMUM_REQUESTS_AMOUNT: number = 3;
const MAXIMUM_REQUESTS_DURATION: number = 60;

const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(MAXIMUM_REQUESTS_AMOUNT, `${MAXIMUM_REQUESTS_DURATION} s`),
	analytics: true
});

export const viewRouter = createTRPCRouter({
	viewContent: publicProcedure
		.input(
			z.object({
				secret: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (process.env.NODE_ENV !== 'test') {
				const { success } = await ratelimit.limit(input.secret);

				if (!success) throw new Error('Too many requests');
			}

			let upload;
			try {
				upload = await ctx.db.upload.findFirst({
					where: {
						secret: input.secret
					},
					select: {
						type: true,
						content: true,
						file: true,
						user: {
							select: {
								id: true
							}
						}
					}
				});
			} catch {
				throw new Error('Something went wrong');
			}

			if (!upload) {
				throw new Error('Secure note not found');
			}

			if (upload.type === 'file') {
				let client;
				let command;
				let url;

				try {
					client = new S3Client({
						region: env.REGION
					});
				} catch {
					throw new Error('Credentials are invalid');
				}

				if (!upload.file) throw new Error('Invalid file data');

				try {
					command = new GetObjectCommand({
						Bucket: env.BUCKET_NAME,
						Key: `${upload.user.id}/${splitSecret(input.secret)[1]}_${decrypt(upload.file.name, input.secret)}`
					});
				} catch {
					throw new Error('File not found');
				}

				try {
					url = await getSignedUrl(client, command, { expiresIn: 300 });
				} catch {
					throw new Error('Could not create url');
				}

				try {
					await ctx.db.upload.delete({
						where: {
							secret: input.secret
						}
					});
				} catch {
					throw new Error('Could not delete file');
				}

				return {
					file: {
						name: decrypt(upload.file.name, input.secret),
						size: upload.file.size,
						contentType: upload.file.contentType
					},
					type: upload.type,
					url: url
				};
			} else if (upload.type === 'text') {
				try {
					await ctx.db.upload.delete({
						where: {
							secret: input.secret
						}
					});
				} catch {
					throw new Error('Could not delete text');
				}

				return {
					content: decrypt(upload.content, input.secret),
					type: upload.type
				};
			}
		})
});
