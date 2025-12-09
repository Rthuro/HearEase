import { PageSync } from "@/components/PageSync";
import { CalendarRange } from "@/components/CalendarRange";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RefreshCcw } from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api";

export function Reports() {
    const today = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(today.getMonth() - 1)

    // Initialize with default range
    const [dateRange, setDateRange] = useState({ from: oneMonthAgo, to: today })
    const [report, setReport] = useState([])

    function handleDateRange(range) {
        setDateRange(range)
    }

    function resetDateRange() {
        setDateRange({ from: oneMonthAgo, to: today })
        fetchReport();
    }

    const fetchReport = async () => {
        if (!dateRange.from || !dateRange.to) return
        const res = await axios.get(
        `${API_URL}/reports?start_date=${dateRange.from.toISOString().split("T")[0]}&end_date=${dateRange.to.toISOString().split("T")[0]}`
        )
        setReport(Array.isArray(res.data) ? res.data : [])
    }

    useEffect(() => {
        fetchReport();
    }, []);

    // console.log("Report Data:", report);

    const exportCSV = () => {
        const rows = [
            ["Month", "Pending", "Approved", "Resolved"],
            ...report.map(r => [r.month, r.pending, r.approved, r.resolved])
        ];

        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "report.csv";
        link.click();
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(report.map(r => ({
            Month: r.month,
            Pending: r.pending,
            Approved: r.approved,
            Resolved: r.resolved
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, "report.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Monthly Report", 14, 10);

        autoTable(doc, {
            head: [["Month", "Pending", "Approved", "Resolved"]],
            body: report.map(r => [r.month, r.pending, r.approved, r.resolved]),
        });

        doc.save("report.pdf");
    };


    return(
         <div className="relative flex flex-col gap-4 p-6 ">
            <PageSync page="Reports" />
            <div className="p-4 flex justify-between">
                <div className="flex items-center gap-2">
                    <CalendarRange defaultValue={dateRange} onChange={handleDateRange} />
                    <Button
                        onClick={fetchReport}
                        variant="outline"
                    >
                        Filter
                    </Button>
                    <Button
                        onClick={resetDateRange}
                        variant="outline"
                    >
                        <RefreshCcw />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <p>Export</p>
                    <Button onClick={exportCSV} variant="outline">CSV</Button>
                    <Button onClick={exportExcel} variant="outline">Excel</Button>
                    <Button onClick={exportPDF} variant="outline">PDF</Button>
                </div>
            </div>

             <div className="flex flex-col gap-6 bg-white p-4 rounded-md shadow-2xs border ">
                <h2 className="text-xl font-semibold">Monthly summary of pending, approved and resolved cases</h2>
                <BarChart width={700} height={300} data={Array.isArray(report) ? report : []}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" fill="#c0392b" />
                    <Bar dataKey="approved" fill="#2980b9" />
                    <Bar dataKey="resolved" fill="#27ae60" />
                </BarChart>
             </div>
        </div>
    );
}
