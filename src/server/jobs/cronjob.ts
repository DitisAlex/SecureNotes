import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

export const startCronJob = (db: PrismaClient): void => {
	// Cron fires every day at 1am (same as S3 expiration)
	cron.schedule('0 1 * * * *', async () => {
		const currentDate = new Date();
		try {
			const expiredUploads = await db.upload.findMany({
				where: {
					expiresAt: {
						lte: currentDate
					}
				}
			});

			for (const upload of expiredUploads) {
				await db.upload.delete({
					where: {
						id: upload.id
					}
				});
			}
		} catch(error) {
			throw new Error(`Something went wrong with the cron job. - ${error}`);
		}
	});
};
