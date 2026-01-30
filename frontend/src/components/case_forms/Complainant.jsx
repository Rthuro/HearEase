
import { Button } from "../ui/button"
import { useCaseStore } from "@/store/useCaseStore"
import { Separator } from "../ui/separator"
import { cn } from "@/lib/utils"
import { RetrievePopover } from "./retrieve-popover"
import { ParticipantCard } from "./participant-card"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { DropdownParticipants } from "./dropdown-participants"
import { useEffect } from "react"

export function Complainant() {
    const { complainantList, set_complainants, initialUserComplainantInfo } = useCaseStore();
    const { userRole } = useAuthenticationStore();

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
                    <DropdownParticipants type="complainant" action="Add" />
                    <RetrievePopover participantType="complainant" />
                </div>
                <Button className={cn('bg-redBase w-fit')} onClick={handleReset}>Reset</Button>
            </div>

            <Separator className="col-span-2" />

            {userRole !== 'admin' && (
                <div className="flex items-center justify-between p-3 rounded-md border cursor-pointer col-span-2 ">
                    {initialUserComplainantInfo.type === 'individual' ? (
                        <p>{initialUserComplainantInfo?.first_name} 
                        {' '}
                        {initialUserComplainantInfo?.middle_name} {initialUserComplainantInfo?.last_name}</p>
                    ) : (
                        <p>{initialUserComplainantInfo?.representative_name}</p>
                    )}
                    <p className="py-0.5 px-2 bg-zinc-100 font-medium rounded-full text-[10px] uppercase tracking-wider text-zinc-500 border border-zinc-200">
                        {initialUserComplainantInfo?.type}
                    </p>
                </div>
            )}

            {displayList.length > 0 && displayList.map( (c) => (
                <ParticipantCard participant={c} type="complainant" />
            ))}
            
        </div>
    )
}