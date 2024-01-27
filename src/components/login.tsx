import { signIn } from 'next-auth/react';
import Image from 'next/image';

const Login = (): JSX.Element => {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="border-border max-w-sm rounded border-2 bg-[--surface-color-primary]">
				<div className="flex h-[90px] items-center justify-center rounded-t bg-background bg-contain text-white">
					<Image src="/assets/logo.svg" alt="Webbio logo" width={147} height={30} />
				</div>

				<div className="p-10">
					<h3 className="mb-2 text-xl font-bold">Welcome to Secure Notes.</h3>
					<div className="text-body text-base font-normal leading-normal">
						Use your Google account to sign in to Secure Notes.
					</div>
					<button
						onClick={() => signIn('google')}
						className="text-text-primary border-default-gray-300 mt-5 flex w-full items-center justify-center gap-2 rounded border-2 py-1 text-lg font-semibold leading-7"
					>
						<Image src="assets/google.svg" width={16} height={16} alt="Google logo" />
						Login with Google
					</button>
				</div>
			</div>
		</div>
	);
};

export default Login;
