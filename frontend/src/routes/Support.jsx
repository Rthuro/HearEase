import { SupportTickets } from "@/components/SupportTickets";
import { PageSync } from "@/components/PageSync";

export function Support() {
    return (
        <div className="flex flex-col gap-6 p-6 ">
            <PageSync page="Support" />
            <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>

            <div className="bg-white p-4 border rounded-lg">
                <SupportTickets />
            </div>
        </div>
    )
}