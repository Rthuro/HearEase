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
import { useFormStore } from "@/store/useFormStore"

export function Complainant() {
    const { setFormData, formData } = useFormStore();
    const [openCalendar, setOpenCalendar] = useState(false);

    // const [sex, setSex] = useState("Male");
    // const [barangay, setBarangay] = useState("Tetuan");
    // const [street, setStreet] = useState(getStreets("Tetuan")[0]);

    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    return (
        <div className="grid grid-cols-2 gap-3">
            
            <p className="col-span-2 text-center text-2xl mb-3">Complainant Information</p>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="firstNameComplainant">First Name
                    <span className="text-redBase">*</span>
                </Label>
                <Input id="firstNameComplainant" type="text" className="w-72" 
                value={formData.complainant.first_name.value}
                onChange ={ (e) => {
                    setFormData('complainant', 'first_name', e.target.value);
                }}
                required
                />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="lastNameComplainant">Last Name
                    <span className="text-redBase">*</span>
                </Label>
                <Input id="lastNameComplainant" type="text" className="w-72"
                value={formData.complainant.last_name.value}
                onChange ={ (e) => {
                    setFormData('complainant', 'last_name', e.target.value);
                }}
                required/>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="middleNameComplainant">Middle Name
                </Label>
                <Input id="middleNameComplainant" type="text" className="w-72"
                value={formData.complainant.middle_name.value} 
                onChange ={ (e) => {
                    setFormData('complainant', 'middle_name', e.target.value);
                }}
                />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="birthdayComplainant">
                    Birthday
                    <span className="text-redBase">*</span>
                </Label>
                <Popover open={openCalendar}  onOpenChange={setOpenCalendar} id="birthdayComplainant" >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-72 justify-between font-normal"
                        >
                            {formData.complainant.birth_date.value ? 
                            formData.complainant.birth_date.value.toLocaleDateString() : "Select date"}
                            <CalendarIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.complainant.birth_date.value ?? undefined}
                            captionLayout="dropdown"
                            disabled={(date) => date > maxDate || date < minDate}
                            onSelect={(date) => {
                                setOpenCalendar(false);
                                setFormData('complainant', 'birth_date', date);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="sexComplainant">Sex
                    <span className="text-redBase">*</span>
                </Label>
                <DropdownMenu id="sexComplainant">
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                        {formData.complainant.sex.value || "Select"} 
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup
                        value={formData.complainant.sex.value}
                        onValueChange={(value) => 
                            setFormData('complainant', 'sex', value)}
                        >
                        <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="contactComplainant">
                    Contact Number
                    <span className="text-redBase">*</span>
                </Label>
                <Input id="contactComplainant" type="tel"
                placeholder="09876543210"
                inputMode="numeric"         
                pattern="[0-9]*"              
                maxLength={11} 
                className="w-72"
                value={formData.complainant.contact_number.value}
                onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "");
                    setFormData('complainant', 'contact_number', onlyDigits);
                }} />
            </div>
            
            <div className="grid grid-cols-1 col-span-2 gap-2">
                <Label htmlFor="address">Address
                    <span className="text-redBase">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="barangayComplainant">Barangay</Label>
                        <DropdownMenu id="barangayComplainant">
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {formData.complainant.barangay.value || 'Select'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup 
                                value={formData.complainant.barangay.value} 
                                onChange={(value) => {
                                    setFormData('complainant', 'barangay', value);
                                    setFormData('complainant', 'street', getStreets(value)[0]);
                                }}>

                                {getBarangayNames().map(name => (
                                    <DropdownMenuRadioItem key={name} value={name}>{name}
                                    </DropdownMenuRadioItem>
                                ))}

                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="streetComplainant">Street</Label>
                        <DropdownMenu id="streetComplainant">
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {formData.complainant.street.value || 'Select'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup 
                                value={formData.complainant.street.value} onValueChange={(value) => 
                                setFormData('complainant', 'street', value)}>

                                { getStreets(formData.complainant.barangay.value).map(street => (
                                        <DropdownMenuRadioItem key={street} 
                                        value={street}>{street}
                                        </DropdownMenuRadioItem>
                                    ))
                                }
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                    <Label htmlFor="addInfoComplainant">Additional Information</Label>
                    <Input id="addInfoComplainant" type="text" className="w-full"
                    value={formData.complainant.additional_info.value}
                    onChange={(e) => 
                        setFormData('complainant', 'additional_info', e.target.value)} 
                    />
                </div>
            </div>
        </div>
    )
}