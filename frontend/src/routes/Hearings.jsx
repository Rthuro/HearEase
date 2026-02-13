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
import { useEffect, useMemo } from "react";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import useHearingStore from "@/store/useHearingStore";
import { Spinner } from "@/components/ui/spinner"
import { AppPagination } from "@/components/Pagination";

export function Hearings() {
    const { fetchHearings, hearings, loading } = useHearingStore();
    const [status, setStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [hearingNum, setHearingNum] = useState(0);
    const [displayedHearings, setDisplayedHearings] = useState([]);

    useEffect(() => {
        fetchHearings();
    }, [fetchHearings]);

    const { userInfo, userLinkName } = useAuthenticationStore();
    const navigateTo = userInfo?.role === 'user' ? userLinkName : 'Admin';

    const filteredHearings = useMemo(() => {
            return hearings.filter((h) => {
            const query = searchQuery.toLowerCase().trim();
            const id = String(h.case).toLowerCase();
        
            const matchesSearch = id.includes(query) || h.case.includes(query);
            const matchesStatus = status === "all" || h.hearing_status === status;
            const matchesHearingNum = hearingNum === 0 || h.hearing_number === hearingNum;
    
            return matchesSearch && matchesStatus && matchesHearingNum;
            });
        }, [hearings, searchQuery, status, hearingNum]);
    
    return (
        <div className="p-6 flex flex-col gap-2">
            <PageSync page="Hearings" />
            <h1 className="text-2xl font-bold">Hearings</h1>
            <p>You have <span className="font-medium text-redBase">{hearings?.length}</span> hearings.</p>
            
            <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Search className="text-zinc-400 ml-3" size={16} />
                        <Input type="text" placeholder="Search for case..." className="w-72 -ml-6 pl-8"
                         value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Sort by Hearing Number
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-fit">
                                <DropdownMenuRadioGroup value={hearingNum} onValueChange={setHearingNum}>
                                <DropdownMenuRadioItem value={0} >All Hearings</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value={1}>1</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value={2}>2</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value={3}>3</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value={4}>4</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value={5}>5</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value={6}>6</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                </div>
                { loading ? <div className="flex items-center justify-center gap-1 py-10"><Spinner /> loading...</div> : 
                <TableHearings hearingsList={displayedHearings} showPagination={false} navigateTo={navigateTo} /> }
                <AppPagination 
                    items={filteredHearings} 
                    searchQuery={searchQuery} 
                    setPagedItems={setDisplayedHearings} 
                />
            </section>
        </div>
    );
}