import Image from 'next/image';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { FaAngleDown, FaSignOutAlt } from 'react-icons/fa';
import { IoLockClosedOutline } from 'react-icons/io5';

const Navbar = (): JSX.Element => {
	const [openDropdown, setOpenDropdown] = useState(false);
	const { data: sessionData } = useSession();

	return (
		<div className="inline-flex h-14 w-full items-center border-b border-zinc-200 bg-[--surface-color-primary]">
			<div className="sm:mr-4 flex h-full w-44 items-center justify-center rounded-br-lg bg-background bg-contain text-[surface-color-primary]">
				<Image src="/assets/logo.svg" alt="Webbio logo" width={118} height={24} />
			</div>
			<div className="inline-flex flex-col items-start justify-start rounded bg-[--secure-color-surface] p-2">
				<div className="inline-flex items-center justify-start gap-1 self-stretch">
					<IoLockClosedOutline className="relative text-[--secure-color-text]" />
					<div className="select-none shrink grow basis-0 text-sm font-normal leading-snug text-[--secure-color-text]">
						Secured by Webbio
					</div>
				</div>
			</div>
			<div className="relative m-auto sm:mr-6 inline-block cursor-pointer items-center">
				<div
					className={`flex items-center justify-center gap-2 ${openDropdown ? 'rounded-x rounded-t' : 'rounded'
						} select-none border-2 border-[--surface-color-border] px-3 sm:py-2 hover:bg-[--surfer-color-border-hover]`}
					onClick={() => setOpenDropdown(!openDropdown)}
				>
					{sessionData?.user?.image ? (
						<Image src={sessionData?.user?.image} width={24} height={24} alt="user image" className="rounded-full" />
					) : (
						<div className="h-5 w-5 rounded-full bg-[--button-color-primary]" />
					)}
					<div className="text-center font-semibold leading-snug text-[--text-tertiary] text-ellipse">{sessionData?.user?.name}</div>
					<div
						className={`transform text-sm transition-transform duration-300 ${openDropdown ? '-rotate-180' : 'rotate-0'
							}`}
					>
						<FaAngleDown />
					</div>
				</div>
				{openDropdown && (
					<div
						className={`absolute w-full transform rounded-b border-x-2 border-b-2 border-[--surface-color-border] bg-[--surface-color-primary] px-3 py-2 text-sm hover:bg-[--surfer-color-border-hover]`}
						onClick={() => signOut()}
					>
						<div className="flex items-center gap-2">
							<FaSignOutAlt />
							Log out
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Navbar;
