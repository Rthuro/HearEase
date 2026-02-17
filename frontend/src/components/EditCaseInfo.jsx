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
import { ArrowRight, Pencil } from "lucide-react"
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
import { useCaseStore } from "@/store/useCaseStore";
import { useAddressesStore } from "@/store/useAddressStore";
import { getStreets } from "@/lib/helpers";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function EditCaseInfo({section, caseInfo}){
    const { barangays } = useAddressesStore();
    const [openCalendar, setOpenCalendar] = useState(false);
    const { updateCaseInfo } = useCaseStore();
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    const [ info, setInfo ] = useState(null);
    const [open, setOpen] = useState(false);

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    // need to create multiple edit forms for complainants and respondents
    console.log(caseInfo);

    useEffect(() => {
        if (open === true) {
            if (section === "complainant" || section === "respondent") {
                const data = section === "complainant"
                    ? caseInfo?.complainant_user
                    : caseInfo?.respondent_user;

                if (!data) return;

                setInfo({
                    id: section === "complainant"
                        ? caseInfo?.complainant_user.id
                        : caseInfo?.respondent_user.id,
                    first_name: data.first_name,
                    middle_name: data.middle_name,
                    last_name: data.last_name,
                    birth_date: data.birth_date ? new Date(data.birth_date) : null,
                    sex: data.sex,
                    contact_number: data.contact_number,
                    barangay: data.barangay,
                    street: data.street,
                    additional_info: data.additional_info,
                });
            }
        } else {
            const data = caseInfo ;
            if (!data) return;
            setInfo({
                id: data.id,
                case_status: data?.case_status,
                description:data?.description
            })
        }
    }, [open]); 

    const handleSubmit = (e) => {
        e.preventDefault();
        setOpen(false);

        if (section === "complainant" || section === "respondent") {
             updateCaseInfo({
                ...info,
                birth_date: info.birth_date ? info.birth_date.toISOString().split('T')[0] : null,
            }, section, info.id);
        } else {
             updateCaseInfo(info, section, info.id);
        }
       
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                setInfo(null);
            }
        }}>
            <DialogTrigger asChild>     
                <Button variant="outline">
                    <Pencil className="h-4 w-4" />
                    Edit
                </Button>
            </DialogTrigger>
        <DialogContent className={cn('w-2/3')}>
                <DialogHeader>
                    <DialogTitle>Edit {section}</DialogTitle>
                    <DialogDescription>Edit {section} information.</DialogDescription>
                </DialogHeader>
                { section == "complainant" || section == "respondent" ? (
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
                                        info.birth_date.toLocaleDateString() : "Select date"}
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
                                        
                                                const streets = getStreets(barangays, value);
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

                                            {getStreets(barangays, info?.barangay).map(street => (
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
                ) : (
                     <div className="grid grid-cols-1 gap-3">
                        {data.role === "admin" && (
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="status">Case Status
                                <span className="text-redBase">*</span>
                            </Label>
                            <DropdownMenu id="status">
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                    {info?.case_status || "Select"} 
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuRadioGroup
                                    value={info?.case_status}
                                    onValueChange={(value) => 
                                        setInfo({...info, case_status: value})}
                                    >
                                        <DropdownMenuRadioItem value="pending_approval">
                                            Pending Approval
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="approved">
                                            Approved
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="in_progress">
                                            In progress
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="resolved">
                                            Resolved
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="escalated">
                                            Escalated
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="rejected">
                                            Rejected
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="cancelled">
                                            Cancelled
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        )}
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="description">Case Description
                                <span className="text-redBase">*</span>
                            </Label>
                            <Textarea id="description" className="w-full" rows={3} 
                            value={info?.description} 
                            onChange ={ (e) => {
                                setInfo({...info, description: e.target.value});
                            }}
                            />
                        </div>
                        
                </div>
                ) }
                
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