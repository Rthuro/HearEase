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
import { Link } from "react-router-dom";
import { CaseStatusDisplay } from "./CaseStatusDisplay";
import { cn } from "@/lib/utils";
import useHearingStore from "@/store/useHearingStore";

export function TableHearings({hearingsList, showPagination, navigateTo}) {
    const { hearings } = useHearingStore();

    const findHearingCase = (case_id) => {
        const filteredHearing = hearings.find( hearing => hearing.case == case_id);
        return filteredHearing
    }

    return(
        <section className="flex flex-col gap-6">
                <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Case #</TableHead>
                                    <TableHead>Nature of Complaint</TableHead>
                                    <TableHead>Hearing Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hearingsList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <p className="text-center">No hearings scheduled.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    hearingsList.map((hearing) => (
                                        <TableRow key={hearing?.id} className="text-zinc-700">
                                            <TableCell>{hearing?.id}</TableCell>
                                            <TableCell>
                                                {hearing?.case_type?.case_name ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {findHearingCase(hearing?.id)?.hearing_date ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {findHearingCase(hearing?.id)?.time ?? '-'} 
                                            </TableCell>
                                            <TableCell>
                                                <CaseStatusDisplay caseStatus={findHearingCase(hearing?.id)?.hearing_status}
                                                />
                                            </TableCell>
                                            <TableCell className={cn("py-4")}>
                                                <Link to={`/${navigateTo}/Case/${hearing?.id}`} className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm">
                                                    Details 
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                </div>

                {showPagination && hearingsList.length > 0 && (
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
    );

}