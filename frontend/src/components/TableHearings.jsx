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
import { formatedBday } from "@/lib/helpers";
import { CountdownSpan } from "./CountdownSpan";

export function TableHearings({ hearingsList, showPagination, navigateTo }) {
    let hearings = [];

    if (Array.isArray(hearingsList)) {
        hearings = hearingsList;
    } else {
        hearings = [];
    }

    return (
        <section className="flex flex-col gap-6">
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Case #</TableHead>
                            <TableHead>Hearing Date</TableHead>
                            <TableHead>Hearing Number</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {  hearings?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <p className="text-center">No hearings scheduled.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            hearings?.map((hearing) => (
                                <TableRow key={hearing?.id} className="text-zinc-700">
                                    <TableCell>
                                        <Link to={`/${navigateTo}/Case/${hearing?.case}`} className="text-redBase underline">
                                        {hearing?.case}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {formatedBday(hearing?.hearing_date) ?? '-'}
                                        {' '} 
                                        <CountdownSpan dateString={hearing?.hearing_date} />
                                    </TableCell>
                                    <TableCell>
                                        {hearing?.hearing_number ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        {hearing?.time ?? '-'} 
                                    </TableCell>
                                    <TableCell>
                                        <CaseStatusDisplay caseStatus={hearing?.hearing_status}
                                        />
                                    </TableCell>
                                    <TableCell className={cn("py-4")}>
                                        <Link to={`/${navigateTo}/Hearing/${hearing?.id}`} className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm">
                                            Details 
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && hearings.length > 0 && (
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