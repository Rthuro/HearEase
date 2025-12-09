import { useState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { CalendarIcon, Plus, Minus } from "lucide-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { getBarangayNames } from "@/lib/helpers";
import { getStreets } from "@/lib/helpers";
import { useCaseStore } from "@/store/useCaseStore"
import { useEffect } from "react"
import { Separator } from "../ui/separator"
import { cn } from "@/lib/utils"
import { dateFormatter } from "@/lib/helpers"
import { RetrieveUserPopover } from "./retrieve-users-popover"
import { RetrievePopover } from "./retrieve-popover"
import { AddEditParticipant } from "./add-edit-participant"
import { ParticipantCard } from "./participant-card"

export function Complainant() {
    const { setFormData, formData, setComplainantInfo, complainantList, respondentList, set_complainants, set_respondents } = useCaseStore();
    const [openCalendar, setOpenCalendar] = useState(false);

    const stored = localStorage.getItem("authData");
    const storedData = stored ? JSON.parse(stored) : null;

    const userInfo = {
                    first_name: formData?.complainant?.first_name?.value,
                    last_name: formData?.complainant?.last_name?.value,
                    middle_name: formData?.complainant?.middle_name?.value,
                    birth_date: formData?.complainant?.birth_date?.value,
                    sex: formData?.complainant?.sex?.value,
                    contact_number: formData?.complainant?.contact_number?.value,
                    barangay: formData?.complainant?.barangay?.value,
                    street: formData?.complainant?.street?.value,
                    additional_info: formData?.complainant?.additional_info?.value,
                }      

    const isSelected = (user) => {
        return complainantList.some(
            (u) =>
            u.first_name?.toLowerCase() === user.first_name?.toLowerCase() &&
            u.last_name?.toLowerCase() === user.last_name?.toLowerCase()
        );
    };

    useEffect(() => {
        setComplainantInfo()
        if(storedData.userRole === 'user' && !isSelected(userInfo)) {
            set_complainants([userInfo])
        }
    }, [])

    const handleReset = (e) => {
        e.preventDefault();
        set_complainants([])

    }


    
    return (
        <div className="grid grid-cols-2 gap-3">
            
            <p className="col-span-2 text-center text-2xl mb-3">Complainant Information</p>

            <div className="flex gap-3 col-span-2">
                <div className="flex gap-2">
                    <AddEditParticipant type="complainant" action="Add" />

                    {storedData.userRole === 'admin' && (
                        <RetrievePopover participantType="complainant" />
                    )}
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