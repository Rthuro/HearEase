import { Edit, Plus, CalendarIcon} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCaseStore } from "@/store/useCaseStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover,
    PopoverTrigger,
    PopoverContent
} from "@/components/ui/popover"
import { dateFormatter } from "@/lib/helpers"
import { Calendar } from "@/components/ui/calendar";
import { useAddressesStore } from "@/store/useAddressStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast";
export function AddEditParticipant({action, type}) {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const [openCalendar, setOpenCalendar] = useState(false);
    const { set_complainants, set_respondents, complainantList, respondentList } = useCaseStore(); 
    const { barangays, streets, fetchBarangays, fetchStreets } = useAddressesStore();
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();

    useEffect(() => {
        fetchBarangays();
        fetchStreets();
    }, [fetchBarangays, fetchStreets]);

    const getStreets = (barangay_id) => {
        return streets .filter(s => s.barangay === barangay_id).map(s => s.name);
    }

    const getBarangayName = (barangay_id) => {
        const barangay = barangays.find(b => b.id === barangay_id);
        return barangay ? barangay.name : "";
    }

    const [ userData, setUserData ] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        birth_date: null,
        sex: "",
        contact_number: "",
        barangay: 2,
        street: "",
        additional_info: "",
    });

    const handleSubmit = () => {
        if (!userData.first_name || !userData.last_name || !userData.birth_date || !userData || !userData.sex || !userData.contact_number || !userData.barangay || !userData.street) {
            toast.error("Please fill out all required fields.");
            return;
        }

        if(action == "Add" && type == "complainant") {
            set_complainants([...complainantList, userData])
        }
        if(action == "Add" && type == "respondent") {
            set_respondents([...respondentList, userData])
        }

        setUserData({
            first_name: "",
            last_name: "",
            middle_name: "",
            birth_date: null,
            sex: "",
            contact_number: "",
            barangay: 2,
            street: "",
            additional_info: "",
        });
    }
    
     return (
        <Dialog>
            <DialogTrigger asChild>     
                { action === 'Add' ? (
                        <Button variant="outline">
                            <Plus /> 
                            Add {typeLabel}
                        </Button>
                    ) : (
                        <Button variant="outline">
                            <Edit /> 
                            Edit {typeLabel}
                        </Button>
                    )
                }
            </DialogTrigger>
        <DialogContent className={cn('sm:max-w-fit')}>
                <DialogHeader>
                    <DialogTitle>{action} {typeLabel}</DialogTitle>
                    <DialogDescription>{action} {typeLabel} Information.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 overflow-y-scroll max-h-[350px] px-3 py-2 mb-4 ">                                
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="first_name">First Name
                            <span className="text-redBase">*</span>
                        </Label>
                        <Input id="first_name" type="text" className="w-72" 
                        value={userData.first_name}
                        onChange ={ (e) => {
                            setUserData({...userData, first_name: e.target.value});
                        }}
                        required
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="middle_name">Middle Name
                        </Label>
                        <Input id="middle_name" type="text" className="w-72"
                        value={userData.middle_name} 
                        onChange ={ (e) => {
                            setUserData({...userData, middle_name: e.target.value});
                        }}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="last_name">Last Name
                            <span className="text-redBase">*</span>
                        </Label>
                        <Input id="last_name" type="text" className="w-72"
                        value={userData.last_name}
                        onChange ={ (e) => {
                            setUserData({...userData, last_name: e.target.value});
                        }}
                        required/>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="birth_date">
                            Birthday
                            <span className="text-redBase">*</span>
                        </Label>
                        <Popover open={openCalendar} onOpenChange={setOpenCalendar} id="birth_date">
                            <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="birth_date"
                                className="w-72 justify-between font-normal"
                            >
                                {userData.birth_date
                                ? dateFormatter(userData.birth_date)
                                : "Select date"}
                                <CalendarIcon />
                            </Button>
                            </PopoverTrigger>

                            <PopoverContent className="overflow-hidden p-0 w-72" align="start">
                            <Calendar
                                mode="single"
                                selected={userData.birth_date ?? undefined}
                                captionLayout="dropdown"
                                disabled={(date) => date > maxDate || date < minDate}
                                onSelect={(date) => {
                                setOpenCalendar(false);
                                setUserData({...userData, birth_date: date});
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
                                {userData.sex || "Select"} 
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56">
                                <DropdownMenuRadioGroup
                                value={userData.sex}
                                onValueChange={(value) => 
                                    setUserData({...userData, sex: value})}
                                >
                                <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="contact">
                            Contact Number
                            <span className="text-redBase">*</span>
                        </Label>
                        <Input id="contact" type="tel"
                        placeholder="09876543210"
                        inputMode="numeric"         
                        pattern="[0-9]*"              
                        maxLength={11} 
                        className="w-72"
                        value={userData.contact_number}
                        onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, "");
                            setUserData({...userData, contact_number: onlyDigits});
                        }} />
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
                                            {getBarangayName(userData.barangay) || 'Select'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup 
                                        value={userData.barangay} 
                                        onValueChange={(value) => {
                                            const streetsForBarangay = getStreets(value);
                                            setUserData({
                                                ...userData,
                                                barangay: value,
                                                street: streetsForBarangay[0] || "", 
                                            });
                                        }}>

                                        {barangays.map(b => (
                                            <DropdownMenuRadioItem key={b.name} value={b.id}>{b.name}
                                            </DropdownMenuRadioItem>
                                        ))}

                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Label htmlFor="street">
                                    Street
                                    <span className="text-redBase">*</span>
                                </Label>
                                <DropdownMenu id="street">
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            {userData.street || 'Select'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup 
                                        value={userData.street} onValueChange={(value) => 
                                        setUserData({...userData, street: value})}>

                                        { getStreets(userData.barangay).map(street => (
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
                            <Label htmlFor="additional_info">Additional Information</Label>
                            <Input id="additional_info" type="text" className="w-full"
                            value={userData.additional_info}
                            onChange={(e) => 
                                setUserData({...userData, additional_info: e.target.value})} 
                            />
                        </div>
                    </div>    
                </div>
                
                <DialogFooter>
                    <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    { action === 'Add' ? (
                        <Button 
                        onClick={handleSubmit}>
                            Add {typeLabel}
                        </Button>
                    ) : (
                        <Button 
                        onClick={handleSubmit}>
                            Save Changes
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}