import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { IView } from '~/types/view';
import Image from 'next/image';
import File from '~/components/file';
import Content from '~/components/content';

const View = (): JSX.Element => {
	const [secretInput, setSecretInput] = useState<string>('');
	const [data, setData] = useState<IView>();
	const [error, setError] = useState<string>('');

	const { mutate, isLoading } = api.view.viewContent.useMutation<IView>({
		onSuccess: (response) => {
			setSecretInput('');
			setError('');
			setData(response);
		},
		onError: (error) => {
			setError(error.message);
			setData(undefined);
		}
	});

	const router = useRouter();

	const handleView = (): void => {
		if (!secretInput) return setError('Please enter a secret code');
		const key = router.query.key;
		const secret = key + secretInput;
		setError('');
		mutate({ secret });
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[--surface-color-secondary]">
			<div className="border-border max-w-sm rounded border-2 bg-[--surface-color-primary]">
				<div className="flex h-[90px] items-center justify-center rounded-t bg-background bg-contain text-white">
					<Image src="/assets/logo.svg" alt="Webbio logo" width={147} height={30} />
				</div>
				{data ? (
					data.type == 'file' ? (
						<File currentFile={data} />
					) : (
						<Content currentContent={data?.content || ''} />
					)
				) : (
					<div className="p-10">
						<h3 className="mb-2 text-xl font-bold">Welcome to Secure Notes.</h3>
						<div className="text-body text-base font-normal leading-normal">
							Enter the secret code to access the encrypted message.
						</div>
						<div className="mt-6 flex flex-col text-[--text-color-primary]">
							<label className="text-body text-base font-semibold leading-normal">Secret Code:</label>
							<input
								type="text"
								value={secretInput}
								onChange={(e) => setSecretInput(e.target.value)}
								className="border-default-gray-300 flex w-full justify-center gap-2 rounded border-2 p-1 leading-7"
								placeholder="Enter secret code..."
							/>
							<button
								onClick={handleView}
								className="mt-5 inline-flex justify-center rounded bg-[--button-color-primary] px-5 py-2 text-base font-semibold leading-normal text-white hover:bg-[--button-color-hover]"
							>
								View note
							</button>
						</div>
						{isLoading && !error ? (<div className="text-semibold">
							Decrypting note...
						</div>) : <div className="text-semibold">
							{error}
						</div>}
					</div>
				)}
			</div>
		</div>
	);
};

export default View;
