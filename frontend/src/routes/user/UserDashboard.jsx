import { DashboardNotification } from "@/components/DashboardNotification"
import { Greetings } from "@/components/Greetings"
import { UserHearings } from "@/components/user_ui/UserHearings"
import { Link } from "react-router-dom"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { PageSync } from "@/components/PageSync"

export function UserDashboard() {
  const { userLinkName } = useAuthenticationStore();

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
        <UserHearings hearings={[]} showPagination={false} />
      </div>
    </div>
  )
}