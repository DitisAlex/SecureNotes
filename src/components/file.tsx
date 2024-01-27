import { IView } from "~/types/view";
import { formatBytes } from "~/utils/format-bytes";

const File = (props: { currentFile: IView }): JSX.Element => {
    return (
        <div className="p-10">
            <h3 className="mb-2 text-l font-bold">Your encrypted note contained the following file:</h3>
            <div className="my-4 border-b-2 border-dotted " />
            <div className="text-body leading-normal">Name - {props?.currentFile?.file?.name}</div>
            <div className="text-body leading-normal">Type - {props?.currentFile?.file?.contentType}</div>
            <div className="text-body leading-normal">Size - {formatBytes(props?.currentFile?.file?.size ?? 0)}</div>
            <button
                onClick={() => location.href = `${props.currentFile.url?.toString()}`}
                className="mt-5 inline-flex justify-center rounded bg-[--button-color-primary] px-5 py-2 text-base font-semibold leading-normal text-white hover:bg-[--button-color-hover]"
            >
                Download file
            </button>
            <div className="my-4 border-b-2 border-dotted " />
            <div className="text-sm italic text-[--text-color-secondary]">
                Please note that once you have refreshed or closed this page, you will not be able to view this information again.
            </div>
        </div>
    )
}

export default File;