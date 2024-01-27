import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../../../env.mjs';
import * as fs from 'node:fs';
import { authOptions } from '~/server/auth';
import { getServerSession } from 'next-auth/next';

export const config = {
	api: {
		bodyParser: false
	}
};

export default async function upload(req: NextApiRequest, res: NextApiResponse): Promise<void> {
	const session = await getServerSession(req, res, authOptions);

	if (!session) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	if (req.method === 'POST') {
		const form = formidable({});
		let fields;
		let files;

		try {
			[fields, files] = await form.parse(req);
		} catch {
			return res.status(500).json({ message: 'Could not parse file' });
		}

		if (fields.id && fields.expiration && fields.secret && files.file && files.file[0]?.filepath) {
			let client;
			let command;

			try {
				client = new S3Client({
					region: env.REGION
				});
			} catch {
				return res.status(500).json({ message: 'Invalid credentials' });
			}

			try {
				command = new PutObjectCommand({
					Bucket: env.BUCKET_NAME,
					Key: `${fields.id[0]}/${fields.secret[0]}_${files.file[0]?.originalFilename}`,
					Body: fs.readFileSync(files.file[0]?.filepath),
					Tagging: `expiration=${fields.expiration[0]}`
				});
			} catch {
				return res.status(500).json({ message: 'Invalid file' });
			}

			try {
				await client.send(command);
				return res.status(200).json({ message: 'File succesfully uploaded' });
			} catch (error) {
				return res.status(400).json({
					message: `Failed to upload file: ${files.file[0]?.originalFilename}`,
					error: error
				});
			}
		} else {
			res.status(400).json({ message: 'Invalid file, try again' });
		}
	} else {
		res.status(405).json({ message: 'Method not allowed' });
	}
}
