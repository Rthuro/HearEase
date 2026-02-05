
import { Button } from "../ui/button"
import { useCaseStore } from "@/store/useCaseStore"
import { Separator } from "../ui/separator"
import { cn } from "@/lib/utils"
import { RetrievePopover } from "./retrieve-popover"
import { ParticipantCard } from "./participant-card"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { useEffect } from "react"
import { AddEditParticipant } from "./add-edit-participant"
import { useState } from "react"
export function Complainant() {
    const { complainantList, set_complainants, initialUserComplainantInfo } = useCaseStore();
    const { userRole } = useAuthenticationStore();
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        if (userRole !== 'admin') {
            if (!complainantList.some(c => c.first_name === initialUserComplainantInfo.first_name && c.last_name === initialUserComplainantInfo.last_name)) {
            set_complainants([initialUserComplainantInfo]);
            }
        }  
    }, [userRole, initialUserComplainantInfo, set_complainants]);

    const handleReset = (e) => {
        e.preventDefault();
        if (userRole !== 'admin') {
            set_complainants([initialUserComplainantInfo]);
            return;
        }
        set_complainants([])
    }

    const userComplainantList = complainantList.filter( (c) => 
            (c.first_name !== initialUserComplainantInfo.first_name || c.last_name !== initialUserComplainantInfo.last_name)
    );

    // console.log("Complainant List:", complainantList);

    const displayList = userRole !== 'admin' ? userComplainantList : complainantList;
    
    return (
        <div className="grid grid-cols-2 gap-3">
            
            <p className="col-span-2 text-center text-2xl mb-3">Complainant Information</p>

            <div className="flex gap-3 col-span-2">
                <div className="flex gap-2">
                     <AddEditParticipant 
                        type="complainant" 
                        action="Add" 
                        open={openDialog === "add-complainant"}
                        onOpenChange={(val) => setOpenDialog(val ? "add-complainant" : null)}
                    />
                    <RetrievePopover participantType="complainant" />
                </div>
                <Button className={cn('bg-redBase w-fit')} onClick={handleReset}>Reset</Button>
            </div>

            <Separator className="col-span-2" />

            {userRole !== 'admin' && (
                <div className="flex items-center justify-between p-3 rounded-md border cursor-pointer col-span-2 ">
                     <p>{initialUserComplainantInfo?.first_name} 
                        {' '}
                        {initialUserComplainantInfo?.middle_name} {initialUserComplainantInfo?.last_name}</p>
                </div>
            )}

            {displayList.length > 0 && displayList.map( (c) => (
                <ParticipantCard participant={c} type="complainant" />
            ))}
            
        </div>
    )
}