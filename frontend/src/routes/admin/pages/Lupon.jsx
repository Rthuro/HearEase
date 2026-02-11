import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { fetchLuponMemberDetails } from "@/store/useLuponStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatedBday } from "@/lib/helpers";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLuponStore } from "@/store/useLuponStore";
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { EditLuponMember } from "@/components/EditLuponMember";

export function Lupon(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [memberDetails, setMemberDetails] = useState(null);
    const { deleteLupon } = useLuponStore();

    useEffect(() => {
        const getMemberDetails = async () => {
            try {
                const data = await fetchLuponMemberDetails(id);
                setMemberDetails(data);
            } catch (error) {
                toast.error("Error fetching Lupon member details:", error);
            }       
        };
        getMemberDetails();
    }, [id]);

    const luponDetails = [
        {
            label: "Full Name",
            value: memberDetails ? `${memberDetails.lupon.first_name} ${memberDetails.lupon.middle_name || ""} ${memberDetails.lupon.last_name}` : "",
        },
        {
            label: "Sex",
            value: memberDetails ? memberDetails.lupon.sex : "",
        },
         {
            label: "Birthday",
            value: formatedBday(memberDetails ? memberDetails.lupon.birth_date : ""),
        },
        {
            label: "Contact Number",
            value: memberDetails ? memberDetails.lupon.contact_number : "",
        },
        {  
            label: "Address",
            value: `${memberDetails?.lupon?.street}, ${memberDetails?.lupon?.barangay}${memberDetails?.lupon?.additional_info ? ', ' + memberDetails?.lupon?.additional_info : ''}`
        },
    ]

    const [deleteModal, setDeleteModal] = useState(false);

    const handleRemove = () => {
        const res = deleteLupon(id)
        if (res) {
            setDeleteModal(false)
            navigate('/Admin/Lupon-Management')
            return;
        }
    }

    return (
        <div className="relative flex flex-col gap-4 p-6 ">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft />
                    </Button>
                </div>
                <div className="flex items-center justify-end gap-2 " >
                    <EditLuponMember lupon={memberDetails} />
                    <Dialog>
                        <DialogTrigger asChild>     
                            <Button className="!bg-zinc-900">Create Account</Button>
                        </DialogTrigger>
                        <DialogContent className={cn('w-2/3')}>
                                <DialogHeader>
                                    <DialogTitle>Create Account</DialogTitle>
                                    <DialogDescription>Add email and password.</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4  max-h-[350px] px-3 py-2 mb-4 ">                                
                                        <div className="grid grid-cols-1 gap-2">
                                            <Label htmlFor="email">Email
                                            </Label>
                                            <Input id="email" type="email" 
                                            required/>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <Label htmlFor="password">Password
                                            </Label>
                                            <Input id="password" type="password" 
                                            required/>
                                        </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="button">Add Account</Button>
                                </DialogFooter>
                            </DialogContent>
                    </Dialog>
                    <Button className="!bg-zinc-900" onClick={ ()=>setDeleteModal(true)}>Remove Member</Button>
                </div>
            </div>

                

            <div className="flex flex-col gap-4 bg-white p-4 rounded-md border shadow-2xs">
                <h2 className="text-xl font-semibold">Lupon Details</h2>
                <div className="grid grid-cols-4 gap-4">
                        {luponDetails.map((l) => (
                            <div key={l.label} 
                            className="flex flex-col gap-1"
                            >
                                <Label className={cn("text-zinc-600 font-normal text-xs")}>
                                    {l.label}
                                </Label>
                                <div className="flex gap-2">
                                    <p>{l.value}</p>
                                </div>
                            </div>
                        ))}
                </div> 
            </div>
                
            <div className="flex flex-col gap-4 bg-white p-4 rounded-md shadow-2xs border">
                <h2 className="text-xl font-semibold">Assigned Cases</h2>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="text-left px-4 py-2">Case #</TableHead>
                            <TableHead className="text-left px-4 py-2">Case Type</TableHead>
                            <TableHead className="text-left px-4 py-2">Severity</TableHead>
                            <TableHead className="text-left px-4 py-2">Status</TableHead>
                            <TableHead className="px-4 py-2"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {memberDetails?.cases?.length > 0 ? (
                            memberDetails?.cases?.map((c) => (
                                <TableRow key={c.id} className="border-t">
                                <TableCell className="px-4 py-2">{c.id}</TableCell>
                                <TableCell className="px-4 py-2">{c.case_type.case_name}</TableCell>
                                <TableCell className="px-4 py-2">{c.case_type.severity}</TableCell>
                                <TableCell className="px-4 py-2"> <CaseStatusDisplay caseStatus={c.case_status} /></TableCell>
                                <TableCell className={cn("py-4")}>
                                    <Link
                                    to = {`/Admin/Case/${c.id}`}
                                    className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm">
                                    Details
                                    </Link>
                                </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell className="px-4 py-2 text-center" colSpan={7}>
                                No assigned hearing found.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-white p-4 rounded-md shadow-2xs border">
                <h2 className="text-xl font-semibold">Hearing Attendance</h2>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="text-left px-4 py-2">Hearing #</TableHead>
                            <TableHead className="text-left px-4 py-2">Case #</TableHead>
                            <TableHead className="text-left px-4 py-2">Status</TableHead>
                            <TableHead className="text-left px-4 py-2">Date</TableHead>
                            <TableHead className="text-left px-4 py-2">Time</TableHead>
                            <TableHead className="px-4 py-2"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {memberDetails?.hearings?.length > 0 ? (
                            memberDetails?.hearings?.map((h) => (
                                <TableRow key={h.id} className="border-t">
                                <TableCell className="px-4 py-2">{h.hearing_number}</TableCell>
                                <TableCell className="px-4 py-2">{h.case}</TableCell>
                                <TableCell className="px-4 py-2"> <CaseStatusDisplay caseStatus={h.hearing_status} /></TableCell>
                                <TableCell className="px-4 py-2">{h.hearing_date}</TableCell>
                                <TableCell className="px-4 py-2">{h.time}</TableCell>
                                <TableCell className={cn("py-4")}>
                                    <Link
                                    to = {`/Admin/Hearing/${h.id}`}
                                    className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm">
                                    Details
                                    </Link>
                                </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell className="px-4 py-2 text-center" colSpan={7}>
                                No assigned cases found.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>


            {deleteModal && (
                <div className="fixed top-0 bottom-0 right-0 left-0 bg-black/80 flex items-center z-20">
                    <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-md mx-auto w-2xs">
                        <h2 className="text-xl font-semibold">Are you sure?</h2>
                        <h2 className="text-gray-500">This action cannot be undone.</h2>
                        <Button className="!bg-redBase w-full" onClick={handleRemove}>Remove Member</Button>
                        <Button variant="outline" className="w-full" onClick={()=>setDeleteModal(false)}>Cancel</Button>
                    </div>
                </div>
            )}
        </div>
    );
}