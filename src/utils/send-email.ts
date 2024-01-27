import { SESClient, ListIdentitiesCommand, SendEmailCommand } from '@aws-sdk/client-ses';
import { env } from '~/env.mjs';

export const sendEmail = async (to: string, secret: string, fromName: string, fromEmail: string): Promise<any> => {
	if (!to.length || !secret.length || !fromName.length || !fromEmail.length) throw new Error(`Missing parameters`);

	let sesClient;

	try {
		sesClient = new SESClient({
			region: env.REGION,
			credentials: {
				accessKeyId: env.AWS_ACCESS_KEY_ID,
				secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
				sessionToken: env.AWS_SESSION_TOKEN
			}
		});
	} catch {
		throw new Error(`Could not create SES client`);
	}

	try {
		const { Identities } = await sesClient.send(new ListIdentitiesCommand({}));
		if (!Identities?.includes(to)) throw new Error(`Email address ${to} is not verified`);
	} catch {
		throw new Error(`Could not verify identity`);
	}

	await sesClient.send(
		new SendEmailCommand({
			Destination: {
				ToAddresses: [to]
			},
			Message: {
				Body: {
					Html: {
						Charset: 'utf8',
						Data: `<div>
                        <div>Dear ${to},</div>
                        <br>
                        <div>You have received an encrypted message that can be viewed at the following URL: ${env.NEXTAUTH_URL}/view?key=${secret}</div>
                        <div>The secret key to decrypt the message will be sent separately.</div>
                        <br>
                        <div>If this message was not intended for you, please ignore it.</div>
                        <br>
                        <div>Best regards,</div>
                        <div>${fromName} (${fromEmail})</div>
                        <div>&nbsp;</div>
                        <div><span style="font-size: 8pt;"><em>This e-mail was powered by Secure Notes, an <a href="https://webbio.nl/" target="_blank" rel="noopener">Webbio</a> application to share files securely and encrypted.</em></span></div>
                        </div>`
					}
				},
				Subject: {
					Charset: 'utf8',
					Data: 'Secure Notes [Webbio] - You received an encrypted message!'
				}
			},
			Source: fromEmail
		})
	);
};
