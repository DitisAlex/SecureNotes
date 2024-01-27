const Content = (props: { currentContent: string }): JSX.Element => {
    return (
        <div className="p-10">
            <h3 className="mb-2 text-l font-bold">Your encrypted note contained the following message:</h3>
            <div className="my-4 border-b-2 border-dotted " />
            <div className="text-body text-xl leading-normal">{props.currentContent}</div>
            <div className="my-4 border-b-2 border-dotted " />
            <div className="text-sm italic text-[--text-color-secondary]">
                Please note that once you have refreshed or closed this page, you will not be able to view this information again.
            </div>
        </div>
    )
}

export default Content;