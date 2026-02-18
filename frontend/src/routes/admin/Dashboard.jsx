import { DashboardNotification } from "@/components/DashboardNotification"
import { Greetings } from "@/components/Greetings"
import { RecentCaseRecords } from "@/components/RecentCaseRecords"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { useCaseStore } from "@/store/useCaseStore";
import { Link } from "react-router-dom"
import { PageSync } from "@/components/PageSync"
import { TableHearings } from "@/components/TableHearings"
import { useEffect } from "react";
import useHearingStore from "@/store/useHearingStore";

export function Dashboard() {
  const { userInfo, userLinkName } = useAuthenticationStore();
  const { cases, fetchCases } = useCaseStore();
  const { fetchHearings, hearings } = useHearingStore();

  useEffect(() => {
    fetchCases();
    fetchHearings();
  }, [fetchCases, fetchHearings]);

  const filterHearings = Array.isArray(hearings) 
    ? hearings.filter(h => h.hearing_status === "scheduled" || h.hearing_status === "rescheduled") 
    : [];
  
  const user = userInfo?.role === 'user' ? userLinkName : 'Admin';
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageSync page="Dashboard" />
      <div className="flex  gap-4 mt-6">
        <Greetings />
      </div>

      <div className="flex flex-col gap-4 bg-white border border-zinc-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Upcoming Hearings</h2>
          <Link to={`/Admin/Hearings`} className="text-redBase text-sm font-medium">
            View all
          </Link>
        </div>
        <TableHearings hearingsList={filterHearings} showPagination={false} navigateTo={user} />
      </div>

      <div className="flex flex-col  gap-4 bg-white border border-zinc-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Case Records</h2>
            <Link to={`/Admin/CaseRecords`} className="text-redBase text-sm font-medium">
              View all
            </Link>
          </div>
          <RecentCaseRecords cases={cases} user={user} />
      </div>
    
    </div>
  )
}
