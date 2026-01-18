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
import { ArrowRight, Edit } from "lucide-react"
import { useState } from "react";
import { Popover,
  PopoverTrigger,
  PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { CalendarIcon } from "lucide-react";
import { useAddressesStore } from "@/store/useAddressStore";
import { getStreets } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useCoAttendeesStore } from "@/store/useCoAttendeesStore";
import { dateFormatter } from "@/lib/helpers";

export function EditCoAttendee({co_attendees, type, attendeeInfo}){
    const { barangays, streets } = useAddressesStore();
    const [openCalendar, setOpenCalendar] = useState(false);
    const { updateCoAttendeeInfo } = useCoAttendeesStore();
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    const [info, setInfo] = useState(attendeeInfo);


    const handleSubmit = (e) => {
        e.preventDefault();
        updateCoAttendeeInfo(co_attendees, info.id, type, info);
    }
    // console.log(info);

    return (
        <Dialog>
            <DialogTrigger asChild>     
                <Button variant="outline"><Edit />Edit</Button>
            </DialogTrigger>
        <DialogContent className={cn('w-2/3')}>
                <DialogHeader>
                    <DialogTitle>Edit {type}</DialogTitle>
                    <DialogDescription>Edit {type} information.</DialogDescription>
                </DialogHeader>
                 <div className="grid grid-cols-2 gap-4 overflow-y-scroll max-h-[350px] px-3 py-2 mb-4 ">                                
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="first_name">First Name
                                <span className="text-redBase">*</span></Label>
                            <Input id="first_name" type="text" 
                            value={info?.first_name || ""}
                            onChange ={ (e) => {
                                setInfo({...info, first_name: e.target.value});
                            }}
                            required/>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="middle_name">Middle Name
                            </Label>
                            <Input id="middle_name" type="text" 
                                value={info?.middle_name || ""}
                                onChange ={ (e) => {
                                    setInfo({...info, middle_name: e.target.value});
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="last_name">Last Name
                                <span className="text-redBase">*</span></Label>
                            <Input id="last_name" type="text" 
                            value={info?.last_name || ""}
                            onChange ={ (e) => {
                                setInfo({...info, last_name: e.target.value});
                            }}
                            required/>
                        </div>        
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="birth_date">Birthday
                            </Label>
                            <Popover open={openCalendar}  onOpenChange={setOpenCalendar} id="birth_date">
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date"
                                        className="justify-between font-normal"
                                    >
                                        {info?.birth_date ? 
                                        dateFormatter(info.birth_date) : "Select date"}
                                        <CalendarIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={info?.birth_date}
                                        captionLayout="dropdown"
                                        disabled={(date) => date > maxDate || date < minDate}
                                        onSelect={(date) => {
                                            setInfo({...info, birth_date: date});
                                            setOpenCalendar(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="sex">Sex
                                <span className="text-redBase">*</span>
                            </Label>
                            <DropdownMenu id="sex">
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                    {info?.sex || "Select"} 
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuRadioGroup
                                    value={info?.sex}
                                    onValueChange={(value) => 
                                        setInfo({...info, sex: value})}
                                    >
                                    <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="contact">Contact Number
                            </Label>
                            <Input id="contact" type="tel" 
                                placeholder="09876543210"
                                inputMode="numeric"         
                                pattern="[0-9]*"              
                                maxLength={11} 
                                value={info?.contact_number || ""}
                                onChange={ (e) => {
                                    setInfo({...info, contact_number: e.target.value});
                                }}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 col-span-2 gap-2">
                            <Label htmlFor="address">Address
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="barangay">
                                        Barangay
                                        <span className="text-redBase">*</span>
                                    </Label>
                                    <DropdownMenu id="barangay">
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                { info?.barangay || 'Select'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-72">
                                            <DropdownMenuRadioGroup
                                            value={info?.barangay}
                                            onValueChange={(value) => {
                                                setInfo({...info, barangay: value});
                                        
                                                const streets = getStreets(streets,value);
                                                if (streets.length > 0) {
                                                setInfo({...info, street: streets[0]});
                                                } else {
                                                setInfo({...info, street: ""});
                                                }
                                            }}
                                            >
                                            {barangays.map((b) => (
                                                <DropdownMenuRadioItem key={b.id} value={b.name}>
                                                {b.name}
                                                </DropdownMenuRadioItem>
                                            ))}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="street">Street
                                        <span className="text-redBase">*</span>
                                    </Label>
                                    <DropdownMenu id="street">
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                {info?.street || 'Select'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-72">
                                            <DropdownMenuRadioGroup
                                            value={info?.street} onValueChange={(value) => setInfo({...info, street: value})}>

                                            {getStreets(streets, info?.barangay).map(street => (
                                                <DropdownMenuRadioItem key={street} value={street}>{street}</DropdownMenuRadioItem>
                                            ))}

                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <Label htmlFor="additional_info">Additional Information</Label>
                                <Input id="additional_info" type="text" className="w-full"
                                value={info?.additional_info || ""}
                                onChange={(e) => 
                                    setInfo({...info, additional_info: e.target.value})}
                                />
                            </div>
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