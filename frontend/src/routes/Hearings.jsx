import { TableHearings } from "@/components/TableHearings";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageSync } from "@/components/PageSync";
import { useCaseStore } from "@/store/useCaseStore";
import { useEffect } from "react";
import useAuthenticationStore from "@/store/useAuthenticationStore";

export function Hearings() {
    const { getCases } = useCaseStore();
    const [status, setStatus] = useState("all");
    const [cases, setCases] = useState(getCases());

    useEffect(() => {
        setCases(getCases());
    }, [getCases]);

    const { userInfo, userLinkName } = useAuthenticationStore();
    const navigateTo = userInfo?.role === 'user' ? userLinkName : 'Admin';

    return (
        <div className="p-6 flex flex-col gap-2">
            <PageSync page="Hearings" />
            <h1 className="text-2xl font-bold">Hearings</h1>
            <p>You have <span className="font-medium text-redBase">0</span> upcoming hearings.</p>
            
            
            <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Search className="text-zinc-400 ml-3" size={16} />
                        <Input type="text" placeholder="Search for case..." className="w-72 -ml-6 pl-8" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Sort by
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-38">
                            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="upcoming">Pending</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="upcoming">Upcoming</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="past">Past</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="escalated">Escalated</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <TableHearings hearings={cases} showPagination={true} navigateTo={navigateTo} />
            </section>
        </div>
    );
}