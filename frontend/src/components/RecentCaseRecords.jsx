// For dashboard use to show preview case records
import { Link } from "react-router-dom";
import { CaseStatusDisplay } from "./CaseStatusDisplay";
import folder_img from '@/assets/folder.png'
import { FolderOpen, Ellipsis, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCaseStore } from "@/store/useCaseStore";

export function RecentCaseRecords({cases, user}) {
    const { deleteCase } = useCaseStore();

    return (
        <div className="flex items-center flex-wrap gap-3 ">
            {cases?.length > 0 ? (
                    cases?.map((caseItem) => (
                        <Link to={`/${user}/Case/${caseItem?.id}`} key={caseItem?.id} className="border border-zinc-200 rounded-lg p-4 w-60 hover:shadow-md transition-shadow">
                            <div className="flex justify-between">
                                <CaseStatusDisplay caseStatus={caseItem?.case_status} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild  >
                                        <Ellipsis />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-fit" align="end">
                                            {caseItem?.case_status != 'filed' ? (
                                                <div>
                                                    <DropdownMenuItem value="archive">Archive</DropdownMenuItem>
                                                    {caseItem?.case_status === 'pending_approval' && (
                                                        <DropdownMenuItem value="delete" onClick={() => deleteCase(caseItem?.id)}>Delete</DropdownMenuItem>
                                                    )}
                                                </div>
                                            ):(
                                                <div>
                                                    <DropdownMenuItem value="approve">
                                                        <Check />
                                                        Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem value="cancel">
                                                        <X />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                </div>
                                            )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <img src={folder_img} alt="folder" className="mx-auto mb-2"/>
                            <p className="font-medium text-sm mb-1 text-center">{caseItem?.id}</p>
                            <p className="text-sm text-zinc-600 mb-1 text-center">{caseItem?.case_type.case_name}
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