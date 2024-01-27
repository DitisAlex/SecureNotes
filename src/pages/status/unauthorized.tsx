import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const Unauthorized = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Unauthorized - Secure Notes</title>
        <meta name="description" content="Secure and Encrypted File Sharing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-border max-w-sm rounded border-2 bg-[--surface-color-primary]">
          <div className="flex h-[90px] items-center justify-center rounded-t bg-background bg-contain text-white">
            <Image src="/assets/logo.svg" alt="Webbio logo" width={147} height={30} />
          </div>

          <div className="p-10">
            <h3 className="mb-2 text-xl font-bold">Unauthorized (401)</h3>
            <div className="text-body text-base font-normal leading-normal">
              Your Google account does not seem to be associated with an Webbio account.
            </div>
            <Link
              className="text-text-primary border-default-gray-300 mt-5 flex w-full items-center justify-center gap-2 rounded border-2 py-1 text-lg font-semibold leading-7"
              href="/"
            >
              Return back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Unauthorized;
