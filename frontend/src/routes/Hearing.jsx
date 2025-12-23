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
import { ChevronLeft, Pencil, Loader2, File, Download } from "lucide-react";
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
    const { hearings, updatedHearings, updateCaseHearings, loading, setUpdatedHearings } = useHearingStore();
    const { case_complainants, case_respondents, fetchCaseComplainants, fetchCaseRespondents} = useRetrieveUsersStore();
    const { cases } = useCaseStore()
    const { members } = useLuponStore();
    const navigate = useNavigate();
    const [ open, setOpen ] = useState(false);


    const hearing = hearings.find( hearing => hearing.id == hearing_id);
    const caseInfo = cases.find( c => c.id == hearing.case);

    const caseHearings = hearings.filter( h => h.case == hearing.case);
    console.log("caseHearings", caseHearings);

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
    
    useEffect(() => {
      setUpdatedHearings(initializedHearings);
    }, []);

    useEffect( () => {
        fetchCaseComplainants(caseInfo?.complainants);
        fetchCaseRespondents(caseInfo?.respondents);
    }, [caseInfo])


   
    
    
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
    
                    <div className="flex gap-3 self-end">
                        <Button variant="outline" className={cn("text-redBase")}>
                            Cancel Hearing
                        </Button>
                    </div>
                    
                </div>

                <SummonConfirmationDisplay hearing={hearing} caseInfo={caseInfo} />

                <HearingProgressDisplay hearing={hearing} case_complainants={case_complainants} case_respondents={case_respondents} />

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


