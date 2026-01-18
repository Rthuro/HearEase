import { Label } from "@/components/ui/label";
import { PageSync } from "@/components/PageSync";
import { useEffect, useState } from "react";
import { User2, Bell, LockKeyhole, LogOut, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLuponStore } from "@/store/useLuponStore";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import toast from "react-hot-toast";
import PhoneVerification from "@/components/PhoneVerification";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import AccountVerification from "@/components/AccountVerification";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAddressesStore } from "@/store/useAddressStore";
import { getBarangayName, getStreets, getBarangay } from "@/lib/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NotificationSettings from "@/components/NotificationSettings";
export function Settings(){
    const { loading, updateUser, fetchUser, sendOTP, verifyOTP } = useUserStore();
    const [user, setUser] = useState(null);
    const [ account, switchAccount ] = useState(true);
    const [ notifications, switchNotifications ] = useState(false);
    const { members } = useLuponStore();
    const { userLinkName } = useAuthenticationStore();
    const { barangays , streets, fetchBarangays, fetchStreets } = useAddressesStore();

    const [firstName, setFirstName] = useState(user?.first_name || "");
    const [middleName, setMiddleName] = useState(user?.middle_name || "");
    const [lastName, setLastName] = useState(user?.last_name || "");
    const [contactNumber, setContactNumber] = useState(user?.contact_number || "");
    const [sex, setSex] = useState(user?.sex || "");
    const [birthDate, setBirthDate] = useState(user?.birth_date || "");
    const [openCalendar, setOpenCalendar] = useState(false);
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    
    // Address States
    const [selectedBarangay, setSelectedBarangay] = useState(user?.barangay || "");
    const [selectedStreet, setSelectedStreet] = useState(user?.street || "");
    const [additionalInfo, setAdditionalInfo] = useState(user?.additional_info || "");

    const [email, setEmail] = useState(user?.email || "");
    const [loader, setLoader] = useState(false);

    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
    
        if (timeLeft === 0) return;

        const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    useEffect(() => {
        // if (userRole !== "admin") {
        //     const fetchData = async () => {
        //         setLoader(true);
        //         const userData = await fetchUser();
        //         setUser(userData);
        //         setLoader(false);
        //     };
            
        //     fetchData();
        // } 

        const fetchData = async () => {
            setLoader(true);
            const userData = await fetchUser();
            setUser(userData);
            setLoader(false);
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        setLoader(true);
        if(barangays.length === 0) {
            fetchBarangays();
        }
        if  (streets.length === 0) {
            fetchStreets();
        }

        if(user && streets.length > 0 && barangays.length > 0) {
            setLoader(false);
            setFirstName(user.first_name || "");
            setMiddleName(user.middle_name || "");
            setLastName(user.last_name || "");
            setSex(user.sex || "");
            setSelectedBarangay(user.barangay || "");
            setSelectedStreet(user.street || "");
            setAdditionalInfo(user.additional_info || "");
            setContactNumber(user.contact_number || "");
            setEmail(user.email || "");
        } 
    }, [user, streets, barangays]);

    const hasChanges = 
        firstName !== (user?.first_name || "") || 
        middleName !== (user?.middle_name || "") || 
        lastName !== (user?.last_name || "") ||
        sex !== (user?.sex || "") ||
        selectedBarangay !== (user?.barangay || "") ||
        selectedStreet !== (user?.street || "") ||
        additionalInfo !== (user?.additional_info || "");

    const emailHasChanges = 
        email !== (user?.email || "");

    const handleUpdate = async (section) => {
        let updatedData = null;

        if( section === "profile"){
            updatedData = {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                sex: sex,
                barangay: selectedBarangay,
                street: selectedStreet,
                additional_info: additionalInfo
            };
        }

        if( section === "contact"){
             if( isNaN(contactNumber) ) {
                toast.error("Contact number should contain only numbers.");
                return;
            }

            if(contactNumber.length !== 11 || !contactNumber.startsWith("09")) {
                toast.error("Please enter a valid contact number in the format 09XXXXXXXXX.");
                return;
            }

            updatedData = {
                contact_number: contactNumber,
                is_contact_verified: false,
            };
        }

        if( section === "email"){
            updatedData = {
                email: email,
                is_email_verified: false,
            };
        }

        await updateUser(user.id, updatedData);
        fetchUser().then((data) => setUser(data));
    };

    const handleReset = (section) => {
        if( section === "profile"){
            setFirstName(user.first_name || "");
            setMiddleName(user.middle_name || "");
            setLastName(user.last_name || "");
            setSex(user.sex || "");
            setSelectedBarangay(user.barangay || "");
            setSelectedStreet(user.street || "");
            setAdditionalInfo(user.additional_info || "");
        }

        if( section === "contact"){
            setContactNumber(user.contact_number || "");
        }

        if( section === "email"){
            setEmail(user.email || "");
        }
    }

    const [emailCode, setEmailCode] = useState("");
    const [emailStep, setEmailStep] = useState("start");
    const [emailLoading, setEmailLoading] = useState(false);
    
    const handleSendEmailOTP = async () => {
        await sendOTP(null, "email");
        setEmailStep("input");
        setTimeLeft(600); 
    }

    const handleVerifyEmailOTP = async (code) => {
        if (code.length !== 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        };

        setEmailLoading(true);
        await verifyOTP(code, "email");
        
        setEmailStep("start")
        setEmailLoading(false); 
        fetchUser().then((data) => setUser(data));
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    
    return (
        <div className="flex bg-white h-full">
            <PageSync page="Profile" />
            
            <div className="flex flex-col gap-2 h-full border-r px-3 py-6">
                <button onClick={() => {
                    switchAccount(true)
                    switchNotifications(false)
                }} 
                className={`flex items-center gap-2 p-3 rounded-md ${account ? "bg-red-50 text-redBase" : ""}`}>
                    <User2 className="size-4" />
                    Account Information
                </button>
                <button onClick={() => {
                    switchNotifications(true)
                    switchAccount(false)
                    }}
                     className={`flex items-center gap-2 p-3 rounded-md ${notifications ? "bg-red-50 text-redBase" : ""}`}>
                    <Bell className="size-4" />
                    Notifications
                </button>

            </div>
            { loader ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin size-6 text-redBase" />
                </div>
            ) : (null)}
            
            { !loader && account && (
                <div className="flex-1 flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-medium">Account Information</h2>
                        <p className=" text-zinc-500">Manage your account information</p>
                    </div>

                    <div className="flex items-center justify-between bg-white p-4 border rounded-lg">
                        <div className="flex flex-col gap-1">
                            <p className="text-lg font-medium">Verify your account</p>
                            <p className="text-sm text-zinc-500">Please verify your account to access all features.</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-redBase">Verify Now</Button>
                            </DialogTrigger>
                            <DialogContent className="sw-fit">
                                <AccountVerification />     
                            </DialogContent>
                        </Dialog>
                    </div>
                    

                    <p className="text-lg font-medium">Profile</p>
                    <Card className="py-3 rounded-sm gap-2 mb-3">
                        <CardContent className="px-0">
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-2 px-3">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-2 px-3">
                                        <Label htmlFor="middleName">Middle Name</Label>
                                        <Input
                                            id="middleName"
                                            type="text"
                                            placeholder="Middle Name"
                                            value={middleName}
                                            onChange={(e) => setMiddleName(e.target.value)}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-2 px-3">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-2 px-3">
                                        <Label htmlFor="lastName">Sex</Label>
                                        <DropdownMenu id="sex">
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                {sex || "Select"} 
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuRadioGroup
                                                value={sex}
                                                onValueChange={(value) => 
                                                    setSex(value)}
                                                >
                                                <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Separator/>
                                <Separator />
                                <div className="grid grid-cols-2 gap-2 px-3">
                                    <Label htmlFor="barangay">Barangay</Label>
                                    <DropdownMenu id="barangay">
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            {getBarangayName(barangays, selectedBarangay) || 'Select'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup 
                                        value={selectedBarangay} 
                                        onValueChange={(value) => {
                                            const streetsForBarangay = getStreets(streets, value);

                                            setSelectedBarangay(value);
                                            setSelectedStreet(streetsForBarangay[0] || "");
                                        }}>

                                        {barangays.map(b => (
                                            <DropdownMenuRadioItem key={b.name} value={b.id}>{b.name}
                                            </DropdownMenuRadioItem>
                                        ))}

                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-2 px-3">
                                    <Label htmlFor="street">Street</Label>
                                    <DropdownMenu id="street">
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            {selectedStreet  || 'Select'
                                            }
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                        <DropdownMenuRadioGroup 
                                        value={selectedStreet} onValueChange={(value) => 
                                        setSelectedStreet(value)}>

                                        { getStreets(streets,  getBarangay(barangays, selectedBarangay)?.id).map(street => (
                                                <DropdownMenuRadioItem key={street} 
                                                value={street}>{street}
                                                </DropdownMenuRadioItem>
                                            ))
                                        }
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-2 px-3">
                                    <Label htmlFor="additionalInfo">Additional Info</Label>
                                    <Input
                                        id="additionalInfo"
                                        type="text"
                                        placeholder="Additional Info"
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                    />
                                </div>
                            </div>

                        </CardContent>
                        
                        <CardFooter className="flex-col gap-2 items-end">
                            { hasChanges ? (
                                <div className="flex gap-2">
                                    <Button onClick={() => handleReset("profile")} variant="outline" className="w-fit">
                                        Cancel
                                    </Button> 
                                    <Button onClick={() => handleUpdate("profile")} className="w-fit">
                                         { loading ? (
                                            <>
                                             <Loader2 className="animate-spin size-5 " />
                                            Saving...
                                            </>
                                        ) : ("Save")}
                                    </Button> 
                                </div>
                                ) : (
                                    <Button variant="secondary" className="w-fit" disabled>
                                    Save
                                </Button>
                                )}
                        </CardFooter>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-medium">Contact Verification</h2>
                        <p className="text-zinc-500">
                            Manage and verify your contact details. This is important for communication and notifications.
                        </p>
                    </div>

                    <PhoneVerification user={user} setUser={setUser} handleUpdate={handleUpdate} handleReset={handleReset} formatTime={formatTime} />
                    
                    <Card className="py-3 rounded-sm gap-2 mb-3">
                        <CardContent className="px-0">
                                <div id="contact" className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-2 px-3">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            Email
                                            {user?.email && (
                                                user?.is_email_verified ? (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Unverified
                                                    </span>
                                                )
                                            )}
                                        </Label>
                                         
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex gap-2 items-end justify-end px-3">
                                        {!user?.is_email_verified && user?.email ? (
                                            <Button size="sm" className="bg-redBase hover:bg-red-700 text-white"
                                            onClick={handleSendEmailOTP}
                                            disabled={loading}>
                                                {loading ? "Sending..." : "Verify Now"}
                                            </Button>
                                         ) :  null}
                                        
                                        {emailHasChanges ? (
                                                <>
                                                    <Button size="sm"
                                                    onClick={() => handleUpdate("email")}>
                                                        Save
                                                    </Button> 
                                                    <Button variant="outline" size="sm" 
                                                    onClick={() => handleReset("email")}>
                                                        Cancel
                                                    </Button> 
                                                     
                                                </>
                                            ) : <Button variant="secondary" size="sm" disabled>
                                                        Save
                                            </Button> }
                                    </div>
                                </div>
                        </CardContent>
                    </Card>

                    {emailStep === "input" && (
                        <div className="flex flex-col gap-2">
                            <div className="w-fit flex flex-col gap-1">
                                <p className="font-medium text-lg">Verification Code</p>
                                <p className="text-sm text-zinc-600">Verification code has been sent to {user?.email}. Please enter the code below to verify your email. </p>
                            </div>
                        <Card className="py-3 rounded-sm gap-2 mb-3">
                            <CardContent className="px-0">
                                <div id="contact" className="flex flex-col gap-3 ">
                                    <div className="grid grid-cols-2 gap-2 px-3">
                                        <Label htmlFor="emailCode" className="flex items-center gap-2">
                                            Email Verification Code
                                        </Label>
                                            
                                        <Input
                                            id="emailCode"
                                            type="text"
                                            placeholder="XXXXXX"
                                            value={emailCode}
                                            maxLength={6}
                                            onChange={(e) => setEmailCode(e.target.value)}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between px-3">
                                        <p className="text-zinc-600 text-sm mt-4 text-center">
                                            Didn't receive a code?{" "}
                                            
                                            {timeLeft > 0 ? (
                                                <span className="text-zinc-400 cursor-not-allowed font-medium">
                                                    Resend in {formatTime(timeLeft)}
                                                </span>
                                            ) : (
                                                <button 
                                                    className="text-redBase underline font-medium hover:text-red-700 transition-colors" 
                                                    onClick={handleSendEmailOTP}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Sending..." : "Resend Code"}
                                                </button>
                                            )}
                                        </p>
                                        <div className="flex gap-3">
                                            <Button size="sm" className="bg-redBase hover:bg-red-700 text-white self-end"
                                            onClick={() => handleVerifyEmailOTP(emailCode)} disabled={emailLoading || emailCode.length < 6}>
                                                {emailLoading ? "Verifying..." : "Confirm"}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => {setEmailStep("start"); setEmailCode(""); setEmailLoading(false); } }>
                                                Cancel
                                            </Button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>)}
                </div>
                    
            )}

            { !account && notifications && (
                <NotificationSettings />
            )}
        </div>
    )
}