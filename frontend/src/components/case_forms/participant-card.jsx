import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription,  DialogClose, DialogFooter } from "@/components/ui/dialog"
import { useCaseStore } from "@/store/useCaseStore";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AddEditParticipant } from "./add-edit-participant";
import { useState } from "react";

export function ParticipantCard({participant, type}){
    const { set_complainants, set_respondents, complainantList, respondentList } = useCaseStore();
    const [openDialog, setOpenDialog] = useState(false);
    const handleRemove = () => {
        const isComplainant = type === "complainant";
        const currentList = isComplainant ? complainantList : respondentList;
        const setter = isComplainant ? set_complainants : set_respondents;

        const updatedList = currentList.filter((p) => {
            const pName = `${p.first_name}${p.middle_name || ''}${p.last_name}`.toLowerCase().replace(/\s+/g, '');
            const targetName = `${participant.first_name}${participant.middle_name || ''}${participant.last_name}`.toLowerCase().replace(/\s+/g, '');
            return pName !== targetName;
        });

        setter(updatedList);
    };

    const handleEdit = () => {
        setOpenDialog(true);
    };
    
    return (
       <div className="group relative flex items-center col-span-2 hover:border-zinc-200  transition-all duration-300 ease-in-out bg-white hover:gap-3">
    
        <div className="flex-grow flex items-center justify-between rounded-md p-3 border cursor-pointer w-full  group-hover:w-auto ">
             <p>{participant.first_name} {participant.middle_name || ''} {participant.last_name}</p>
        </div>

        <div className="flex items-center gap-1 group-hover:pr-2 w-0 opacity-0 group-hover:w-fit group-hover:opacity-100 transition-all ease-in-out overflow-hidden">
            <Button 
                onClick={handleEdit} 
                className="rounded-md bg-blue-600 text-blue-50  shrink-0"
                title="Change Participant "
                variant={"icon"}
            >
                <Pencil  />
            </Button>

            <Button  
                onClick={handleRemove}
                className="rounded-md bg-red-600 text-red-50  shrink-0"
                title="Remove"
                variant={"icon"}

            >
                <Trash2  />
            </Button>
        </div>
        <AddEditParticipant 
            type={type} 
            action="Edit" 
            open={openDialog} 
            onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}
            editUserData={participant ? participant : null}
        />
    </div>
    )
}