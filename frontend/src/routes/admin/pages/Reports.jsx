import { PageSync } from "@/components/PageSync";
import { CalendarRange } from "@/components/CalendarRange";
import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid ,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RefreshCcw,  } from "lucide-react";
import toast from "react-hot-toast";
import { 
  Briefcase, 
  Activity, 
  CheckCircle2, 
  Timer, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatedDateToString } from "@/lib/helpers";
import ExcelJS from 'exceljs';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];
export function Reports() {
    const today = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(today.getMonth() - 1)

    // Initialize with default range
    const [dateRange, setDateRange] = useState({ from: oneMonthAgo, to: today })
    const [report, setReport] = useState([])
    const [stats, setStats] = useState({})

    function handleDateRange(range) {
        setDateRange(range)
    }

    function resetDateRange() {
        setDateRange({ from: oneMonthAgo, to: today })
        fetchReport();
    }

    const fetchReport = () => {
        if (!dateRange.from || !dateRange.to) return
        toast.promise(
            axios.get(
                `${API_URL}/reports?start_date=${dateRange.from.toISOString().split("T")[0]}&end_date=${dateRange.to.toISOString().split("T")[0]}`
            ),
            {
                loading: "Fetching report data...",
                success: (res) => {
                    setReport(Array.isArray(res.data.monthly_sum_result) ? res.data.monthly_sum_result : [])
                    setStats(res.data || {})
                    console.log(res.data)
                    return "Report data fetched successfully"
                },
                error: "Failed to fetch report data"
            }
        )
    }

    useEffect(() => {
        fetchReport();
    }, []);

    const cardConfig = [
        {
            title: "Total Case Volume",
            value: stats?.total_cases,
            icon: Briefcase,
            description: "Cases filed in selected period",
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "Active / Ongoing",
            value: stats?.active_cases,
            icon: Activity,
            description: "Requires immediate attention",
            color: "text-amber-600",
            bg: "bg-amber-100",
        },
        {
            title: "Settlement Rate",
            value: stats?.settlement_rate,
            icon: CheckCircle2,
            description: "Cases resolved successfully",
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Avg. Resolution Time",
            value: stats?.avg_resolution_time,
            icon: Timer,
            description: "From filing to closure",
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
    ];

    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('System Report');

        // 2. OVERALL SUMMARY SECTION
        const titleRow = worksheet.addRow(['OVERALL SUMMARY']);
        titleRow.font = { bold: true, size: 14 };
        
        worksheet.addRow(['Total Case Volume', stats.total_cases || 0]);
        worksheet.addRow(['Active / Ongoing', stats.active_cases || 0]);
        worksheet.addRow(['Settlement Rate', stats.settlement_rate || '0%']);
        worksheet.addRow(['Avg. Resolution Time', stats.avg_resolution_time || '0 Days']);
        worksheet.addRow([]); // Spacer

        // 3. MONTHLY TRENDS SECTION
        const headerRow = worksheet.addRow(['MONTHLY TRENDS', 'Pending', 'Approved', 'In Progress', 'Resolved', 'Escalated']);
        
        // Style the table header
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } }; // Dark Blue
            cell.alignment = { horizontal: 'center' };
        });

        // Add data rows from 'report'
        report.forEach(r => {
            worksheet.addRow([
                r.month, 
                r.pending, 
                r.approved, 
                r.in_progress, 
                r.resolved, 
                r.escalated
            ]);
        });
        worksheet.addRow([]); // Spacer

        // 4. CATEGORICAL BREAKDOWN (Case Type)
        const typeHeader = worksheet.addRow(['CASE TYPE BREAKDOWN', 'Total Cases']);
        typeHeader.font = { bold: true };
        
        stats?.by_type_data?.forEach(t => {
            worksheet.addRow([t.name, t.value]);
        });
        worksheet.addRow([]); // Spacer

        // 5. CATEGORICAL BREAKDOWN (Location)
        const locHeader = worksheet.addRow(['LOCATION BREAKDOWN', 'Total Cases']);
        locHeader.font = { bold: true };

        stats?.by_location_data?.forEach(l => {
            worksheet.addRow([l.name, l.value]);
        });

        // 6. GENERATE AND DOWNLOAD FILE
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
        };

    const exportPDF = () => {
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text("System Performance Report", 14, 15);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(
                `Period: ${formatedDateToString(dateRange.from)} to ${formatedDateToString(dateRange.to)}`, 
                14, 22
            );

            autoTable(doc, {
                startY: 30,
                head: [["Total Case Volume", "Active / Ongoing", "Settlement Rate", "Avg. Resolution Time"]],
                body: [
                    [
                        stats.total_cases || 0, 
                        stats.active_cases || 0, 
                        stats.settlement_rate || "0%", 
                        stats.avg_resolution_time || "0 Days"
                    ]
                ],
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }, // Professional Blue
            });

            doc.setFontSize(14);
            doc.setTextColor(0);

            let finalY = doc.lastAutoTable.finalY; 
            doc.text("Monthly Summary", 14, finalY + 15);

            autoTable(doc, {
                startY: finalY + 20,
                head: [["Month", "Pending", "Approved", "In Progress", "Resolved", "Escalated"]],
                body: report.map(r => [r.month, r.pending, r.approved, r.in_progress, r.resolved, r.escalated]),
                headStyles: { fillColor: [44, 62, 80] },
            });

            finalY = doc.lastAutoTable.finalY;
            doc.text("Cases by Complaint Type", 14, finalY + 15);
            autoTable(doc, {
                startY: finalY + 20,
                head: [["Case Type", "Total Cases"]],
                body: stats?.by_type_data?.map(r => [r.name, r.value]) || [],
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94] },
            });

            finalY = doc.lastAutoTable.finalY;
            doc.text("Cases by Location", 14, finalY + 15);
            autoTable(doc, {
                startY: finalY + 20,
                head: [["Location", "Total Cases"]],
                body: stats?.by_location_data?.map(r => [r.name, r.value]) || [],
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94] },
            });

            doc.save(`Report_${formatedDateToString(dateRange.from)}.pdf`);
    };
    // const exportPDF = async () => {
    //         const element = document.getElementById("reports_section");
    //         if (!element) return;

    //          try {
    //         // Capture the element as a PNG data URL
    //         const dataUrl = await toPng(element, { 
    //             cacheBust: true,
    //             backgroundColor: "#ffffff", // Ensures the PDF isn't transparent
    //         });

    //         const pdf = new jsPDF("p", "mm", "a4");
    //         const pdfWidth = pdf.internal.pageSize.getWidth();
    //         const pdfHeight = pdf.internal.pageSize.getHeight();

    //         // Create an image object to get actual dimensions
    //         const img = new Image();
    //         img.src = dataUrl;
    //         img.onload = () => {
    //             const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
    //             const imgW = img.width * ratio;
    //             const imgH = img.height * ratio;

    //             pdf.addImage(dataUrl, "PNG", 0, 0, imgW, imgH);
    //             pdf.save("System_Report.pdf");
    //         };
    //     } catch (error) {
    //         console.error("Oops, something went wrong!", error);
    //     }
    // };


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
                    <Button onClick={exportExcel} variant="outline">Excel</Button>
                    <Button onClick={exportPDF} variant="outline">PDF</Button>
                </div>
            </div>
            <section id="reports_section" className="flex flex-col gap-4">

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {cardConfig.map((item, index) => (
                        <Card key={index} className="border-l-4 border-l-transparent hover:border-l-redBase transition-all shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                            {item.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{item.value ?? 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                            </p>
                        </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col gap-6 bg-white p-4 rounded-md shadow-2xs border ">
                    <h2 className="text-xl font-semibold">Monthly summary of pending, approved, in progress, resolved and escalated cases</h2>
                    <BarChart width={700} height={300} data={Array.isArray(report) ? report : []}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pending" fill="#c0392b" />
                        <Bar dataKey="approved" fill="#2980b9" />
                        <Bar dataKey="in_progress" fill="#f39c12" />
                        <Bar dataKey="resolved" fill="#27ae60" />
                        <Bar dataKey="escalated" fill="#8e44ad" />
                    </BarChart>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* --- CHART 1: NATURE OF COMPLAINT (PIE) --- */}
                    <Card>
                        <CardHeader>
                        <CardTitle>Nature of Disputes</CardTitle>
                        <CardDescription>Breakdown of cases by complaint type</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="h-[300px] w-full mb-4">
                            {stats?.by_type_data?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.by_type_data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60} // Makes it a Donut Chart (Modern look)
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                    {stats?.by_type_data?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No data available for this period.
                                </div>
                            )}
                        </div>
                        </CardContent>
                    </Card>

                    {/* --- CHART 2: CASES BY LOCATION/PUROK (BAR) --- */}
                    <Card>
                        <CardHeader>
                        <CardTitle>Case Hotspots</CardTitle>
                        <CardDescription>Top 10 Streets with most cases</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="h-[300px] w-full">
                            {stats?.by_location_data?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical" // Horizontal Bars are better for long street names
                                    data={stats?.by_location_data}
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={100} 
                                        tick={{fontSize: 12}} 
                                        tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No location data found.
                                </div>
                            )}
                        </div>
                        </CardContent>
                    </Card>
                </div>

            </section>
        </div>
    );
}
