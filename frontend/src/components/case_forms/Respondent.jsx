import { useState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { CalendarIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { getBarangayNames } from "@/lib/helpers";
import { getStreets } from "@/lib/helpers";

export function Respondent() {
    const [birthDate, setBirthDate] = useState(null);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [sex, setSex] = useState("Male");
    
    const [barangay, setBarangay] = useState("Tetuan");

    const [street, setStreet] = useState(getStreets("Tetuan")[0]);

    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    return (
        <div className="grid grid-cols-2 gap-3">
            <p className="col-span-2 text-center text-2xl mb-3">Respondent Information</p>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="firstNameRespondent">First Name
                    <span className="text-redBase">*</span></Label>
                <Input id="firstNameRespondent" type="text" className="w-72" />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="lastNameRespondent">Last Name
                    <span className="text-redBase">*</span></Label>
                <Input id="lastNameRespondent" type="text" className="w-72" />
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="middleNameRespondent">Middle Name
                </Label>
                <Input id="middleNameRespondent" type="text" className="w-72" />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="birthdayRespondent">Birthday
                </Label>
                <Popover open={openCalendar}  onOpenChange={setOpenCalendar} id="birthdayRespondent" >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-72 justify-between font-normal"
                        >
                            {birthDate? birthDate.toLocaleDateString() : "Select date"}
                            <CalendarIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                        <Calendar
                            mode="single"
                            selected={birthDate}
                            captionLayout="dropdown"
                            disabled={(date) => date > maxDate || date < minDate}
                            onSelect={(date) => {
                                setBirthDate(date);
                                setOpenCalendar(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="sexRespondent">Sex
                    <span className="text-redBase">*</span>
                </Label>
                <DropdownMenu id="sexRespondent">
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                        {sex || "Select"} 
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup
                        value={sex}
                        onValueChange={setSex}
                        >
                        <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="contactRespondent">Contact Number
                </Label>
                <Input id="contactRespondent" type="text" className="w-72" />
            </div>
            
            <div className="grid grid-cols-1 col-span-2 gap-2">
                <Label htmlFor="address">Address
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="barangayRespondent">Barangay</Label>
                        <DropdownMenu id="barangayRespondent">
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">{barangay || 'Select'}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup value={barangay} 
                                onValueChange={(value) => {
                                    setBarangay(value);
                                    setStreet(getStreets(value)[0]);
                                }}>
                                {getBarangayNames().map(name => (
                                    <DropdownMenuRadioItem key={name} value={name}>{name}</DropdownMenuRadioItem>
                                ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="streetRespondent">Street</Label>
                        <DropdownMenu id="streetRespondent">
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">{street || 'Select'}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup value={street} onValueChange={setStreet}>
                                {getStreets(barangay).map(street => (
                                    <DropdownMenuRadioItem key={street} value={street}>{street}</DropdownMenuRadioItem>
                                ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                    <Label htmlFor="addInfoRespondent">Additional Information</Label>
                    <Input id="addInfoRespondent" type="text" className="w-full" />
                </div>
            </div>
        </div>
    )
}