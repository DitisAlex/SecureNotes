import { expect, test, vi, describe, beforeEach } from 'vitest';
import { type inferProcedureInput } from '@trpc/server';
import { appRouter, type AppRouter } from '~/server/api/root';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { Session } from 'next-auth';
import { generateSecret } from '~/utils/secret-generator';
import { encrypt, decrypt } from '~/utils/encryption';
import { env } from '~/env.mjs';

// Create a mock of the Prisma Database
import prismaMock from '~/server/libs/__mocks__/db';
vi.mock('~/server/libs/prisma');

test('Upload while not logged in', async () => {
	const ctx = await createInnerTRPCContext({ session: null });
	const caller = appRouter.createCaller(ctx);

	try {
		await caller.upload.create({
			type: 'text',
			content: 'Hello World',
			duration: '1h',
			email: 'alex@webbio.nl'
		});
	} catch (error) {
		expect((error as Error).message).toBe('UNAUTHORIZED');
	}
});

describe('Initialise mocked data(base)', () => {
	//Reset all mocks before each test
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.mock('~/utils/send-email', () => {
			return { sendEmail: vi.fn(() => true) };
		});
	});

	const sessionMock: Session = {
		user: { id: '123', name: 'Test', email: 'test@gmail.com' },
		expires: '9999'
	};

	const ctx = createInnerTRPCContext({ session: sessionMock });
	const caller = appRouter.createCaller({ ...ctx, db: prismaMock });

	test('Upload text', async () => {
		type Input = inferProcedureInput<AppRouter['upload']['create']>;
		const input: Input = {
			type: 'text',
			content: 'Hello World',
			duration: '1h',
			email: 'alex@webbio.nl'
		};

		const textUpload = await caller.upload.create(input);
		expect(textUpload).toMatchObject({ secret: expect.any(String) });
	});

	test('Upload file', async () => {
		type Input = inferProcedureInput<AppRouter['upload']['create']>;
		const input: Input = {
			type: 'file',
			duration: '1h',
			email: 'alex@webbio.nl',
			file: {
				name: 'test.txt',
				size: 10,
				contentType: 'text/plain'
			}
		};

		const fileUpload = await caller.upload.create(input);

		expect(fileUpload).toMatchObject({ secret: expect.any(String) });
	});
});

describe('Secret Generator', () => {
	test('Secret includes salt', () => {
		const length = 16;
		const saltHex = Buffer.from(env.SECRET_SALT, 'utf8').toString('hex');
		const secret = generateSecret(length);
		expect(secret).toContain(saltHex);
	});

	test('Unique secrets', () => {
		const length = 16;
		const secret1 = generateSecret(length);
		const secret2 = generateSecret(length);
		expect(secret1).not.toBe(secret2);
	});
});

describe('Cryptography', () => {
	test('Encryption and decryption', () => {
		const input = 'Hello World';
		const secret = 'secret';

		const cipherText = encrypt(input, secret);
		const plainText = decrypt(cipherText, secret);
		expect(plainText).toBe(input);
	});
});
