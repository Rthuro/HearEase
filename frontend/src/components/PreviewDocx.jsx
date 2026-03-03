import { FileText } from "lucide-react"

export function PreviewDocx({ blob , blobRef}) {

    // useEffect(() => {
    //     if (blob && blobRef.current && type === 'generate') {
    //         renderAsync(blob, blobRef.current, undefined, {
    //             className: "docx-container",
    //             inWrapper: false,
    //         });
    //     }
    // }, [blob]);

    return (
        <div className="xl:col-span-8 flex flex-col">
          <div className="bg-gray-200 rounded-xl p-2 lg:p-8 flex justify-center overflow-auto min-h-[800px] border-4 border-dashed border-gray-300">
            {blob ? (
              <div 
                ref={blobRef} 
                className="bg-white shadow-2xl w-full max-w-[210mm] p-2 overflow-hidden"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <FileText size={64} strokeWidth={1} />
                <p className="mt-4">Upload a .docx file to see the live preview</p>
              </div>
            )}
          </div>
        </div>
    )
}