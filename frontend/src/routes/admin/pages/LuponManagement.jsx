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
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getStreets } from "@/lib/helpers";
import { useLuponStore } from "@/store/useLuponStore"
import { useAddressesStore } from "@/store/useAddressStore"
import { useEffect } from "react"
import { CustomTable } from "@/components/CustomTable"
import { toast } from "react-hot-toast"
import { invalidContactNumber } from "@/lib/helpers";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore"
import { Separator } from "@/components/ui/separator"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/firebase"

export function LuponManagement() {
    const { barangays, fetchBarangays, streets } = useAddressesStore();
    const { formData, setFormData, members, fetchMembers, addMember } = useLuponStore();
    const {addAdminGoogleAccount} = useAuthenticationStore();
    const { admin_list, fetchAdmins } = useRetrieveUsersStore();
    const [openCalendar, setOpenCalendar] = useState(false);
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    const [adminList, setAdminList] = useState(admin_list);

    useEffect(() => {
        fetchBarangays();
    }, [fetchBarangays]);

    useEffect(() => {
        fetchMembers();
        fetchAdmins();
    }, [fetchMembers]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentFormData = formData;

        for (const field in currentFormData) {
            if (currentFormData[field]?.required) {
                const value = currentFormData[field]?.value;
                if (value === null || value === undefined || value === '') {
                    toast.error("Please fill in all required fields.");
                    return;
                }

                if (field === 'contact_number') {
                    if (invalidContactNumber(value)) {
                        toast.error("Invalid contact number format.");
                        return;
                    }
                }
            }
        }

        if (formData.sched.value.length <= 0) {
            toast.error("Please fill in lupon schedule.");
            return;
        }

        addMember();

    };

    const memberData = members.map(member => ({
        name: `${member.first_name} ${member.middle_name ? member.middle_name + ' ' : ''}${member.last_name}`,
        address: `${member.street}, ${member.barangay}`,
        schedule: (member.sched || []).join(", "),
        url: `/Admin/Lupon/${member.id}`
    }));

    const membersSchedules = {
        Monday: members.filter(member => (member.sched || []).includes("Monday")),
        Tuesday: members.filter(member => (member.sched || []).includes("Tuesday")),
        Wednesday: members.filter(member => (member.sched || []).includes("Wednesday")),
        Thursday: members.filter(member => (member.sched || []).includes("Thursday")),
        Friday: members.filter(member => (member.sched || []).includes("Friday")),
        Saturday: members.filter(member => (member.sched || []).includes("Saturday")),
        Sunday: members.filter(member => (member.sched || []).includes("Sunday")),
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [addAdminLoader, setAddAdminLoader] = useState(false);
    console.log(adminList)
    const handleGoogle = async () => {
            try {

                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;

                const token = await user.getIdToken();

                setAddAdminLoader(true);
                toast.promise(addAdminGoogleAccount(token),{ 
                    loading: "Adding admin account",
                    success: () => {
                        fetchAdmins().then((data) => setAdminList(data));
                        return "Succefully Added New Admin."
                    } ,
                    error: "Failed to add admin account. Please try again."
                })

            } catch (error) {
                console.error("Google Auth Error:", error);
                toast.error("Failed to add account with Google");
            } finally {
                setAddAdminLoader(false);
            }
        };
    return (
        <div className="p-6 flex flex-col gap-2">
            <PageSync page="Lupon Management" />
            <div className="overflow-hidden w-5xl">
                <div className="border rounded-lg  bg-white ">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Object.keys(membersSchedules).map((day) => (
                                <TableHead key={day} className="text-left px-4 py-2">
                                    {day}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        <TableRow>
                            {Object.keys(membersSchedules).map((day) => (
                                <TableCell key={day} className="px-4 py-2 align-top">
                                    {membersSchedules[day].length > 0 ? (
                                        <ul className="space-y-1">
                                            {membersSchedules[day].map((m) => (
                                                <li key={m.id} className="text-sm">
                                                    {m.first_name}{" "}
                                                    {m.middle_name ? m.middle_name + " " : ""}
                                                    {m.last_name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-zinc-400">—</span>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
                </div>
            </div>
            
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
                                <div className="grid grid-cols-2 gap-4 overflow-y-scroll max-h-[400px] px-2 mb-4">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label htmlFor="first_name">First Name
                                            <span className="text-redBase">*</span></Label>
                                        <Input id="first_name" type="text" className="w-72"
                                            value={formData.first_name.value}
                                            onChange={(e) => {
                                                setFormData('first_name', e.target.value);
                                            }}
                                            required />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label htmlFor="middle_name">Middle Name
                                        </Label>
                                        <Input id="middle_name" type="text" className="w-72"
                                            value={formData.middle_name.value}
                                            onChange={(e) => {
                                                setFormData('middle_name', e.target.value);
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label htmlFor="last_name">Last Name
                                            <span className="text-redBase">*</span></Label>
                                        <Input id="last_name" type="text" className="w-72"
                                            value={formData.last_name.value}
                                            onChange={(e) => {
                                                setFormData('last_name', e.target.value);
                                            }}
                                            required />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label htmlFor="birth_date">Birthday
                                            <span className="text-redBase">*</span>
                                        </Label>
                                        <Popover open={openCalendar} onOpenChange={setOpenCalendar} id="birth_date">
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
                                            <span className="text-redBase">*</span>
                                        </Label>
                                        <Input id="contact" type="tel"
                                            placeholder="09876543210"
                                            className="w-72"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={11}
                                            value={formData.contact_number.value}
                                            onChange={(e) => {
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
                                                            {barangays.find(b => b.name === formData.barangay.value)?.name || 'Select'}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-72">
                                                        <DropdownMenuRadioGroup
                                                            value={formData.barangay.value}
                                                            onValueChange={(value) => {
                                                                setFormData("barangay", value);
                                                                // Automatically reset streets when barangay changes
                                                                const s = getStreets(streets, value);
                                                                if (s.length > 0) {
                                                                    setFormData("street", s[0]);
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

                                                            {getStreets(streets, formData.barangay.value).map(street => (
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

            <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Admins</h2>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="!bg-redBase">Add New Admin</Button>
                        </DialogTrigger>
                        <DialogContent className={cn('w-2/3')}>
                            <DialogHeader>
                                <DialogTitle>Add New Admin</DialogTitle>
                                <DialogDescription>Add email and password.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4  max-h-[350px] px-3 py-2 ">
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="email">Email
                                    </Label>
                                    <Input id="email" type="email"
                                        required />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="password">Password
                                    </Label>
                                    <Input id="password" type="password"
                                        required />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Separator className="shrink" />
                                <span className=" px-2 text-muted-foreground text-xs uppercase text-center">
                                    or
                                </span>
                                <Separator className="shrink" />
                            </div>
                            <Button variant="outline" type="button"
                                onClick={handleGoogle}>
                                Continue with Google
                            </Button>
                            
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="button" disabled={addAdminLoader}>Add Admin</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {adminList?.map(a => (
                                <TableRow>
                                    <TableCell>
                                        {a.email}
                                    </TableCell>
                                    <TableCell>
                                        {a.is_active ? "Active" : "Not Active"}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {/* <Link
                                                to={`/Admin/Admin/${a.id}`}
                                                className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm"
                                            >
                                                Details
                                            </Link> */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </div>
    )
}