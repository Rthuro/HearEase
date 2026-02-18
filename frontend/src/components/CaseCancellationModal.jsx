import { Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCaseStore } from "@/store/useCaseStore";
import toast from "react-hot-toast";
import { 
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { Label } from "./ui/label";

export function CaseCancellationModal({caseInfo, refresh}){
    const { updateCaseStatus } = useCaseStore();
    const [ cancellationModal, setCancellationModal ] = useState(false);
    const [ caseRemarks, setCaseRemarks ] = useState("");
    const [rejectionType, setRejectionType] = useState("");
    const [xLoader, setXLoader] = useState(false);
    
    const handleCaseCancellation = async (e) => {
        e.preventDefault();
        if(caseRemarks.trim() === ""){
            toast.error("Please provide a reason for rejection.");
            return;
        }
        if(rejectionType.trim() === ""){
            toast.error("Please select the section to reject.");
            return;
        }
        
        setXLoader(true);

        try {
            await toast.promise( updateCaseStatus({
                id: caseInfo.id,
                case_status: "rejected",
                remarks: caseRemarks,
                rejection_section: rejectionType,
                rejected_case_date: new Date()
            },"rejected"), {
                loading: "Rejecting case...",
                success: () => {
                    refresh();
                },
                error: "Failed to reject case. Please try again."
            });
        } catch (error) {
            console.error("Error rejecting case:", error);
        } finally {
            setXLoader(false);
            setCancellationModal(false);
            setCaseRemarks("");
            setRejectionType("");
        }
    }

    return <Dialog open={cancellationModal} onOpenChange={setCancellationModal}>
            <DialogTrigger asChild>     
                <Button variant="outline" disabled={xLoader}>
                    <X/>
                    Reject
                </Button>
            </DialogTrigger>
        <DialogContent className={cn('w-2/3')}>
                <DialogHeader>
                    <DialogTitle>Case rejection</DialogTitle>
                    <DialogDescription>
                        Select the section to reject, then provide the reason for the rejection.
                    </DialogDescription>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="status">Section
                            </Label>
                            <DropdownMenu id="status">
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                    {rejectionType || "Select"} 
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-fit">
                                    <DropdownMenuRadioGroup
                                    value={rejectionType}
                                    onValueChange={(value) => 
                                        setRejectionType(value)}
                                    >
                                        <DropdownMenuRadioItem value="case_details">
                                            Case Details
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="complainant_info">
                                            Complainant Information
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="respondent_info">
                                            Respondent Information
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Textarea id="description" className="w-full" rows={3} 
                        value={caseRemarks} 
                        onChange ={ (e) => {
                            setCaseRemarks(e.target.value);
                        }}
                        placeholder="Provide reason for rejection"
                        />
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleCaseCancellation}>Continue Rejection</Button>
                </DialogFooter>
        </DialogContent>
    </Dialog>
}