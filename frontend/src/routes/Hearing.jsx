import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, Pencil, Loader2, File, Download, Info, MessageSquareText } from "lucide-react";
import useHearingStore from "@/store/useHearingStore";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLuponStore } from "@/store/useLuponStore";
import { EditHearingInfo } from "@/components/EditHearingInfo";
import { Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useCaseStore } from "@/store/useCaseStore";
import { SummonConfirmationDisplay } from "@/components/SummonConfirmationDisplay,";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";
import { HearingProgressDisplay } from "@/components/HearingProgressDisplay";


export default function Hearing() {
    const { hearing_id } = useParams();
    const { hearings, updatedHearings, updateCaseHearings, loading, setUpdatedHearings, fetchHearingAttendance } = useHearingStore();
    const { cases } = useCaseStore()
    const { members } = useLuponStore();
    const navigate = useNavigate();
    const [ open, setOpen ] = useState(false);


    const hearing = hearings.find( hearing => hearing.id == hearing_id);
    const caseInfo = cases.find( c => c.id == hearing.case);
    const caseHearings = hearings.filter( h => h.case == hearing.case).sort((a, b) => a.hearing_number - b.hearing_number);
    // console.log("caseHearings", caseHearings);

    const lupon = members.find( l => l.id == hearing.lupon_member)

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    const userRole = data.userRole;

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (!updatedHearings.length) {
            toast.error("No changes to save.");
            return;
        }

        setUpdatedHearings(updatedHearings);
        await updateCaseHearings(hearing.case_id); 

        if(loading == false){
            setOpen(false);
        }

    }

    const initializedHearings = caseHearings.map((h) => {
        const dateObj = h.hearing_date ? new Date(h.hearing_date) : null;
        const foundLupon = members.find((m) => m.id === h.lupon_member);

        return {
          ...h,
          hearing_date: dateObj,
          time: h.time || "",
          lupon_member: foundLupon ? foundLupon.id : null,
        };
      });

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    
    useEffect(() => {
      setUpdatedHearings(initializedHearings);
      if(!attendanceRecords.length)
        fetchHearingAttendance(hearing.id).then(data => setAttendanceRecords(data?.data || []));

    }, []);

    // console.log("attendanceRecords", hearing);
    
    if(userRole == 'admin'){
        return (
            <div className="flex flex-col p-6 gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                            <ChevronLeft />
                        </Button>
                    </div>
                </div>

                {hearing?.remarks !== "" && hearing?.remarks !== null && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                        {/* Icon Container */}
                        <div className="bg-indigo-100 p-3 rounded-full shrink-0">
                            <MessageSquareText className="h-6 w-6 text-indigo-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-indigo-900 leading-none">
                                    Hearing Remarks
                                </h3>
                                <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                                    Record
                                </span>
                            </div>
                            
                            <p className="text-indigo-700 text-sm mt-1 flex items-center gap-1">
                                <Info size={14} className="inline" />
                                Notes, observations and updates about the hearing.

                            </p>
                            
                            {/* The Remarks Quote Box */}
                            <div className="mt-4 p-4 bg-white/60 rounded-lg border border-indigo-100 shadow-sm relative">
                                {/* Decorative Quote Mark */}
                                <span className="absolute top-2 left-2 text-indigo-200 font-serif text-4xl leading-none select-none">“</span>
                                
                                <div className="relative z-10 italic text-sm text-indigo-900 leading-relaxed px-4">
                                    {hearing?.remarks}
                                </div>
                                
                                <span className="absolute bottom-1 right-3 text-indigo-200 font-serif text-4xl leading-none select-none">”</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 bg-white p-4 rounded-lg border flex-col">
                    <h2 className="text-lg font-semibold">Hearing Information</h2>
                    <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="text-left px-4 py-2">Date</TableHead>
                            <TableHead className="text-left px-4 py-2">Time</TableHead>
                            <TableHead className="text-left px-4 py-2">Assigned Lupon</TableHead>
                            <TableHead className="text-left px-4 py-2">Status</TableHead>
                            <TableHead className="text-left px-4 py-2">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow className="border-t">
                                <TableCell className="px-4 py-2">{hearing?.hearing_date}</TableCell>
                                <TableCell className="px-4 py-2">{hearing?.time}</TableCell>
                                <TableCell className="px-4 py-2">
                                    {lupon?.first_name + lupon?.last_name || "Unassigned"}
                                </TableCell>
                                <TableCell className="px-4 py-2"> 
                                    <CaseStatusDisplay caseStatus={hearing?.hearing_status} />
                                </TableCell>
                                 <TableCell className="px-4 py-2">
                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>     
                                            <Button variant="outline">
                                                <Pencil />
                                                Edit Hearing
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className={cn('max-w-[100vw] min-w-fit')}>
                                            <DialogHeader>
                                                <DialogTitle>Edit Hearing #{hearing?.hearing_number}</DialogTitle>
                                                <DialogDescription>Edit hearing #{hearing?.hearing_number} or all hearings information.</DialogDescription>
                                            </DialogHeader>
                                                <div className=" overflow-y-auto max-h-[70vh] min-w-fit p-3">
                                                <EditHearingInfo hearing_number={hearing?.hearing_number} luponMembers={members} hearings={caseHearings} />
                                            </div>
                                            <DialogFooter>
                                             <Button 
                                                onClick={handleSaveChanges} 
                                                disabled={loading} // Disable while saving
                                                className="bg-redBase hover:bg-red-700 text-white"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save Changes"
                                                )}
                                            </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    </div>
    
                     { hearing?.hearing_status !== 'completed' && (
                        <div className="flex gap-3 self-end">
                            <Button variant="outline" className={cn("text-redBase")}>
                                Cancel Hearing
                            </Button>
                        </div>
                    )}
                    
                </div>

                <div className="flex gap-3 bg-white p-4 rounded-lg border flex-col">
                    <h2 className="text-lg font-semibold">Hearing Attendance</h2>
                    <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="text-left px-4 py-2">Name</TableHead>
                            <TableHead className="text-left px-4 py-2">Role</TableHead>
                            <TableHead className="text-left px-4 py-2">Attendance Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                                {attendanceRecords.length > 0 && attendanceRecords.map((record) => (
                                    <TableRow key={record.id} className="border-t">
                                        <TableCell className="px-4 py-2">
                                            {record?.case_person ? `${record?.case_person?.first_name} 
                                            ${record?.case_person?.last_name}` : `${record?.lupon_member ? `${record?.lupon_member?.first_name} ${record?.lupon_member?.last_name}` : "Unknown"}`}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">{record?.participant_role}</TableCell>
                                        <TableCell className="px-4 py-2">{record?.attendance_status}</TableCell>
                                    </TableRow>
                                ))}
                                {!attendanceRecords.length && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="px-4 py-2 text-center">
                                            No attendance recorded.
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                    </div>
                    
                </div>

                { hearing?.hearing_number == 1 && caseInfo?.summon_status != 'served' && (
                    <SummonConfirmationDisplay hearing={hearing} caseInfo={caseInfo} />
                )}   

                { caseInfo?.summon_status == 'served' && hearing?.hearing_status == 'scheduled' && (
                    <HearingProgressDisplay hearing={hearing} case_complainants={caseInfo?.complainants} case_respondents={caseInfo?.respondents} case_organization_complainants={caseInfo?.organization_complainants} case_organization_respondents={caseInfo?.organization_respondents} case_hearings={caseHearings}/>
                )}          
            </div>
        )
    } else {
        return (
            <div className="flex flex-col p-6 gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                            <ChevronLeft />
                        </Button>
                    </div>
                </div>
                {hearing?.remarks !== "" && hearing?.remarks !== null && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                        {/* Icon Container */}
                        <div className="bg-indigo-100 p-3 rounded-full shrink-0">
                            <MessageSquareText className="h-6 w-6 text-indigo-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-indigo-900 leading-none">
                                    Hearing Remarks
                                </h3>
                                <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                                    Record
                                </span>
                            </div>
                            
                            <p className="text-indigo-700 text-sm mt-1 flex items-center gap-1">
                                <Info size={14} className="inline" />
                                Notes, observations and updates about the hearing.
                            </p>
                            
                            {/* The Remarks Quote Box */}
                            <div className="mt-4 p-4 bg-white/60 rounded-lg border border-indigo-100 shadow-sm relative">
                                {/* Decorative Quote Mark */}
                                <span className="absolute top-2 left-2 text-indigo-200 font-serif text-4xl leading-none select-none">“</span>
                                
                                <div className="relative z-10 italic text-sm text-indigo-900 leading-relaxed px-4">
                                    {hearing?.remarks}
                                </div>
                                
                                <span className="absolute bottom-1 right-3 text-indigo-200 font-serif text-4xl leading-none select-none">”</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 bg-white p-4 rounded-lg border flex-col">
                    <h2 className="text-xl font-semibold">Hearing Information</h2>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="text-left px-4 py-2">Date</TableHead>
                                <TableHead className="text-left px-4 py-2">Time</TableHead>
                                <TableHead className="text-left px-4 py-2">Complainant</TableHead>
                                <TableHead className="text-left px-4 py-2">Respondent</TableHead>
                                <TableHead className="text-left px-4 py-2">Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                <TableRow className="border-t">
                                    <TableCell className="px-4 py-2">{hearing.hearing_date}</TableCell>
                                    <TableCell className="px-4 py-2">{hearing.time}</TableCell>
                                    <TableCell className="px-4 py-2">hearing attendance</TableCell>
                                    <TableCell className="px-4 py-2">hearing attendance</TableCell>
                                    <TableCell className="px-4 py-2"> <CaseStatusDisplay caseStatus={hearing.hearing_status} /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>        
                    
                </div>
                <div className="flex gap-3 bg-white p-4 rounded-lg border flex-col">
                    <h2 className="text-lg font-semibold">Hearing Attendance</h2>
                    <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="text-left px-4 py-2">Name</TableHead>
                            <TableHead className="text-left px-4 py-2">Role</TableHead>
                            <TableHead className="text-left px-4 py-2">Attendance Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                                {attendanceRecords.length > 0 && attendanceRecords.map((record) => (
                                    <TableRow key={record.id} className="border-t">
                                        <TableCell className="px-4 py-2">
                                            {record?.case_person ? `${record?.case_person?.first_name} 
                                            ${record?.case_person?.last_name}` : `${record?.lupon_member ? `${record?.lupon_member?.first_name} ${record?.lupon_member?.last_name}` : "Unknown"}`}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">{record?.participant_role}</TableCell>
                                        <TableCell className="px-4 py-2">{record?.attendance_status}</TableCell>
                                    </TableRow>
                                ))}
                                {!attendanceRecords.length && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="px-4 py-2 text-center">
                                            No attendance recorded.
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                    </div>
                    
                </div>

            </div>
        )
    }
    
}


