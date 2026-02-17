import { Label } from "@/components/ui/label";
import { PageSync } from "@/components/PageSync";
import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AccountVerification from "@/components/AccountVerification";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useAddressesStore } from "@/store/useAddressStore";
import { getBarangayName, getStreets, getBarangay, formatedBday } from "@/lib/helpers";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NotificationSettings from "@/components/NotificationSettings";
import { User2, Bell, LockKeyhole, LogOut, CalendarIcon, RefreshCw, Check, X, Loader2, Brain, Settings2, Filter, ListChecks } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useGoogleCalendarStore } from "@/store/useGoogleCalendarStore";
import { useAIModelStore } from "@/store/useAIModelStore";
import { useSearchParams } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { SystemConfiguration } from "@/components/SystemConfiguration";
import { SupportTickets } from "@/components/SupportTickets";
import { AdminTickets } from "@/components/AdminTickets";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function Settings() {
    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    const userRole = data.userRole;

    const [user, setUser] = useState(null);
    const { barangays, streets, fetchBarangays, fetchStreets } = useAddressesStore();
    const { updateUser, fetchUser, sendOTP, verifyOTP } = useUserStore();

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
        if (barangays.length === 0) {
            fetchBarangays();
        }
        if (streets.length === 0) {
            fetchStreets();
        }

        if (user && streets.length > 0 && barangays.length > 0) {
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
            setBirthDate(user.birth_date || "")
        }
    }, [user, streets, barangays]);

    console.log(user)

    const hasChanges =
        firstName !== (user?.first_name || "") ||
        middleName !== (user?.middle_name || "") ||
        lastName !== (user?.last_name || "") ||
        sex !== (user?.sex || "") ||
        selectedBarangay !== (user?.barangay || "") ||
        selectedStreet !== (user?.street || "") ||
        birthDate !== (user?.birth_date || "") ||
        additionalInfo !== (user?.additional_info || "");

    const emailHasChanges =
        email !== (user?.email || "");

    const handleUpdate = async (section) => {
        let updatedData = null;

        if (section === "profile") {
            updatedData = {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                sex: sex,
                barangay: selectedBarangay,
                street: selectedStreet,
                birth_date: birthDate,
                additional_info: additionalInfo
            };
        }

        if (section === "contact") {
            if (isNaN(contactNumber)) {
                toast.error("Contact number should contain only numbers.");
                return;
            }

            if (contactNumber.length !== 11 || !contactNumber.startsWith("09")) {
                toast.error("Please enter a valid contact number in the format 09XXXXXXXXX.");
                return;
            }

            updatedData = {
                contact_number: contactNumber,
                is_contact_verified: false,
            };
        }

        if (section === "email") {
            updatedData = {
                email: email,
                is_email_verified: false,
            };
        }

        toast.promise(updateUser(user.id, updatedData), {
            loading: "Updating user information...",
            success: (data) => {
                setUser(data);
                return "User information updated successfully!";
            },
            error: "Failed to update user information. Please try again.",
        });

    };

    const handleReset = (section) => {
        if (section === "profile") {
            setFirstName(user.first_name || "");
            setMiddleName(user.middle_name || "");
            setLastName(user.last_name || "");
            setSex(user.sex || "");
            setSelectedBarangay(user.barangay || "");
            setSelectedStreet(user.street || "");
            setAdditionalInfo(user.additional_info || "");
        }

        if (section === "contact") {
            setContactNumber(user.contact_number || "");
        }

        if (section === "email") {
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

    const {
        status: aiStatus,
        loading: aiLoading,
        retraining,
        fetchStatus: fetchAIStatus,
        triggerRetrain,
        updateConfig
    } = useAIModelStore();
    const [searchParams] = useSearchParams();

    const {
        connected,
        connectedUser,
        loading,
        syncing,
        lastUpdated,
        checkStatus,
        connectGoogleCalendar,
        disconnect,
        syncAll,
        syncSettings,
        fetchSyncSettings,
        updateSyncSettings,
        syncPreferences,
        fetchSyncPreferences,
        updateSyncPreferences,
        myHearings,
        myHearingsLoading,
        fetchMyHearings,
    } = useGoogleCalendarStore();

    const [selectedHearingIds, setSelectedHearingIds] = useState([]);

    useEffect(() => {
        // Check Google Calendar status for current user
        checkStatus(data?.email);

        // Fetch sync settings
        fetchSyncSettings();

        // Fetch per-user sync preferences
        fetchSyncPreferences(data?.email);

        // Fetch AI model status
        fetchAIStatus();

        // Handle OAuth callback params
        const googleConnected = searchParams.get('google_connected');
        const googleError = searchParams.get('google_error');

        if (googleConnected === 'true') {
            toast.success('Google Calendar connected successfully!');
            checkStatus(data?.email);
        }
        if (googleError) {
            toast.error(`Google Calendar error: ${googleError}`);
        }
    }, []);

    // Load sync preferences and my hearings when preferences change
    useEffect(() => {
        if (syncPreferences) {
            setSelectedHearingIds(syncPreferences.selected_hearing_ids || []);
        }
    }, [syncPreferences]);

    // Fetch hearings when sync filter is "selected"
    useEffect(() => {
        if (syncPreferences?.sync_filter === 'selected' || connected) {
            fetchMyHearings(data?.email);
        }
    }, [syncPreferences?.sync_filter, connected]);


    return (
        <div className="flex flex-col bg-white h-full p-6 gap-6">
            <PageSync page="Settings" />
            {loader ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin size-6 text-redBase" />
                </div>
            ) : null}

            {userRole !== "admin" && !user?.is_account_verified && (
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
            )}

            <Tabs defaultValue="account" className="">
                <TabsList>
                    <TabsTrigger value="account">Account Information</TabsTrigger>
                    <TabsTrigger value="notif">Notification</TabsTrigger>
                    <TabsTrigger value="autoSync">Auto-Sync Settings</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>

                    {userRole === "admin" && (
                        <>
                            <TabsTrigger value="aiModel">AI Model</TabsTrigger>
                            <TabsTrigger value="systemConfig">System Configuration</TabsTrigger>
                            <TabsTrigger value="adminTickets">Support Tickets</TabsTrigger>
                        </>
                    )}
                </TabsList>
                <TabsContent value="account">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-medium">Account Information</h2>
                            <p className=" text-zinc-500">Manage your account information</p>
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
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-2 px-3">
                                        <Label htmlFor="birthDate">Birth Date</Label>
                                        <Popover open={openCalendar} onOpenChange={setOpenCalendar} id="birth_date">
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    id="date"
                                                    className="justify-between font-normal"
                                                >
                                                    {birthDate ? formatedBday(birthDate) : "Select date"}
                                                    <CalendarIcon />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className=" overflow-hidden p-0 w-72" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={birthDate}
                                                    captionLayout="dropdown"
                                                    fromYear={1900}
                                                    toYear={new Date().getFullYear()}
                                                    disabled={(date) => date > maxDate || date < minDate}
                                                    onSelect={(date) => {
                                                        setBirthDate(date);
                                                        setOpenCalendar(false);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
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
                                                    {selectedStreet || 'Select'
                                                    }
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-72">
                                                <DropdownMenuRadioGroup
                                                    value={selectedStreet} onValueChange={(value) =>
                                                        setSelectedStreet(value)}>

                                                    {getStreets(streets, getBarangay(barangays, selectedBarangay)?.id).map(street => (
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
                                {hasChanges ? (
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleReset("profile")} variant="outline" className="w-fit">
                                            Cancel
                                        </Button>
                                        <Button onClick={() => handleUpdate("profile")} className="w-fit">
                                            Save Changes
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

                        <PhoneVerification user={user} setUser={setUser} handleUpdate={handleUpdate} handleReset={handleReset} formatTime={formatTime} contactNumber={contactNumber} setContactNumber={setContactNumber} />

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
                                        ) : null}

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
                                        </Button>}
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
                                                    <Button variant="outline" size="sm" onClick={() => { setEmailStep("start"); setEmailCode(""); setEmailLoading(false); }}>
                                                        Cancel
                                                    </Button>
                                                </div>

                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>)}
                    </div>
                </TabsContent>

                <TabsContent value="notif">
                    <NotificationSettings />
                </TabsContent>

                <TabsContent value="integrations">
                    <div className="flex-1 flex flex-col gap-4">
                        <h2 className="text-lg font-medium">Integrations</h2>
                        {/* Google Calendar Connection Section */}
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <CalendarIcon className="size-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Google Calendar</h3>
                                        <p className="text-sm text-gray-500">
                                            Sync hearings to your Google Calendar
                                        </p>
                                    </div>
                                </div>

                                {loading ? (
                                    <Loader2 className="size-5 animate-spin text-gray-400" />
                                ) : connected ? (
                                    <span className="flex items-center gap-1 text-green-600 text-sm">
                                        <Check className="size-4" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                                        <X className="size-4" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            {connected && (
                                <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
                                    <p><strong>Connected as:</strong> {connectedUser}</p>
                                    {lastUpdated && (
                                        <p className="text-gray-500">
                                            Last synced: {new Date(lastUpdated).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                {connected ? (
                                    <>
                                        <Button
                                            onClick={() => syncAll(data?.email)}
                                            disabled={syncing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {syncing ? (
                                                <>
                                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                                    Syncing...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="size-4 mr-2" />
                                                    Sync Hearings
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => disconnect(data?.email)}
                                            disabled={loading}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            Disconnect
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => connectGoogleCalendar(data?.email, userRole)}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {loading ? (
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                        ) : (
                                            <CalendarIcon className="size-4 mr-2" />
                                        )}
                                        Connect Google Calendar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Sync Filter Preferences — shown when connected */}
                        {connected && (
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Filter className="size-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Sync Filter</h3>
                                        <p className="text-sm text-gray-500">
                                            Choose which hearings to sync to your calendar
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Filter options */}
                                    <div className="space-y-2">
                                        {[
                                            { value: "all", label: "All Hearings", desc: "Sync all future hearings" },
                                            { value: "my_hearings", label: "Only My Hearings", desc: "Sync only hearings related to you" },
                                            { value: "selected", label: "Selected Hearings", desc: "Choose specific hearings to sync" },
                                        ].map((option) => (
                                            <label
                                                key={option.value}
                                                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${(syncPreferences?.sync_filter || (userRole === 'admin' ? 'all' : 'my_hearings')) === option.value
                                                        ? 'border-blue-300 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="syncFilter"
                                                    value={option.value}
                                                    checked={(syncPreferences?.sync_filter || (userRole === 'admin' ? 'all' : 'my_hearings')) === option.value}
                                                    onChange={() => updateSyncPreferences(data?.email, option.value, selectedHearingIds)}
                                                    className="accent-blue-600"
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">{option.label}</p>
                                                    <p className="text-xs text-gray-500">{option.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Selected hearings picker */}
                                    {(syncPreferences?.sync_filter === 'selected') && (
                                        <div className="border-t pt-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ListChecks className="size-4 text-gray-500" />
                                                <p className="font-medium text-sm">Select Hearings to Sync</p>
                                            </div>
                                            {myHearingsLoading ? (
                                                <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Loading hearings...
                                                </div>
                                            ) : myHearings.length === 0 ? (
                                                <p className="text-sm text-gray-400 py-2">No upcoming hearings found.</p>
                                            ) : (
                                                <>
                                                    <div className="max-h-60 overflow-y-auto space-y-1">
                                                        {myHearings.map((h) => (
                                                            <label
                                                                key={h.id}
                                                                className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${selectedHearingIds.includes(h.id)
                                                                        ? 'bg-blue-50 border border-blue-200'
                                                                        : 'hover:bg-gray-50 border border-transparent'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedHearingIds.includes(h.id)}
                                                                    onChange={(e) => {
                                                                        const newIds = e.target.checked
                                                                            ? [...selectedHearingIds, h.id]
                                                                            : selectedHearingIds.filter(id => id !== h.id);
                                                                        setSelectedHearingIds(newIds);
                                                                    }}
                                                                    className="accent-blue-600"
                                                                />
                                                                <div className="flex-1">
                                                                    <span className="font-medium">Case #{h.case_id}</span>
                                                                    <span className="text-gray-400 ml-2">{h.case_type}</span>
                                                                    <span className="text-gray-400 ml-2">
                                                                        {h.hearing_date} {h.time ? `at ${h.time}` : ''}
                                                                    </span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-gray-400">
                                                            {selectedHearingIds.length} of {myHearings.length} selected
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateSyncPreferences(data?.email, 'selected', selectedHearingIds)}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            Save Selection
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="autoSync">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Settings2 className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Auto-Sync Settings</h3>
                                    <p className="text-sm text-gray-500">
                                        Automatically sync hearings when created or updated
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Main Auto-Sync Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-medium">Enable Auto-Sync</p>
                                    <p className="text-sm text-gray-500">
                                        Automatically sync hearings to Google Calendar
                                    </p>
                                </div>
                                <Switch
                                    checked={syncSettings?.auto_sync_enabled || false}
                                    onCheckedChange={(checked) => {
                                        updateSyncSettings({ auto_sync_enabled: checked });
                                    }}
                                />
                            </div>

                            {/* Granular Settings */}
                            {syncSettings?.auto_sync_enabled && (
                                <div className="border-l-2 border-blue-300 pl-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Sync on hearing creation</span>
                                        <Switch
                                            checked={syncSettings?.sync_on_create || false}
                                            onCheckedChange={(checked) => {
                                                updateSyncSettings({ sync_on_create: checked });
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Sync on hearing update</span>
                                        <Switch
                                            checked={syncSettings?.sync_on_update || false}
                                            onCheckedChange={(checked) => {
                                                updateSyncSettings({ sync_on_update: checked });
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Remove from calendar on delete</span>
                                        <Switch
                                            checked={syncSettings?.sync_on_delete || false}
                                            onCheckedChange={(checked) => {
                                                updateSyncSettings({ sync_on_delete: checked });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400">
                                When connected, all hearing schedules will automatically sync to a dedicated
                                "HearEase Hearings" calendar in Google Calendar.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="aiModel">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-medium">AI Model Management</h2>

                            {/* Training Status */}
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Brain className="size-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Model Retraining</h3>
                                            <p className="text-sm text-gray-500">
                                                Train the AI model with resolved cases
                                            </p>
                                        </div>
                                    </div>

                                    {aiLoading ? (
                                        <Loader2 className="size-5 animate-spin text-gray-400" />
                                    ) : aiStatus?.ready_to_retrain ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <Check className="size-4" />
                                            Ready
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                                            Need 50+ resolved cases
                                        </span>
                                    )}
                                </div>

                                {aiStatus && (
                                    <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm space-y-1">
                                        <p><strong>Total Resolved Cases:</strong> {aiStatus.total_resolved_cases || 0}</p>
                                        <p><strong>Cases Since Last Train:</strong> {aiStatus.cases_since_last_train || 0} / {aiStatus.threshold_cases || 10}</p>
                                        {aiStatus.last_training && (
                                            <>
                                                <p className="text-gray-500">
                                                    Last trained: {new Date(aiStatus.last_training.trained_at).toLocaleString()}
                                                    ({aiStatus.last_training.samples} samples, {aiStatus.last_training.triggered_by})
                                                </p>
                                                {/* MAPE Display - Model Accuracy */}
                                                {(aiStatus.last_training.mape_hearings !== null || aiStatus.last_training.mape_days !== null) && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="font-medium text-gray-700 mb-1">Model Accuracy:</p>
                                                        {aiStatus.last_training.mape_hearings !== null && (
                                                            <p className="text-gray-600">
                                                                Hearings Prediction: <span className={`font-medium ${aiStatus.last_training.mape_hearings <= 15 ? 'text-green-600' : aiStatus.last_training.mape_hearings <= 30 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                    {aiStatus.last_training.mape_hearings.toFixed(1)}% error
                                                                </span>
                                                            </p>
                                                        )}
                                                        {aiStatus.last_training.mape_days !== null && (
                                                            <p className="text-gray-600">
                                                                Resolution Days: <span className={`font-medium ${aiStatus.last_training.mape_days <= 15 ? 'text-green-600' : aiStatus.last_training.mape_days <= 30 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                    {aiStatus.last_training.mape_days.toFixed(1)}% error
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={async () => {
                                            const result = await triggerRetrain();
                                            if (result?.success) {
                                                toast.success(`Model retrained with ${result.samples_trained} cases!`);
                                            } else {
                                                toast.error(result?.message || 'Retraining failed');
                                            }
                                        }}
                                        disabled={retraining || !aiStatus?.ready_to_retrain}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {retraining ? (
                                            <>
                                                <Loader2 className="size-4 mr-2 animate-spin" />
                                                Training...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="size-4 mr-2" />
                                                Retrain Now
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Auto-Retrain Config */}
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Settings2 className="size-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Auto-Retrain</h3>
                                            <p className="text-sm text-gray-500">
                                                Automatically retrain when threshold is reached
                                            </p>
                                        </div>
                                    </div>

                                    <Switch
                                        checked={aiStatus?.auto_retrain_enabled ?? true}
                                        onCheckedChange={async (checked) => {
                                            await updateConfig({ auto_retrain_enabled: checked });
                                            toast.success(checked ? 'Auto-retrain enabled' : 'Auto-retrain disabled');
                                        }}
                                    />
                                </div>

                                <p className="text-xs text-gray-500">
                                    When enabled, the model will automatically retrain after {aiStatus?.threshold_cases || 10} new
                                    cases are resolved.
                                </p>
                            </div>

                            <p className="text-xs text-gray-400">
                                The AI model learns from resolved cases to improve predictions for hearing
                                counts and resolution times.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="systemConfig">
                    <SystemConfiguration />
                </TabsContent>

                <TabsContent value="support">
                    <SupportTickets />
                </TabsContent>

                {userRole === "admin" && (
                    <TabsContent value="adminTickets">
                        <AdminTickets />
                    </TabsContent>
                )}
            </Tabs>

        </div>
    )
}
