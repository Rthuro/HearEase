import { DashboardNotification } from "@/components/DashboardNotification"
import { Greetings } from "@/components/Greetings"

export function Dashboard() {
  return (
    <div className=" grid grid-cols-2 gap-6 p-6">
      <div className="flex col-span-2 gap-4 mt-6">
        <Greetings />
        <DashboardNotification />
      </div>
      
    </div>
  )
}
