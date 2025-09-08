import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getBarangayNames } from "@/lib/helpers";
import { getStreets } from "@/lib/helpers";
import useAuthenticationStore from "@/store/useAuthenticationStore";
export function CaseForm(){
    const { userRole, userInfo } = useAuthenticationStore();
    const navigate = useNavigate();
    const [stepNumber, setStepNumber] = useState(1);

    const formProgress = [
        {
            number :1,
            title: "Complainant Information"
        },
        {
            number :2,
            title: "Respondent Information"
        },
        {
            number :3,
            title: "Case Details"
        },
        {
            number :4,
            title: "Hearing Information"
        },
    ]

    // Form input states
    const [birthDates, setBirthDates] = useState({
        complainant: undefined,
        respondent: undefined,
    });

    const [openCalendar, setOpenCalendar] = useState({
        complainant: false,
        respondent: false,
    });

    const [sex, setSex] = useState({
        complainant: "Male",
        respondent: "Male",
    });

    const [barangay, setBarangay] = useState({
        complainant: "Tetuan",
        respondent: "Tetuan",
    });

    const [street, setStreet] = useState({
        complainant: getStreets("Tetuan")[0],
        respondent:  getStreets("Tetuan")[0],
    });

    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    
    const handlePrev = () => {
        if (stepNumber === 1) {
            if (userRole === 'admin') {
                navigate('/Admin/File-Case');
            } else {
                navigate(
                    '/@' + userInfo.name.replace(" ", "_") + '/File-Case'
                );
            }
            return; 
        }

        setStepNumber((prev) => prev - 1);
    };

    return(
        <main className="flex flex-col w-full h-full items-center justify-center gap-3 bg-white">
            <div className=" w-full flex items-center justify-center pt-8 pb-20 border-b border-zinc-200">
                <div className="flex items-center">
                    {formProgress.map((step) => (
                        <div key={step.number} className="flex items-center">
                            <div className="flex flex-col items-center gap-2 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center p-2 
                                ${step.number === stepNumber ? 'border border-redBase text-redBase' : step.number < stepNumber ? 'bg-redBase text-white' : 'border border-zinc-400 text-zinc-400'}`
                                }>
                                    {step.number}   
                                </div>
                                <p className={`text-sm absolute top-10 text-center ${step.number === stepNumber || step.number < stepNumber ? 'text-redBase' : 'text-zinc-400'}`}>{step.title}</p>
                            </div>
                            
                            {step.number !== formProgress.length && (
                                <div className={`w-[120px] border 
                                ${step.number < stepNumber ? 'border-redBase' : 'border-zinc-400'}
                                `}></div>
                            )}
                        </div>
                    ))}
                </div> 
            </div>
            <form className="w-full flex flex-col items-center gap-6 h-max my-6">

            {stepNumber == 1 && (
                <div className="grid grid-cols-2 gap-3">
                    <p className="col-span-2 text-center text-2xl mb-3">Complainant Information</p>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="firstNameComplainant">First Name
                            <span className="text-redBase">*</span></Label>
                        <Input id="firstNameComplainant" type="text" className="w-72" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="lastNameComplainant">Last Name
                            <span className="text-redBase">*</span></Label>
                        <Input id="lastNameComplainant" type="text" className="w-72" />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="middleNameComplainant">Middle Name
                            <span className="text-redBase">*</span>
                        </Label>
                        <Input id="middleNameComplainant" type="text" className="w-72" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="birthdayComplainant">Birthday
                            <span className="text-redBase">*</span>
                        </Label>
                        <Popover open={openCalendar.complainant}  onOpenChange={(open) =>
                                setOpenCalendar((prev) => ({ ...prev, complainant: open }))
                            } id="birthdayComplainant" >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-72 justify-between font-normal"
                                >
                                    {birthDates.complainant ? birthDates.complainant.toLocaleDateString() : "Select date"}
                                    <CalendarIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                                <Calendar
                                    mode="single"
                                    selected={birthDates.complainant}
                                    captionLayout="dropdown"
                                    disabled={(date) => date > maxDate || date < minDate}
                                    onSelect={(date) => {
                                        setBirthDates((prev) => ({ ...prev, complainant: date }));
                                        setOpenCalendar((prev) => ({ ...prev, complainant: false }));
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
                                {sex.complainant || "Select"} 
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56">
                                <DropdownMenuRadioGroup
                                value={sex.complainant}
                                onValueChange={(value) =>
                                    setSex((prev) => ({ ...prev, complainant: value }))
                                }
                                >
                                <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="contactComplainant">Contact Number
                            <span className="text-redBase">*</span></Label>
                        <Input id="contactComplainant" type="text" className="w-72" />
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
                                        <Button variant="outline">{barangay.complainant || 'Select'}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup value={barangay.complainant} 
                                        onValueChange={(value) => {
                                            setBarangay((prev) => ({ ...prev, complainant: value }));
                                            setStreet((prev) => ({ ...prev, complainant: getStreets(value)[0] }));
                                        }}>
                                        {getBarangayNames().map(name => (
                                            <DropdownMenuRadioItem key={name} value={name}>{name}</DropdownMenuRadioItem>
                                        ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Label htmlFor="streetComplainant">Street</Label>
                                <DropdownMenu id="streetComplainant">
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">{street.complainant || 'Select'}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup value={street.complainant} onValueChange={(value) => setStreet((prev) => ({ ...prev, complainant: value }))}>
                                        {getStreets(barangay.complainant).map(street => (
                                            <DropdownMenuRadioItem key={street} value={street}>{street}</DropdownMenuRadioItem>
                                        ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <Label htmlFor="addInfoComplainant">Additional Information</Label>
                            <Input id="addInfoComplainant" type="text" className="w-full" />
                        </div>
                    </div>
                </div>
            )}
            
            {stepNumber == 2 && (
                <div className="grid grid-cols-2 gap-3">
                    <p className="col-span-2 text-center  text-2xl mb-3">Respondent Information</p>
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
                        <Label htmlFor="middleInitialRespondent">Middle Initial
                        </Label>
                        <Input id="middleInitialRespondent" type="text" className="w-72" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="birthdayRespondent">Birthday
                        </Label>
                        <Popover open={openCalendar.respondent}  onOpenChange={(open) =>
                                setOpenCalendar((prev) => ({ ...prev, respondent: open }))
                            } id="birthdayRespondent" >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-72 justify-between font-normal"
                                >
                                    {birthDates.respondent ? birthDates.respondent.toLocaleDateString() : "Select date"}
                                    <CalendarIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                                <Calendar
                                    mode="single"
                                    selected={birthDates.respondent}
                                    captionLayout="dropdown"
                                    disabled={(date) => date > maxDate || date < minDate}
                                    onSelect={(date) => {
                                        setBirthDates((prev) => ({ ...prev, respondent: date }));
                                        setOpenCalendar((prev) => ({ ...prev, respondent: false }));
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
                                {sex.respondent || "Select"} 
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56">
                                <DropdownMenuRadioGroup
                                value={sex.respondent}
                                onValueChange={(value) =>
                                    setSex((prev) => ({ ...prev, respondent: value }))
                                }
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
                                        <Button variant="outline">{barangay.respondent || 'Select'}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup value={barangay.respondent} 
                                        onValueChange={(value) => {
                                            setBarangay((prev) => ({ ...prev, respondent: value }));
                                            setStreet((prev) => ({ ...prev, respondent: getStreets(value)[0] }));
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
                                        <Button variant="outline">{street.respondent || 'Select'}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup value={street.respondent} onValueChange={(value) => setStreet((prev) => ({ ...prev, respondent: value }))}>
                                        {getStreets(barangay.respondent).map(street => (
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
            )}
            </form>
            <div className="flex items-center justify-between w-1/2 pb-12 pt-6">
                <Button onClick={handlePrev} variant="outline" className="text-redBase  !border-redBase ">
                    <ChevronLeft />
                    Previous
                </Button>
                <Button onClick={() => setStepNumber(prev => prev + 1)} className="!bg-redBase">
                    Next
                    <ChevronRight />
                </Button>
            </div>
        </main>

    )
}