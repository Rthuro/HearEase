import { Input } from "@/components/ui/input";
import { Search, Menu, LayoutGrid, FolderOpen } from 'lucide-react'
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageSync } from "@/components/PageSync";
import { cn } from "@/lib/utils";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import { Link } from "react-router-dom";
import folder_img from '@/assets/folder.png'
import { useEffect } from "react";
import { cases } from "@/test/data";

export function CaseRecords(){
    const { userLinkName } = useAuthenticationStore();
    const [status, setStatus] = useState("all");

    // Table view: 1 - row, 2 - box
    const [view, setView] = useState(2);
    

    const [filteredCases, setFilteredCases] = useState(cases);

    // Update filteredCases when status changes
    useEffect(() => {
        setFilteredCases(
            status === "all" ? cases : cases.filter(c => c.status === status)
        );
    }, [status]);

    return (
        <div className="p-6 flex flex-col gap-2">
            <PageSync page="My Case Records" />
            <h1 className="text-2xl font-bold">My Case Records</h1>
            <p>You have <span className="font-medium text-redBase">0</span> cases.</p>
             <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Search className="text-zinc-400 ml-3" size={16} />
                        <Input type="text" placeholder="Search for case..." className="w-72 -ml-6 pl-8" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <Button variant="outline" onClick={() => setView(1)}
                            className={cn(`rounded-r-none ${view == 1 ? 'bg-zinc-100 text-zinc-500':''}`)}>
                                <Menu />
                            </Button>
                            <Button variant="outline" onClick={() => setView(2)}
                            className={cn(`rounded-l-none ${view == 2 ? 'bg-zinc-100 text-zinc-500':''}`)}>
                                <LayoutGrid />
                            </Button>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Sort by
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-38">
                                <DropdownMenuRadioGroup value={status} onValueChange={ (s) => {
                                    setStatus(s);
                                }}>
                                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="pending">pending</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="in_progress">In progress</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="resolved">Resolved</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="escalated">Escalated</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="rejected">Rejected</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>  
                </div>
                <section className="flex flex-col gap-6">
                    {view == 1 && (
                        <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Case #</TableHead>
                                            <TableHead>Nature of Complaint</TableHead>
                                            <TableHead>Hearing Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCases.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <p className="text-center">No cases made.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredCases.map((hearing) => (
                                                <TableRow key={hearing.case_number} className={cn("text-zinc-700")}>
                                                    <TableCell>{hearing.case_number}</TableCell>
                                                    <TableCell>{hearing.nature}</TableCell>
                                                    <TableCell>{new Date(hearing.date).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <CaseStatusDisplay caseStatus={hearing.case_status} />
                                                    </TableCell>
                                                    <TableCell className={cn("py-4")}>
                                                        <Link to={`/${userLinkName}/Hearings/${hearing.id}`} className="text-redBase bg-red-50 px-3 py-2 rounded-lg text-xs">
                                                            Details 
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                        </div>
                    )}

                    {view == 2 && (
                        <div className="flex items-center flex-wrap gap-3 ">
                            {filteredCases.length > 0 ? (
                                    filteredCases.map((hearing) => (
                                        <Link to={`/${userLinkName}/Hearings/${hearing.case_number}`} key={hearing.case_number} className="border border-zinc-200 rounded-lg p-4 w-60 hover:shadow-md transition-shadow">
                                            <CaseStatusDisplay caseStatus={hearing.status} />
                                            <img src={folder_img} alt="folder" className="mx-auto mb-2"/>
                                            <p className="font-medium text-sm mb-1 text-center">{hearing.case_number}</p>
                                            <p className="text-sm text-zinc-600 mb-1 text-center">{hearing.nature}
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
                    )}

                    {cases.length > 0 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                <PaginationPrevious href="#" />
                                </PaginationItem>
                                <PaginationItem>
                                <PaginationLink href="#">1</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                <PaginationNext href="#" />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </section>
            </section>
            
        </div>
    )
}