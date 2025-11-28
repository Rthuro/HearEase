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
import { RetrieveRespondentsPopover } from "./retrieve-respondents-popover"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"
import { dateFormatter } from "@/lib/helpers"

export function Respondent() {
    const { setFormData, formData, co_respondents, set_coRespondents } = useCaseStore();
    const [openCalendar, setOpenCalendar] = useState(false);
    const [respondents, setRespondents] = useState(co_respondents.length > 0 ? co_respondents : []);


    const addCoRespondents = () => {
        setRespondents((prev) => [
            ...prev,
            {
                first_name: "",
                last_name: "",
                middle_name: "",
                contact_number: "",
            },
        ]);
        set_coRespondents(respondents);
    };
    
    const updateCoRespondents = (index, field, value) => {
        const updateRespondents = respondents?.map((data, i) =>
            i === index ? { ...data, [field]: value } : data
        );
        set_coRespondents(updateRespondents);
        setRespondents(updateRespondents);
    };

    const removeCoRespondents = (index) => {
        const updated =  respondents.filter((_, i) => i !== index);
        set_coRespondents(updated);
        setRespondents(updated);
    };

    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    return (
        <div className="grid grid-cols-2 gap-3">
            <p className="col-span-2 text-center text-2xl mb-3">Respondent Information</p>
            <RetrieveRespondentsPopover/>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="firstNameRespondent">First Name
                    <span className="text-redBase">*</span></Label>
                <Input id="firstNameRespondent" type="text" className="w-72" 
                value={formData.respondent.first_name.value}
                onChange ={ (e) => {
                    setFormData('respondent', 'first_name', e.target.value);
                }}
                required/>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="middleNameRespondent">Middle Name
                </Label>
                <Input id="middleNameRespondent" type="text" className="w-72"
                    value={formData.respondent.middle_name.value}
                    onChange ={ (e) => {
                        setFormData('respondent', 'middle_name', e.target.value);
                    }}
                />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="lastNameRespondent">Last Name
                    <span className="text-redBase">*</span></Label>
                <Input id="lastNameRespondent" type="text" className="w-72" 
                value={formData.respondent.last_name.value}
                onChange ={ (e) => {
                    setFormData('respondent', 'last_name', e.target.value);
                }}
                required/>
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
                            {formData.respondent.birth_date.value ? 
                            dateFormatter(formData.respondent.birth_date.value) : "Select date"}
                            <CalendarIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.respondent.birth_date.value}
                            captionLayout="dropdown"
                            disabled={(date) => date > maxDate || date < minDate}
                            onSelect={(date) => {
                                setFormData('respondent', 'birth_date', date);
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
                        {formData.respondent.sex.value || "Select"} 
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup
                        value={formData.respondent.sex.value}
                        onValueChange={(value) => 
                            setFormData('respondent', 'sex', value)}
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
                <Input id="contactRespondent" type="tel" 
                    placeholder="09876543210"
                    className="w-72"
                    inputMode="numeric"         
                    pattern="[0-9]*"              
                    maxLength={11} 
                    value={formData.respondent.contact_number.value}
                    onChange={ (e) => {
                        setFormData('respondent', 'contact_number', e.target.value);
                    }}
                 />
            </div>
            
            <div className="grid grid-cols-1 col-span-2 gap-2">
                <Label htmlFor="address">Address
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="barangayRespondent">Barangay</Label>
                        <DropdownMenu id="barangayRespondent">
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    { formData.respondent.barangay.value || 'Select'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup 
                                value={formData.respondent.barangay.value} 
                                onValueChange={(value) => {
                                    setFormData('respondent', 'barangay', value);
                                    setFormData('comprespondentlainant', 'street', getStreets(value)[0]);
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
                                <Button variant="outline">
                                    {formData.respondent.street.value || 'Select'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup 
                                value={formData.respondent.street.value} onValueChange={(value) => setFormData('respondent', 'street', value)}>

                                {getStreets(formData.respondent.barangay.value).map(street => (
                                    <DropdownMenuRadioItem key={street} value={street}>{street}</DropdownMenuRadioItem>
                                ))}

                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                    <Label htmlFor="addInfoRespondent">Additional Information</Label>
                    <Input id="addInfoRespondent" type="text" className="w-full"
                    value={formData.respondent.additional_info.value}
                    onChange={(e) => 
                        setFormData('respondent', 'additional_info', e.target.value)}
                    />
                </div>
            </div>

            <Separator className="col-span-2 my-2"/>

            <div className="grid grid-cols-1 col-span-2 gap-2">
                <p className="font-medium ">Add Co-Respondents
                </p>
                { respondents.length <= 0 && (
                    <Button type="button" variant="default" className={cn("bg-redBase hover:bg-redBase/95")} onClick={addCoRespondents} >
                        <Plus size={16} />
                        Add Respondent
                    </Button>
                )}

                {respondents.length > 0 && respondents?.map( (respondent, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="first_name">First Name
                                <span className="text-redBase">*</span></Label>
                            <Input id="first_name" type="text" className="w-72" 
                            value={respondent.first_name}
                            onChange ={ (e) => {
                                updateCoRespondents( index, 'first_name', e.target.value);
                            }}
                            required/>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="middle_name">Middle Name
                            </Label>
                            <Input id="middle_name" type="text" className="w-72"
                                value={respondent.middle_name}
                                onChange ={ (e) => {
                                    updateCoRespondents(index, 'middle_name', e.target.value);
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="last_name">Last Name
                                <span className="text-redBase">*</span></Label>
                            <Input id="last_name" type="text" className="w-72" 
                            value={respondent.last_name}
                            onChange ={ (e) => {
                                updateCoRespondents(index, 'last_name', e.target.value);
                            }}
                            required/>
                        </div>        
                        
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="contact">Contact Number
                            </Label>
                            <Input id="contact" type="tel" 
                                placeholder="09876543210"
                                className="w-72"
                                inputMode="numeric"         
                                pattern="[0-9]*"              
                                maxLength={11} 
                                value={respondent.contact_number}
                                onChange={ (e) => {
                                    updateCoRespondents(index, 'contact_number', e.target.value);
                                }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={addCoRespondents} >
                                <Plus size={16} />
                                Add Another Respondent
                            </Button>
                            <Button type="button" variant="destructive" onClick={() => removeCoRespondents(index)} >
                                <Minus size={16} />
                            </Button>
                        </div>
                    </div>
                ) )}
            </div>
        </div>
    )
}