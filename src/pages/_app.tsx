import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';

import { api } from '~/utils/api';

import '~/styles/globals.css';

import Head from 'next/head';

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
	return (
		<SessionProvider session={session}>
			<Head>
				<title>Secure Notes</title>
				<meta name="description" content="Secure and Encrypted File Sharing" />
				<link rel="icon" href="/favicon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
			</Head>
			<Component {...pageProps} />
		</SessionProvider>
	);
};

export default api.withTRPC(MyApp);
