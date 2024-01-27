import React, { useState, useRef, useEffect } from 'react';
import { api } from '~/utils/api';
import type { IUpload } from '../types/upload';
import durationOptions from '../misc/durationOptions.json';
import { validateEmail } from '~/utils/validate-email';
import Navbar from './navbar';
import { FaArrowRight, FaRegClock, FaRegCopy } from 'react-icons/fa';
import { GoShieldLock, GoLock, GoAlert } from 'react-icons/go';
import { MdOutlineFileUpload } from 'react-icons/md';
import { useSession } from 'next-auth/react';

const Upload = (): JSX.Element => {
	const { data: sessionData } = useSession();

	const [content, setContent] = useState<string>('');
	const [duration, setDuration] = useState<string>('7d');
	const [file, setFile] = useState<File>();
	const [status, setStatus] = useState<string>('');
	const ref = useRef<HTMLInputElement>(null);
	const [email, setEmail] = useState<string>('');
	const [selected, setSelected] = useState<string>('file');
	const [secret, setSecret] = useState<string>('');

	const { mutate, isLoading } = api.upload.create.useMutation<IUpload>({
		onSuccess: (response) => {
			setSecret(response.secret as string);

			switch (response.type) {
				case "text":
					handleResetForm();
					break;
				case "file":
					uploadFile(file as File, sessionData?.user.id as string, response.secret as string)
						.then((response) => {
							if (response.ok) handleResetForm();
							else setStatus("Upload to file server failed.");
						})
					break;
			}
		},
		onError: () => setStatus("Oops! Something went wrong."),
	});

	const handleResetForm = (): void => {
		setContent("");
		setEmail("");
		setDuration("7d");
		setStatus("");
		setFile(undefined);
		if (ref.current) ref.current.value = ''; // Reset file input text
	};

	useEffect(() => {
		if (isLoading) return setStatus('Currently uploading... Please be patient.');
	}, [isLoading]);

	const handleUpload = (e: any): void => {
		e.preventDefault();

		if (isLoading) return;
		if (!sessionData?.user.id) return setStatus('No session was found, try relogging.');
		if (!email) return setStatus('No e-mail was entered.');
		if (validateEmail(email)) return setStatus('Entered e-mail is not valid.');

		let data: IUpload = {
			type: selected as 'file' | 'text',
			duration: duration,
			email: email
		};
		if (selected === 'file') {
			if (!file) return setStatus('No file was attached.');

			data = {
				...data, file: {
					name: file.name,
					size: file.size,
					contentType: file.type,
				}
			}

			return mutate(data);
		} else if (selected === 'text') {
			if (!content) return setStatus('No message was entered.');

			data = { ...data, content: content };

			return mutate(data);
		}
	};

	const uploadFile = async (currentFile: File, id: string, secret: string): Promise<Response> => {
		const formData = new FormData();
		formData.append('file', currentFile);
		formData.append('id', id);
		formData.append('expiration', duration);
		formData.append('secret', secret);

		const response = await fetch('/api/files/upload', {
			method: 'POST',
			body: formData
		});

		return response;
	};

	return (
		<div className="h-full">
			<Navbar />
			<div className="md:flex items-stretch justify-center md:px-20 lg:px-40 py-4">
				<div className="flex w-full md:w-1/2 flex-col rounded-lg md:rounded-r-none border-2 md:border-r-0 border-[--surface-color-table] bg-[--surface-color-primary] p-4 md:p-6">
					{secret ? (
						<div>
							<div className="text-2xl font-semibold mb-4">Succesfully created secure note</div>
							<div className="mb-4">
								<div className="font-semibold">
									Secret Code
								</div>
								<div className="text-[--text-color-secondary]">Share this secret code with the recipient</div>
								<div className="relative w-full max-w-sm rounded-lg border-2 border-[--surface-color-table] px-3 py-2">
									<input disabled className="pr-10 bg-[--surface-color-primary]" value={secret} type="text" />
									<FaRegCopy className="mr-4 h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => { navigator.clipboard.writeText(secret) }} />
								</div>
								<div className="my-4 border-b-2 border-dotted " />
								<div className="text-2xl font-semibold mb-4">Create a new secure note</div>
								<button
									onClick={() => setSecret('')}
									className="flex justify-center rounded-lg border-2 border-[--surface-color-table px-20 py-2 align-middle font-semibold text-[--text-tertiary] hover:bg-[--surfer-color-border-hover]"
								>
									<div className="flex items-center gap-2">
										Create new
										<FaArrowRight />
									</div>
								</button>
							</div>
						</div>

					) : (
						<div>
							<div className="text-2xl font-semibold">Encrypt new secure note</div>
							{status ? (<div className="flex bg-[--alert-color-bg] p-2 mt-2 text-[--alert-color-text] font-semibold gap-2 items-center rounded-sm"><GoAlert className="h-4 w-4 stroke-1" />{status}</div>) : null}
							<div className="my-4">What would you like to encrypt?</div>
							<div className="flex md:flex-row gap-2 rounded align-middle">
								<button
									onClick={() => setSelected('file')}
									className={`flex h-8 w-24 items-center justify-center rounded px-10 py-5 shadow ${selected == 'file' ? 'hover:bg-[--button-color-hover] bg-[--button-color-primary] text-[--color-default]' : 'hover:bg-[--surfer-color-border-hover] bg-[--surface-color-tertiary]'
										}`}
								>
									File
								</button>
								<div className="w-0.5 bg-[#DEE2E6]" />
								<button
									onClick={() => setSelected('text')}
									className={`flex h-8 w-24 items-center justify-center rounded px-10 py-5 shadow ${selected == 'text' ? 'hover:bg-[--button-color-hover] bg-[--button-color-primary] text-[--color-default]' : 'hover:bg-[--surfer-color-border-hover] bg-[--surface-color-tertiary]'
										}`}
								>
									Text
								</button>
							</div>
							<div className="my-4 border-b-2 border-dotted " />
							<form>
								<div className="mb-4">
									<div className="font-semibold">
										Email adress <span className="text-red-500">*</span>
									</div>
									<div className="text-[--text-color-secondary]">Enter the email address of the recipient</div>
									<input
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										type="email"
										className="w-full rounded-lg border-2 border-[--surface-color-table] px-3  py-2"
										placeholder="Example: john@webbio.nl"
									/>
								</div>
								{selected == 'file' ? (
									<div className="mb-4">
										<div className="font-semibold">
											File <span className="text-red-500">*</span>
										</div>
										<div className="text-[--text-color-secondary]">Attach the file to encrypt</div>
										<label
											className="relative flex w-full cursor-pointer rounded-lg border-2 border-[--surface-color-table] bg-white px-3 py-2"
											htmlFor="file-upload"
										>
											<div className="text-center">
												{file ? (
													<span>{file?.name}</span>
												) : (
													<div className="flex items-center gap-1 text-[--text-color-placeholder]">
														<MdOutlineFileUpload className="h-5 w-5" />
														<span>Choose file</span>
													</div>
												)}
											</div>
											<input
												required
												ref={ref}
												onChange={(e) => setFile(e.target.files?.[0])}
												className="sr-only"
												id="file-upload"
												name="file-upload"
												type="file"
											/>
										</label>
									</div>
								) : (
									<div className="mb-4">
										<div className="font-semibold">
											Message <span className="text-red-500">*</span>
										</div>
										<div className="text-[--text-color-secondary]">Enter the message to encrypt</div>
										<input
											required
											value={content}
											onChange={(e) => setContent(e.target.value)}
											type="text"
											className="w-full rounded-lg border-2 border-[--surface-color-table] px-3 py-2"
											placeholder="Type your message here..."
										/>
									</div>
								)}
								<div className="mb-4">
									<div className="font-semibold">
										Expiration time <span className="text-red-500">*</span>
									</div>
									<div className="text-[--text-color-secondary]">Specify when the secure note expires</div>
									<select
										className="cursor-pointer w-full rounded-lg border-2 border-[--surface-color-table] px-3 py-2"
										value={duration}
										onChange={(e) => setDuration(e.target.value)}
									>
										{durationOptions.map((value) => {
											return (
												<option key={value.time} value={value.time}>
													{value.text}
												</option>
											);
										})}
									</select>
								</div>
								<button
									onClick={(e) => handleUpload(e)}
									className="flex justify-center rounded bg-[--button-color-primary] p-4 align-middle font-semibold text-[--color-default] hover:bg-[--button-color-hover]"
								>
									<div className="flex items-center gap-2">
										Create secure note
										<FaArrowRight />
									</div>
								</button>
							</form>
						</div>
					)}
				</div>
				<div className="flex w-full md:w-1/2 flex-col rounded-lg rounded-l-none bg-background bg-contain p-4 md:p-8">
					<div className="mb-6 text-2xl font-semibold text-[--color-default]">
						Submit sensitive data securely on the Webbio way.
					</div>
					<div className="flex flex-col items-start gap-4 text-[--color-default]">
						<div className="flex items-center gap-2">
							<FaRegClock />
							Control over the note expiration time
						</div>
						<div className="flex items-center gap-2">
							<GoShieldLock />
							Choose if you want to share a file or note
						</div>
						<div className="flex items-center gap-2">
							<GoLock />
							Information is only accessable by the authorized recipient
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Upload;
