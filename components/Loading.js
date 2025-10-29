import react from 'react'

const Loading = ({ content }) => {
    return (
        <>
            <div className="p-6 mx-auto bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-slate-900 w-fit flex flex-col items-center animate-fade-in">
                <div className="flex flex-col items-center">
                    <div className="loader animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 mb-4"></div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">{content || "Loading..."}</span>
                </div>
            </div>
        </>
    )
}

export default Loading;
