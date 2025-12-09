import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription,  DialogClose, DialogFooter } from "@/components/ui/dialog"
import { useCaseStore } from "@/store/useCaseStore";
import { Button } from "../ui/button";

export function ParticipantCard({participant, type}){
    const { set_complainants, set_respondents, complainantList, respondentList } = useCaseStore();

    const handleRemove = () => {
        if (type === "complainant") {
            set_complainants(complainantList.filter((p) => p.first_name !== participant.first_name && p.last_name !== participant.last_name));
        } else if (type === "respondent") {
            set_respondents(respondentList.filter((p) => p.first_name !== participant.first_name && p.last_name !== participant.last_name));
        }
    };
    
    return (
        <Dialog>
            <DialogTrigger asChild>     
                {participant && (
                    <div className="flex items-center justify-between p-3 rounded-md border cursor-pointer col-span-2 ">
                        <p>{participant.first_name} {participant.last_name}</p>
                    </div>
                )}
            </DialogTrigger>
        <DialogContent className={cn('sm:max-w-fit')}>
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleRemove}>Remove</Button>
                </DialogFooter>
        </DialogContent>
    </Dialog>
    )
}