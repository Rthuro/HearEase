import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { PageSync } from "@/components/PageSync"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuCheckboxItem  } from "@/components/ui/dropdown-menu"
// import { getBarangayNames } from "@/lib/helpers";
import { getStreets } from "@/lib/helpers";
import { useLuponStore } from "@/store/useLuponStore"
import { useAddressesStore } from "@/store/useAddressStore"
import { useEffect } from "react"
import { CustomTable } from "@/components/CustomTable"

export function LuponManagement(){
    const { barangays, fetchBarangays } = useAddressesStore();
    const { formData, setFormData,  members, fetchMembers, addMember } = useLuponStore();
    const [openCalendar, setOpenCalendar] = useState(false);
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();

    useEffect(() => {
        fetchBarangays();
    }, [fetchBarangays]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleSubmit = (e) => {
        e.preventDefault();
        addMember();
    };

    const memberData = members.map(member => ({
        name: `${member.first_name} ${member.middle_name ? member.middle_name + ' ' : ''}${member.last_name}`,
        address: `${member.street}, ${member.barangay}`,
        schedule: member.sched.join(", "),
        url: `lupon/${member.id}`
    }));


    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return(
    <div className="p-6 flex flex-col gap-2">
    <PageSync page="Lupon Management" />
         <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
                <p> <span className="font-medium text-redBase">{members?.length}</span> Lupon Members</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Search className="text-zinc-400 ml-3" size={16} />
                        <Input type="text" placeholder="Search lupon member..." className="w-72 -ml-6 pl-8" />
                    </div>
                    <Dialog>
                        <form>
                            <DialogTrigger asChild>
                            <Button className={cn('bg-redBase font-normal')}>Add New Member</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-fit">
                            <DialogHeader>
                                <DialogTitle>Add New Member</DialogTitle>
                                <DialogDescription>
                               
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 overflow-y-scroll max-h-[400px] pr-2 mb-4">                                
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="first_name">First Name
                                        <span className="text-redBase">*</span></Label>
                                    <Input id="first_name" type="text" className="w-72" 
                                    value={formData.first_name.value}
                                    onChange ={ (e) => {
                                        setFormData('first_name', e.target.value);
                                    }}
                                    required/>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="middle_name">Middle Name
                                    </Label>
                                    <Input id="middle_name" type="text" className="w-72"
                                        value={formData.middle_name.value}
                                        onChange ={ (e) => {
                                            setFormData('middle_name', e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="last_name">Last Name
                                        <span className="text-redBase">*</span></Label>
                                    <Input id="last_name" type="text" className="w-72" 
                                    value={formData.last_name.value}
                                    onChange ={ (e) => {
                                        setFormData('last_name', e.target.value);
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
                                                className="w-72 justify-between font-normal"
                                            >
                                                {formData.birth_date.value ? 
                                                formData.birth_date.value.toLocaleDateString() : "Select date"}
                                                <CalendarIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.birth_date.value}
                                                captionLayout="dropdown"
                                                disabled={(date) => date > maxDate || date < minDate}
                                                onSelect={(date) => {
                                                    setFormData('birth_date', date);
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
                                            {formData.sex.value || "Select"} 
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent className="w-56">
                                            <DropdownMenuRadioGroup
                                            value={formData.sex.value}
                                            onValueChange={(value) => 
                                                setFormData('sex', value)}
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
                                        className="w-72"
                                        inputMode="numeric"         
                                        pattern="[0-9]*"              
                                        maxLength={11} 
                                        value={formData.contact_number.value}
                                        onChange={ (e) => {
                                            setFormData('contact_number', e.target.value);
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
                                                        { barangays.find(b => b.name === formData.barangay.value)?.name || 'Select'}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-72">
                                                    <DropdownMenuRadioGroup
                                                    value={formData.barangay.value}
                                                    onValueChange={(value) => {
                                                        setFormData("barangay", value);
                                                        // Automatically reset streets when barangay changes
                                                        const streets = getStreets(value);
                                                        if (streets.length > 0) {
                                                        setFormData("street", streets[0]);
                                                        } else {
                                                        setFormData("street", "");
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
                                                        {formData.street.value || 'Select'}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-72">
                                                    <DropdownMenuRadioGroup 
                                                    value={formData.street.value} onValueChange={(value) => setFormData('street', value)}>

                                                    {getStreets(formData.barangay.value).map(street => (
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
                                        value={formData.additional_info.value}
                                        onChange={(e) => 
                                            setFormData('additional_info', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2 mt-2 col-span-2">
                                        <Label htmlFor="schedule">Schedule
                                            <span className="text-redBase">*</span>
                                        </Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className={cn('justify-start')}>{formData.sched.value.length > 0 ? formData.sched.value.join(", ") : "Select"}</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                {days.map((day) => (
                                                    <DropdownMenuCheckboxItem
                                                    key={day}
                                                    checked={formData.sched.value.includes(day)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {  
                                                            setFormData('sched', [...formData.sched.value, day]);
                                                        } else {
                                                            setFormData('sched', formData.sched.value.filter(d => d !== day));
                                                        }
                                                    }}
                                                    >
                                                        {day}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleSubmit} type="submit">Add Member</Button>
                            </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>
                    
                </div>
                <CustomTable 
                    headers={["Name", "Address", "Schedule", "Action"]}
                    datas={memberData}
                    emptyDataMessage="No lupon members found."
                />
        </section>
    </div>
    )
}