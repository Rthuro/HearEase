// For dashboard use to show preview case records
import { Link } from "react-router-dom";
import { CaseStatusDisplay } from "./CaseStatusDisplay";
import folder_img from '@/assets/folder.png'
import { FolderOpen } from "lucide-react"

export function RecentCaseRecords({cases, user}) {

    return (
        <div className="flex items-center flex-wrap gap-3 ">
            {cases?.length > 0 ? (
                    cases?.map((caseItem) => (
                        <Link to={`/${user}/Case/${caseItem.id}`} key={caseItem.id} className="border border-zinc-200 rounded-lg p-4 w-60 hover:shadow-md transition-shadow">
                            <CaseStatusDisplay caseStatus={caseItem.case_status} />
                            <img src={folder_img} alt="folder" className="mx-auto mb-2"/>
                            <p className="font-medium text-sm mb-1 text-center">{caseItem.id}</p>
                            <p className="text-sm text-zinc-600 mb-1 text-center">{caseItem.case_type.case_name}
                            </p>
                        </Link>
                    )
                )
                ) : (
                    <div className="flex flex-col gap-2 items-center mx-auto text-zinc-600 my-6">
                        <FolderOpen />
                        <p>No cases made.</p>
                    </div>
            )}
        </div>
    )
}