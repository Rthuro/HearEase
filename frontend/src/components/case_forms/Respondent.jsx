import { Button } from "../ui/button"
import { useCaseStore } from "@/store/useCaseStore"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"
import { RetrievePopover } from "./retrieve-popover"
import { AddEditParticipant } from "./add-edit-participant"
import { ParticipantCard } from "./participant-card"
export function Respondent() {
    const { set_respondents,respondentList } = useCaseStore();

    const handleReset = (e) => {
        e.preventDefault();
        set_respondents([])

    }
    return (
        <div className="grid grid-cols-2 gap-3">
            <p className="col-span-2 text-center text-2xl mb-3">Respondent Information</p>
            <div className="flex gap-3 col-span-2">
                <div className="flex gap-2">
                    <AddEditParticipant type="respondent" action="Add" />
                    <RetrievePopover participantType="respondent" />
                </div>
                <Button className={cn('bg-redBase w-fit')} onClick={handleReset}>Reset</Button>
            </div>

            <Separator className="col-span-2" />         

            {respondentList.map( (c) => (
                <ParticipantCard participant={c} type="respondent" />
            ))}

        </div>
    )
}