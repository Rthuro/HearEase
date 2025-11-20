import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
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
import { ChevronLeft, Edit } from "lucide-react";
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

export default function Hearing() {
    const { hearing_id } = useParams();
    const { hearings } = useHearingStore();
    const { members } = useLuponStore();
    const navigate = useNavigate();
    const [time, setTime] = useState(0); 
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);
    const [ complainantAttendance, setComplainantAttendance ] = useState("present");
    const [ respondentAttendance, setRespondentAttendance ] = useState("present");
    const [ luponAttendance, setLuponAttendance ] = useState("present");

    const hearing = hearings.find( hearing => hearing.id == hearing_id);
    const lupon = members.find( l => l.id == hearing.lupon_member)

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    const userRole = data.userRole;

    const startTimer = () => {
        if (running) return; // prevent double interval
        setRunning(true);

        intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(intervalRef.current);
        setRunning(false);
    };

    const resetTimer = () => {
        clearInterval(intervalRef.current);
        setRunning(false);
        setTime(0);
    };

    // Format seconds to MM:SS
    const formatTime = () => {
        const mins = String(Math.floor(time / 60)).padStart(2, "0");
        const secs = String(time % 60).padStart(2, "0");
        return `${mins}:${secs}`;
    };

    
    if(userRole == 'admin'){
        return (
            <div className="flex flex-col p-6 gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                            <ChevronLeft />
                        </Button>
                    </div>
                    <Button variant="outline">
                        Save Hearing
                    </Button>
                </div>

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
                                <TableCell className="px-4 py-2">{hearing.hearing_date}</TableCell>
                                <TableCell className="px-4 py-2">{hearing.time}</TableCell>
                                <TableCell className="px-4 py-2">
                                    {lupon?.first_name + lupon?.last_name}
                                </TableCell>
                                <TableCell className="px-4 py-2"> 
                                    <CaseStatusDisplay caseStatus={hearing.hearing_status} />
                                </TableCell>
                                 <TableCell className="px-4 py-2">
                                    <Button variant="outline">
                                        <Edit />
                                        Edit Hearing
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    </div>
                    
                    {/* { hearing.hearing_status == 'scheduled' && (
                        <div className="flex gap-3 self-end">
                            <Button className={cn("bg-redBase")}>
                                Reschedule Hearing
                            </Button>
                            <Button variant="outline" className={cn("text-redBase")}>
                                Cancel Hearing
                            </Button>
                        </div>
                    )} */}
                    <div className="flex gap-3 self-end">
                        <Button className={cn("bg-redBase")}>
                            Reschedule Hearing
                        </Button>
                        <Button variant="outline" className={cn("text-redBase")}>
                            Cancel Hearing
                        </Button>
                    </div>
                    
                </div>

                <div className="flex flex-col gap-2 p-4 border bg-white shadow-2xs rounded-md">
                    <h2 className="text-lg font-semibold">Hearing Attendance</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <p>Lupon</p>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">{luponAttendance == 'present' ? "Present" : "No-show"}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={luponAttendance} onValueChange={setLuponAttendance}>
                                <DropdownMenuRadioItem value="present">Present</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="no-show">No-show</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p>Complainant</p>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">{complainantAttendance == 'present' ? "Present" : "No-show"}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={complainantAttendance} onValueChange={setComplainantAttendance}>
                                <DropdownMenuRadioItem value="present">Present</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="no-show">No-show</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p>Respondent</p>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">{respondentAttendance == 'present' ? "Present" : "No-show"}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={respondentAttendance} onValueChange={setRespondentAttendance}>
                                <DropdownMenuRadioItem value="present">Present</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="no-show">No-show</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="flex flex-col p-6 gap-6">
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
                            <TableHead className="text-left px-4 py-2">Assigned Lupon</TableHead>
                            <TableHead className="text-left px-4 py-2">Complainant</TableHead>
                            <TableHead className="text-left px-4 py-2">Respondent</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow className="border-t">
                                <TableCell className="px-4 py-2">
                                    { hearing.hearing_status == 'scheduled' ? "Scheduled" : "Pending..."}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    { hearing.hearing_status == 'scheduled' ? "Scheduled" : "Pending..."}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    { hearing.hearing_status == 'scheduled' ? "Scheduled" : "Pending..."}
                                </TableCell>
                    
                            </TableRow>
                        </TableBody>
                    </Table>
                    </div>
                    
                </div>

            </div>
        )
    }
    
}


