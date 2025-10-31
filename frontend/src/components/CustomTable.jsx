import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "react-router-dom";
import { CaseStatusDisplay } from "./CaseStatusDisplay";

export function CustomTable({headers, datas, emptyDataMessage}) {

    return(
        <section className="flex flex-col gap-6">
                <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {headers.map((header) => (
                                        <TableHead key={header}>{header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {datas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={headers.length}>
                                            <p className="text-center">{emptyDataMessage}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    datas.map((data, key) => (
                                        <TableRow key={key} className="text-zinc-700">
                                            {Object.entries(data).map(([key, value]) => {
                                                // Skip case_number (since it's used as key), url, and status
                                                if (key === "case_number" || key === "url" || key === "status") return null;

                                                return (
                                                <TableCell key={key}>
                                                    {String(value)} 
                                                </TableCell>
                                                );
                                            })}

                                            {data?.status && (
                                                <TableCell>
                                                <CaseStatusDisplay caseStatus={data?.status} />
                                                </TableCell>
                                            )}

                                            {data?.url && (
                                                <TableCell className="py-4">
                                                <Link
                                                    to={data.url}
                                                    className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm"
                                                >
                                                    Details
                                                </Link>
                                                </TableCell>
                                            )}
                                            </TableRow>

                                    ))
                                )}
                            </TableBody>
                        </Table>
                </div>
        </section>
    );

}