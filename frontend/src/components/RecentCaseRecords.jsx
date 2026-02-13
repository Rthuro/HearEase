// For dashboard use to show preview case records
import { Link } from "react-router-dom";
import { CaseStatusDisplay } from "./CaseStatusDisplay";
import folder_img from '@/assets/folder.png'
import { FolderOpen, Ellipsis, Check, X } from "lucide-react"

export function RecentCaseRecords({cases, user}) {
    const limitCases = cases?.slice(0, 8);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
            {cases?.length > 0 ? (
                    limitCases?.map((caseItem) => (
                        <Link to={`/${user}/Case/${caseItem?.id}`} key={caseItem?.id} className="border border-zinc-200 rounded-lg p-4 
                         hover:shadow-md transition-shadow">
                            <div className="flex justify-between">
                                <CaseStatusDisplay caseStatus={caseItem?.case_status} />
                            </div>
                            <img src={folder_img} alt="folder" className="mx-auto mb-2"/>
                            <p className="font-medium text-sm mb-1 text-center">{caseItem?.id}</p>
                            <p className="text-sm text-zinc-600 mb-1 text-center">{caseItem?.case_type.case_name}
                            </p>
                        </Link>
                    )
                )
                ) : (
                    <div className="flex flex-col gap-2 items-center justify-center mx-auto text-zinc-600 my-6">
                        <FolderOpen />
                        <p>No cases made.</p>
                    </div>
            )}
        </div>
    )
}