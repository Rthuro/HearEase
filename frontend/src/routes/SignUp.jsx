import { Input } from "@/components/ui/input"
import Mail from "@/assets/custom_icons/mail.svg"
import Lock from "@/assets/custom_icons/https.svg"
import { Eye, EyeClosed } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { getBarangayNames, getStreets } from "@/lib/helpers"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSignUpStore } from "@/store/useSignUpStore"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import { checkSignUpEmail } from "@/store/useSignUpStore"
import { useNavigate } from "react-router-dom"
import useAuthenticationStore from "@/store/useAuthenticationStore"

export function SignUp(){
    const navigate = useNavigate();
    const { formData, setFormData, registerUser } = useSignUpStore();
    const { userLinkName } = useAuthenticationStore();
    const [openCalendar, setOpenCalendar] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passType, setPassType] = useState("password");
    
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        setPassType(showPassword ? "password" : "text");
    }

    const checkInputs = async (e) => {
        e.preventDefault();

        if( formData.email === "" || formData.password === "" || formData.first_name === "" || formData.last_name === "" || formData.birth_date === null || formData.contact_number === "" || formData.sex === "" || formData.barangay === "" || formData.street === "" ){
            toast.error("Please fill in all required fields");
            return;
        }

        const res = await checkSignUpEmail(formData.email);

        if(!res){
            return;
        }

        const checkResgister = registerUser();

        if(checkResgister){
            navigate(`/${userLinkName}`);
        }

    }


    return (
        <form onSubmit={checkInputs} className="grid grid-cols-1 w-fit mx-auto gap-10 pb-12 ">
            <div className="flex flex-col justify-center items-center gap-2">
                <p className="text-xl text-center">Sign Up</p>
                <p className="text-lg text-center text-zinc-600">Please enter your details to create an account.</p>
            </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center relative ">
                <img src={Mail} alt="email icon" className="absolute ml-3"/>
                <Input type="email" id="email" placeholder="Enter your email..." className="pl-10" autoComplete="email" value={formData.email} onChange={(e) => setFormData('email', e.target.value)} required />
            </div>
            <div className="flex items-center relative ">
                <img src={Lock} alt="lock icon" className="absolute ml-3"/>
                <Input type={passType} id="password" placeholder="Enter your password..." className="pl-10 pr-3" autoComplete="current-password" value={formData.password} onChange={(e) => setFormData('password', e.target.value)} required />
                { showPassword ?
                    <Eye className="absolute right-3 cursor-pointer text-redBase" onClick={togglePasswordVisibility} />
                    :
                    <EyeClosed className="absolute right-3 cursor-pointer text-redBase" onClick={togglePasswordVisibility} />
                }
            </div> 
            <Separator className="col-span-2" />
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="first_name">First Name
                    <span className="text-redBase">*</span>
                </Label>
                <Input id="first_name" type="text" className="w-72" 
                value={formData.first_name}
                onChange ={ (e) => {
                    setFormData('first_name', e.target.value);
                }}
                required
                />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="middle_name">Middle Name
                </Label>
                <Input id="middle_name" type="text" className="w-72"
                value={formData.middle_name} 
                onChange ={ (e) => {
                    setFormData('middle_name', e.target.value);
                }}
                />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="last_name">Last Name
                    <span className="text-redBase">*</span>
                </Label>
                <Input id="last_name" type="text" className="w-72"
                value={formData.last_name}
                onChange ={ (e) => {
                    setFormData('last_name', e.target.value);
                }}
                required/>
            </div>

            
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="birth_date">
                    Birthday
                    <span className="text-redBase">*</span>
                </Label>
                <Popover open={openCalendar}  onOpenChange={setOpenCalendar} id="birth_date">
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-72 justify-between font-normal"
                        >
                            {formData.birth_date ? 
                            formData.birth_date.toLocaleDateString() : "Select date"}
                            <CalendarIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.birth_date ?? undefined}
                            captionLayout="dropdown"
                            disabled={(date) => date > maxDate || date < minDate}
                            onSelect={(date) => {
                                setOpenCalendar(false);
                                setFormData('birth_date', date);
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
                        {formData.sex || "Select"} 
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup
                        value={formData.sex}
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
                <Label htmlFor="contact_number">
                    Contact Number
                    <span className="text-redBase">*</span>
                </Label>
                <Input id="contact_number" type="tel"
                placeholder="09876543210"
                inputMode="numeric"         
                pattern="[0-9]*"              
                maxLength={11} 
                className="w-72"
                value={formData.contact_number}
                onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "");
                    setFormData('contact_number', onlyDigits);
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
                                    {formData.barangay || 'Select'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup 
                                value={formData.barangay} 
                                onChange={(value) => {
                                    setFormData('barangay', value);
                                    setFormData('street', getStreets(value)[0]);
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
                        <Label htmlFor="street">
                            Street
                            <span className="text-redBase">*</span>
                        </Label>
                        <DropdownMenu id="street">
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {formData.street || 'Select'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                                <DropdownMenuRadioGroup 
                                value={formData.street} onValueChange={(value) => 
                                setFormData('street', value)}>

                                { getStreets(formData.barangay).map(street => (
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
                    value={formData.additional_info}
                    onChange={(e) => 
                        setFormData('additional_info', e.target.value)} 
                    />
                </div>
            </div>
        </div>
            <button type="submit" className="w-fit bg-redBase text-white py-2 px-12 rounded-md text-center cursor-pointer mx-auto" >Sign In</button>
        </form>
    )
}