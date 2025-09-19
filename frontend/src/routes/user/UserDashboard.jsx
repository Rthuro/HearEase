import { DashboardNotification } from "@/components/DashboardNotification"
import { Greetings } from "@/components/Greetings"
import { UserHearings } from "@/components/user_ui/UserHearings"
import { Link } from "react-router-dom"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { PageSync } from "@/components/PageSync"
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay"
import folder_img from '@/assets/folder.png'
import { FolderOpen } from "lucide-react"
// import { cases } from "@/test/data"
import { useFormStore } from "@/store/useFormStore"
import { getNatureLabel } from "@/lib/helpers"

export function UserDashboard() {
  const { userLinkName } = useAuthenticationStore();
  const { getCases } = useFormStore();
  const formatCases = getCases().splice(0,5);
 
  return (
    <div className=" grid grid-cols-2 gap-6 p-6">
      <PageSync page="Home" />
      
      <div className="flex col-span-2 gap-4 mt-6">
        <Greetings />
        <DashboardNotification />
      </div>
      <div className="flex flex-col col-span-2 gap-4 bg-white border border-zinc-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Upcoming Hearings</h2>
          <Link to={`/${userLinkName}/Hearings`} className="text-redBase text-sm font-medium">
            View all
          </Link>
        </div>
        <UserHearings hearings={formatCases} showPagination={false} />
      </div>
      <div className="flex flex-col col-span-2 gap-4 bg-white border border-zinc-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Case Records</h2>
            <Link to={`/${userLinkName}/CaseRecords`} className="text-redBase text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="flex items-center flex-wrap gap-3 ">
            {formatCases?.length > 0 ? (
                    formatCases?.map((caseItem) => (
                        <Link to={`/${userLinkName}/Hearings/${caseItem.case_number}`} key={caseItem.case_number} className="border border-zinc-200 rounded-lg p-4 w-60 hover:shadow-md transition-shadow">
                            <CaseStatusDisplay caseStatus={caseItem.case_status} />
                            <img src={folder_img} alt="folder" className="mx-auto mb-2"/>
                            <p className="font-medium text-sm mb-1 text-center">{caseItem.case_number}</p>
                            <p className="text-sm text-zinc-600 mb-1 text-center">{getNatureLabel(caseItem?.nature_of_complaint_code)}
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
      </div>
    </div>
  )
}