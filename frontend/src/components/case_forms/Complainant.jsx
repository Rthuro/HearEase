
import { Button } from "../ui/button"
import { useCaseStore } from "@/store/useCaseStore"
import { Separator } from "../ui/separator"
import { cn } from "@/lib/utils"
import { RetrievePopover } from "./retrieve-popover"
import { ParticipantCard } from "./participant-card"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { DropdownParticipants } from "./dropdown-participants"

export function Complainant() {
    const { complainantList, set_complainants } = useCaseStore();
    const { userRole } = useAuthenticationStore();

    const handleReset = (e) => {
        e.preventDefault();
        set_complainants([])

    }

    
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

            {complainantList.length > 0 && complainantList.map( (c) => (
                <ParticipantCard participant={c} type="complainant" />
            ))}
            
        </div>
    )
}