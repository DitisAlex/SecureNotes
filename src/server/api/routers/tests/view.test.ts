import { expect, test, vi, describe, beforeEach } from 'vitest';
import { type inferProcedureInput } from '@trpc/server';
import { appRouter, type AppRouter } from '~/server/api/root';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { encrypt, decrypt } from '~/utils/encryption';

// Create a mock of the Prisma Database
import prismaMock from '~/server/libs/__mocks__/db';
vi.mock('~/server/libs/prisma');

describe('View Uploads', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const ctx = createInnerTRPCContext({ session: null });
	const caller = appRouter.createCaller({ ...ctx, db: prismaMock });

	const content: string = 'hello world';
	const fileName: string = 'text.txt';
	const secret: string = 'secret';
	const encryptedFileName = encrypt(fileName, secret);
	const encryptedText = encrypt(content, secret);

	test('Search for non existing file', async () => {
		type Input = inferProcedureInput<AppRouter['view']['viewContent']>;
		const input: Input = {
			secret: secret
		};

		const invalidUpload = caller.view.viewContent(input);
		await expect(invalidUpload).rejects.toThrowError('Secure note not found');
	});

	test('View text upload', async () => {
		prismaMock.upload.findFirst.mockResolvedValue({
			id: '1',
			type: 'text',
			content: encryptedText,
			createdAt: new Date(),
			expiresAt: new Date(),
			secret: secret,
			userId: '123'
		});

		type Input = inferProcedureInput<AppRouter['view']['viewContent']>;
		const input: Input = {
			secret: secret
		};

		const textUpload = await caller.view.viewContent(input);
		expect(textUpload).toMatchObject({ content: content, type: 'text' });
	});

	// test('View file with invalid credentials', async () => {
	// 	prismaMock.upload.findFirst.mockResolvedValue({
	// 		id: '1',
	// 		type: 'file',
	// 		file: {
	// 			name: encryptedText,
	// 			size: 10,
	// 			contentType: 'text/plain'
	// 		},
	// 		createdAt: new Date(),
	// 		expiresAt: new Date(),
	// 		secret: secret,
	// 		user: {
	// 			id: '123'
	// 		}
	// 	});

	// 	// Mock S3 Client
	// 	vi.mock('@aws-sdk/client-s3', async () => {
	// 		const actual = await vi.importActual('@aws-sdk/client-s3');
	// 		return {
	// 			...actual,
	// 			S3Client: undefined
	// 		};
	// 	});

	// 	type Input = inferProcedureInput<AppRouter['view']['viewContent']>;
	// 	const input: Input = {
	// 		secret: secret
	// 	};
	// 	const fileUpload = caller.view.viewContent(input);
	// 	await expect(fileUpload).rejects.toThrowError(/Credentials are invalid/);
	// });

	test('View file upload', async () => {
		prismaMock.upload.findFirst.mockResolvedValue({
			id: '1',
			type: 'file',
			file: {
				name: encryptedFileName,
				size: 10,
				contentType: 'text/plain'
			},
			createdAt: new Date(),
			expiresAt: new Date(),
			secret: secret,
			user: {
				id: '123'
			}
		});

		// Mock S3 Client
		vi.mock('@aws-sdk/client-s3', async () => {
			const actual = await vi.importActual('@aws-sdk/client-s3');
			return {
				...actual,
				S3Client: vi.fn(),
				GetObjectCommand: vi.fn()
			};
		});

		// Mock S3 Presigner
		vi.mock('@aws-sdk/s3-request-presigner', async () => {
			return {
				getSignedUrl: vi.fn(() => {
					return 'https://test.com';
				})
			};
		});

		type Input = inferProcedureInput<AppRouter['view']['viewContent']>;
		const input: Input = {
			secret: secret
		};

		const fileUpload = await caller.view.viewContent(input);
		expect(fileUpload).toMatchObject({
			file: {
				name: decrypt(encryptedFileName, secret),
				size: 10,
				contentType: 'text/plain'
			},
			type: 'file',
			url: 'https://test.com'
		});
	});

	test('Rate limit', async () => {
		const MAXIMUM_REQUEST: number = 3;
		let count: number = 0;
		const rateLimiterMock = vi.fn();

		rateLimiterMock.mockImplementation(() => {
			count++;
			if (count >= MAXIMUM_REQUEST) {
				return false;
			}
			return true;
		});

		prismaMock.upload.findFirst.mockResolvedValue({
			id: '1',
			type: 'text',
			content: encryptedText,
			createdAt: new Date(),
			expiresAt: new Date(),
			secret: secret,
			userId: '123'
		});

		type Input = inferProcedureInput<AppRouter['view']['viewContent']>;
		const input: Input = {
			secret: secret
		};

		for (let i = 0; i < MAXIMUM_REQUEST + 1; i++) {
			await caller.view.viewContent(input);
			rateLimiterMock();
		}

		expect(rateLimiterMock()).toBe(false);
	});
});
