import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useState } from "react";
import { getFirstHearingDate } from "@/lib/helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useCaseStore } from "@/store/useCaseStore";
import { useLuponStore } from "@/store/useLuponStore";
import { useEffect } from "react";

export function HearingInfo(){
    const { setFormData, formData } = useCaseStore();
    const { members, fetchMembers } = useLuponStore();

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const [scheduledDate] = useState(new Date());
    const [firstHearing] = useState(getFirstHearingDate(scheduledDate));

    const [open, setOpen] = useState(false)

    return(
         <div className="grid grid-cols-2 gap-4">
            <p className="col-span-2 text-center text-2xl mb-3">Hearing Information</p>
            <div className="grid grid-cols-1 gap-2 col-span-2">
                <Label htmlFor="predictedNumber">Number of Predicted Hearing
                    <span className="text-redBase">(auto)</span>
                </Label>
                <Input id="predictedNumber" type="number" className="w-72"
                 value={formData?.hearingInfo?.predicted_number?.value} readOnly />
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="hearingDate">Date of First Hearing
                    <span className="text-redBase">(auto)</span></Label>
                <Input id="hearingDate" type="text" className="w-72" 
                value={firstHearing.toLocaleDateString()} readOnly />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="time">Time
                    <span className="text-redBase">(auto)</span>
                </Label>
                <Input id="time" type="time" className="w-72" readOnly />
            </div>

            <div className="grid grid-cols-1 gap-2 col-span-2">
                <Label htmlFor="lupon">Assigned Lupon Member
                    <span className="text-redBase">*</span>
                </Label>
                <Popover open={open} onOpenChange={setOpen} id="lupon">
                    <PopoverTrigger asChild>
                        <Button
                        role="combobox"
                        aria-expanded={open}
                        variant="outline"
                        className="max-w-max min-w-full justify-between"
                        >
                        { formData.hearingInfo.lupon_member_id.value ?   (members.find((lupon) => lupon.id === formData.hearingInfo.lupon_member_id.value)?.first_name + " " + members.find((lupon) => lupon.id === formData.hearingInfo.lupon_member_id.value)?.last_name)
                            : "Select lupon members..."}
                        <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                        <Command>
                        <CommandInput placeholder="Search lupon members..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No lupon members found.</CommandEmpty>
                            <CommandGroup>
                            {members.map((lupon) => (
                                <CommandItem
                                key={lupon.id}
                                value={lupon.id}
                                onSelect={() => {
                                    setFormData('hearingInfo', 'lupon_member_id', lupon.id);
                                    setOpen(false)
                                }}
                                >
                                {lupon.first_name} {lupon.last_name}
                                <Check
                                    className={cn(
                                    "ml-auto",
                                    formData.hearingInfo.lupon_member_id.value === lupon.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}