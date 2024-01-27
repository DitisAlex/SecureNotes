import crypto from 'node:crypto';
import { env } from '../env.mjs';

export const generateSecret = (length: number): string => {
	const saltHex = Buffer.from(env.SECRET_SALT, 'utf8').toString('hex');
	const randomBytesHex = crypto.randomBytes(length).toString('hex');
	return randomBytesHex + saltHex;
};

export const splitSecret = (secret: string): string[] => {
	const shareStart = secret.slice(0, secret.length / 2);
	const shareEnd = secret.slice(secret.length / 2);

	return [shareStart, shareEnd];
};
