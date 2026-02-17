import { Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button"
import { ArrowRight, Pencil } from "lucide-react"
import { useState } from "react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label"
import { DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { useCaseStore } from "@/store/useCaseStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function EditCaseInfo({caseInfo, refresh}){
    const { updateCaseInfo } = useCaseStore();
    const [ info, setInfo ] = useState(null);
    const [open, setOpen] = useState(false);

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);

    useEffect(() => {
        const data = caseInfo ;
        if (!data) return;
        setInfo({
            id: data.id,
            case_status: data?.case_status,
            description:data?.description
        })
    }, []); 

    const handleSubmit = (e) => {
        e.preventDefault();
        setOpen(false);

        toast.promise( updateCaseInfo(info, 'case', info.id), {
            loading: "Updating case information...",
            success: () => {
                refresh();
            },
            error: "Failed to update case information."
        });
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                setInfo(null);
            }
        }}>
            <DialogTrigger asChild>     
                <Button variant="outline">
                    <Pencil className="h-4 w-4" />
                    Edit
                </Button>
            </DialogTrigger>
        <DialogContent className={cn('w-2/3')}>
                <DialogHeader>
                    <DialogTitle>Edit Case</DialogTitle>
                    <DialogDescription>Edit Case information.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3">
                        {data.role === "admin" && (
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="status">Case Status
                            </Label>
                            <DropdownMenu id="status">
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                    {info?.case_status || "Select"} 
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuRadioGroup
                                    value={info?.case_status}
                                    onValueChange={(value) => 
                                        setInfo({...info, case_status: value})}
                                    >
                                        <DropdownMenuRadioItem value="pending_approval">
                                            Pending Approval
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="approved">
                                            Approved
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="in_progress">
                                            In progress
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="resolved">
                                            Resolved
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="escalated">
                                            Escalated
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="rejected">
                                            Rejected
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="cancelled">
                                            Cancelled
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        )}
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="description">Case Description
                                <span className="text-redBase">*</span>
                            </Label>
                            <Textarea id="description" className="w-full" rows={3} 
                            value={info?.description} 
                            onChange ={ (e) => {
                                setInfo({...info, description: e.target.value});
                            }}
                            />
                        </div>
                        
                </div>
                
                <DialogFooter>
                    <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}   