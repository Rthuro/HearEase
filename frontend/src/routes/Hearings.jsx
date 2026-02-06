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
import { useEffect } from "react";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import useHearingStore from "@/store/useHearingStore";
import { Spinner } from "@/components/ui/spinner"

export function Hearings() {
    const { fetchHearings, hearings, loading } = useHearingStore();
    const [status, setStatus] = useState("all");
    const [filteredHearings, setFilteredHearings] = useState(hearings);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchHearings();
    }, [fetchHearings]);
    
    useEffect(() => {
        setFilteredHearings(filterHearings(status));
    }, [hearings, status]);

    const { userInfo, userLinkName } = useAuthenticationStore();
    const navigateTo = userInfo?.role === 'user' ? userLinkName : 'Admin';

    const check_hearings = Array.isArray(hearings) ? hearings : [];

    const filterHearings = (status) => {
        return check_hearings.filter((hearing) => {
            if (status === "all") return check_hearings;
            return hearing.hearing_status.toLowerCase() === status;
        });
    }
    
    return (
        <div className="p-6 flex flex-col gap-2">
            <PageSync page="Hearings" />
            <h1 className="text-2xl font-bold">Hearings</h1>
            <p>You have <span className="font-medium text-redBase">{filteredHearings?.length}</span> hearings.</p>
            
            <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Search className="text-zinc-400 ml-3" size={16} />
                        <Input type="text" placeholder="Search for case..." className="w-72 -ml-6 pl-8"
                         value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Sort by
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-fit">
                            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="pending_schedule">Pending Schedule</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="scheduled">Scheduled</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="pending_decision">Pending Decision</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                { loading ? <div className="flex items-center justify-center gap-1 py-10"><Spinner /> loading...</div> : 
                <TableHearings hearingsList={filteredHearings} showPagination={true} navigateTo={navigateTo} /> }
            </section>
        </div>
    );
}