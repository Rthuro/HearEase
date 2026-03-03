import { Label } from "./ui/label";
import { CalendarDaysIcon, HandshakeIcon, File, CalendarIcon, Loader2, CalendarCheck, ChevronsUpDown, Check, AlertTriangle } from "lucide-react";
import { useLuponStore } from "@/store/useLuponStore";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from "./ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { dateFormatter } from "@/lib/helpers";
import { Textarea } from "./ui/textarea";
import toast from "react-hot-toast";
import useHearingStore from "@/store/useHearingStore";
import { useCaseStore } from "@/store/useCaseStore";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useSystemConfigStore } from "@/store/useSystemConfigStore";
import { useNavigate } from "react-router-dom";
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Regular work hours (8AM-4PM, lunch 12-1PM)
const REGULAR_SLOTS = [
    "08:00", "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00"
];

// Overtime slots (after 4PM dismissal, admin only)
const OVERTIME_SLOTS = ["16:00", "17:00", "18:00"];

const LOCAL_STORAGE_KEY = "authData";

export function HearingProgressDisplay({ hearing, case_complainants, case_respondents, case_hearings }) {
    const { hearings, fetchHearings } = useHearingStore();
    const { cfa_types, fetchCFA } = useSystemConfigStore();
    const { templates, fetchTemplates } = useGenerateDocumentStore();
    const { members } = useLuponStore();
    const [outcome, setSelectedOutcome] = useState(null);
    const [completedOutcome, setCompletedOutcome] = useState(false);
    const [reason, setReason] = useState("Some Parties failed to appear.");
    const [type, setType] = useState(1);
    const [resolved_remarks, setResolvedRemarks] = useState("Case settled.");
    const [court_remarks, setCourtRemarks] = useState("Case has been escalated to court.");
    const navigate = useNavigate();

    const getCurrentTime = () => {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ":" +
            now.getMinutes().toString().padStart(2, '0');
    };

    const [completedTime, setCompletedTime] = useState("");
    const [completedRemarks, setCompletedRemarks] = useState("Hearing completed successfully.");

    const [newHearingTime, setNewHearingTime] = useState(getCurrentTime());
    const [newHearingDate, setNewHearingDate] = useState(new Date());
    const [newHearingLuponMember, setNewHearingLuponMember] = useState(null);

    // Track occupied time slots for new hearing date
    const [occupiedSlots, setOccupiedSlots] = useState({});

    const fetchOccupiedSlots = async (date) => {
        if (!date) return;
        try {
            const dateStr = new Date(date).toISOString().split('T')[0];
            const response = await axios.get(`${API_URL}/optimal-slot/`, {
                params: { date: dateStr }
            });
            if (response.data?.all_slots) {
                const occupied = new Set(
                    response.data.all_slots
                        .filter(s => s.occupied)
                        .map(s => s.time)
                );
                setOccupiedSlots(prev => ({ ...prev, [dateStr]: occupied }));
            }
        } catch (error) {
            console.error("Error fetching occupied slots:", error);
        }
    };

    // Fetch occupied slots whenever newHearingDate changes
    useEffect(() => {
        if (newHearingDate) {
            fetchOccupiedSlots(newHearingDate);
        }
    }, [newHearingDate]);

    useEffect(() => {
        fetchCFA();
        if (templates.length === 0) {
            fetchTemplates();
        }
    }, []);

    useEffect(() => {
        if (outcome === 1) {
            setCompletedTime(getCurrentTime());
        }
    }, [outcome]);

    const [destination, setDestination] = useState(null);
    const [loader, setLoader] = useState(false);
    const { settlementTypes, fetchSettlementTypes } = useCaseStore();
    const { updateCaseHearingProgress } = useHearingStore();
    const [payload, setPayload] = useState({
        outcome: null,
        hearing_id: hearing?.id,
        hearing_number: hearing?.hearing_number,
        rescheduled_hearing_date: null,
        settlement_type_id: null,
        remarks: null,
    });


    // AI for new date suggestion can be implemented later
    const [newDate, setNewDate] = useState(new Date());

    const session_outcome = [
        {
            id: 1,
            label: "Completed Hearing",
            icon: <CalendarCheck className="text-green-800" />,
            hover: 'hover:bg-green-50 hover:border-green-800',
            visible: 'border-green-800 bg-green-50'
        }, {
            id: 2,
            label: "Reschedule",
            icon: <CalendarDaysIcon className="text-blue-800" />,
            hover: 'hover:bg-blue-50 hover:border-blue-800',
            visible: 'border-blue-800 bg-blue-50'
        },
        {
            id: 3,
            label: "Settled",
            icon: <HandshakeIcon className="text-green-800" />,
            hover: 'hover:bg-green-50 hover:border-green-800',
            visible: 'border-green-800 bg-green-50'
        },
        {
            id: 4,
            label: "Issue CFA",
            icon: <File className="text-redBase" />,
            hover: 'hover:bg-redBase/10 hover:border-redBase',
            visible: 'border-redBase bg-redBase/10'
        }
    ]

    const filterOutcomeChoices = hearing?.hearing_number === 6 ?
        session_outcome.filter(o => o.id !== 2 && o.id !== 1) :
        session_outcome;

    const mediator = members?.find(member => member.id === hearing?.lupon_member);

    const attendanceParticipants = () => {
        const participants = [];
        case_complainants.map(complainant => {
            participants.push({
                id: complainant.id,
                attendance_status: "absent",
                participant_role: "complainant"
            })
        })
        case_respondents.map(respondent => {
            participants.push({
                id: respondent.id,
                attendance_status: "absent",
                participant_role: "respondent"
            })
        })

        if (mediator) {
            participants.push({
                id: mediator.id,
                attendance_status: "absent",
                participant_role: "lupon"
            })
        }

        return participants;
    }
    const [attendance, setAttendance] = useState(attendanceParticipants());
    const [noticeConfirmation, setNoticeConfirmation] = useState(false);

    useEffect(() => {
        if (settlementTypes.length === 0) {
            fetchSettlementTypes();
        }
    }, []);


    const handleSubmit = async (data) => {
        try {
            setLoader(true);
            const payload = {
                ...data,
                attendance: attendance
            }
            const res = await updateCaseHearingProgress(hearing.case, payload);
            if (res.success) {
                setLoader(false);
                toast.success("Hearing progress updated successfully.");
                fetchHearings();
            } else {
                setLoader(false);
            }
        } catch (error) {
            setLoader(false);
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4 border-redBase border-t-8 bg-white shadow-md rounded-md">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-semibold">Hearing In-Progress</p>
                    <p className="text-sm text-gray-500 -mt-2">
                        Record attendance for all parties and the assigned mediators.
                    </p>
                </div>
                <div className="flex flex-col gap-2 text-end">
                    <p className="font-semibold text-gray-500">SESSION</p>
                    <p className="text-xl text-redBase font-semibold -mt-2">Hearing #{hearing?.hearing_number}</p>
                </div>
            </div>

            <div className="flex justify-between">
                <div className="flex flex-col gap-2 w-full px-3">
                    <Label className="font-semibold text-gray-500 ">PARTY ATTENDANCE</Label>
                    <Label className="font-semibold text-gray-600 ">Complainants</Label>
                    {case_complainants?.map((complainant, idx) => {
                        const uniqueKey = complainant.id || idx;
                        const inputId = `complainant-${uniqueKey}`;

                        return (
                            <Label
                                key={uniqueKey}
                                htmlFor={inputId}
                                className="hover:bg-accent/50 flex items-start gap-3 rounded-sm border p-3 cursor-pointer transition-colors has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                            >
                                <Checkbox
                                    id={inputId}
                                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"

                                    checked={attendance?.find(a =>
                                        a.id === complainant.id && a.participant_role === "complainant"
                                    )?.attendance_status === "present"}

                                    onCheckedChange={(checked) => {
                                        const newStatus = checked ? "present" : "absent";

                                        setAttendance(prev => prev.map(a =>
                                            (a.id === complainant.id && a.participant_role === "complainant")
                                                ? { ...a, attendance_status: newStatus }
                                                : a
                                        ));
                                    }}
                                />
                                <div className="grid gap-1">
                                    <p className="text-sm leading-none font-medium">
                                        {[complainant?.first_name, complainant?.middle_name, complainant?.last_name]
                                            .filter(Boolean)
                                            .join(" ")}
                                    </p>
                                </div>
                            </Label>
                        );
                    })}
                    <Label className="font-semibold text-gray-600 ">Respondents</Label>
                    {case_respondents?.map((respondent, idx) => {
                        const uniqueKey = respondent.id || idx;
                        const inputId = `respondent-${uniqueKey}`;

                        return (
                            <Label
                                key={uniqueKey}
                                htmlFor={inputId}
                                className="hover:bg-accent/50 flex items-start gap-3 rounded-sm border p-3 cursor-pointer transition-colors has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                            >
                                <Checkbox
                                    id={inputId}
                                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                    checked={attendance?.find(a =>
                                        a.id === respondent.id && a.participant_role === "respondent"
                                    )?.attendance_status === "present"}

                                    onCheckedChange={(checked) => {
                                        const newStatus = checked ? "present" : "absent";

                                        setAttendance(prev => prev.map(a =>
                                            (a.id === respondent.id && a.participant_role === "respondent")
                                                ? { ...a, attendance_status: newStatus }
                                                : a
                                        ));
                                    }}
                                />
                                <div className="grid gap-1">
                                    <p className="text-sm leading-none font-medium">
                                        {[respondent?.first_name, respondent?.middle_name, respondent?.last_name]
                                            .filter(Boolean)
                                            .join(" ")}
                                    </p>
                                </div>
                            </Label>
                        );
                    })}
                </div>
                <div className="flex flex-col gap-3 w-full px-3">
                    <Label className="font-semibold text-gray-500 ">MEDIATOR ATTENDANCE</Label>
                    {mediator ? (
                        <Label
                            htmlFor="mediator"
                            className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                        >
                            <Checkbox
                                id="mediator"
                                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                checked={attendance?.find(a =>
                                    a.id === mediator.id && a.participant_role === "lupon"
                                )?.attendance_status === "present"}

                                onCheckedChange={(checked) => {
                                    const newStatus = checked ? "present" : "absent";

                                    setAttendance(prev => prev.map(a =>
                                        (a.id === mediator.id && a.participant_role === "lupon")
                                            ? { ...a, attendance_status: newStatus }
                                            : a
                                    ));
                                }}
                            />
                            <div className="grid gap-1">
                                <p className="text-sm leading-none font-medium">
                                    {[mediator?.first_name, mediator?.middle_name, mediator?.last_name]
                                        .filter(Boolean)
                                        .join(" ")}
                                </p>
                            </div>
                        </Label>
                    ) : <p className="text-sm text-gray-500">No mediator assigned.</p>}
                </div>
            </div>

            <div className="flex flex-col gap-4 p-4 border bg-gray-50 rounded-md relative">

                {attendance.filter(a => a.attendance_status === "present").length === 0 && !noticeConfirmation && (
                    <div className="absolute top-0 right-0 left-0 bottom-0 
            flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <p className="text-sm font-medium text-amber-800 leading-tight">
                                You haven't marked any hearing participants as present.
                            </p>
                        </div>

                        <Button
                            className="flex-1 md:flex-none bg-redBase hover:bg-redBase/90 text-white shadow-md transition-all active:scale-95"
                            onClick={() => setNoticeConfirmation(true)}
                        >
                            Proceed anyway
                        </Button>
                    </div>
                )}

                <Label className="font-semibold text-gray-800 ">SESSION OUTCOME</Label>
                <div className="flex gap-4">
                    {filterOutcomeChoices.map((o) => (
                        <div key={o.id} className={`flex flex-col items-center justify-center gap-2 border 
                    ${o.hover} py-4 px-2 rounded-md w-full cursor-pointer transition-colors
                    ${outcome === o.id ? o.visible : ''}
                    `}
                            onClick={() => setSelectedOutcome(o.id)}
                        >
                            {o.icon}
                            <p className="text-lg font-bold">{o.label}</p>
                        </div>
                    ))}
                </div>

                <div className={outcome !== null ? "relative flex py-6 px-8 border rounded-md bg-white shadow-inner" : "hidden"}>
                    {loader && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                            <Loader2 className="animate-spin h-8 w-8 text-redBase" />
                        </div>
                    )}


                    {outcome === 1 && hearing?.hearing_number !== 6 && (
                        <div className="flex flex-col gap-4 border-l-4 border-green-800 pl-4 w-full">
                            <Label className="font-semibold text-green-800 text-lg">Complete Hearing</Label>

                            {hearing?.hearing_number < 6 &&
                                case_hearings?.length > 0 &&
                                case_hearings[case_hearings.length - 1]?.hearing_number === hearing?.hearing_number && (
                                    <>
                                        <p className="text-sm text-gray-500">
                                            This hearing will be the last. Would you like to schedule a new Hearing? or proceed to finalize the case?
                                        </p>
                                        <div className="flex gap-4">
                                            <Button
                                                className="bg-blue-800 hover:bg-blue-600"
                                                onClick={() => setCompletedOutcome(true)}
                                            >
                                                Schedule New Hearing
                                            </Button>
                                            <Button
                                                className="bg-green-800 hover:bg-green-600"
                                                onClick={() => setSelectedOutcome(3)}
                                            >
                                                Finalize Case Settlement
                                            </Button>
                                        </div>
                                    </>

                                )}

                            {completedOutcome && (
                                <>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-3 items-center">
                                        <div className="flex flex-col gap-3">
                                            <Label className="font-medium text-gray-600 text-sm ">DATE
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn("justify-between font-normal", !newHearingDate && "text-muted-foreground")}
                                                    >
                                                        {newHearingDate
                                                            ? dateFormatter(newHearingDate)
                                                            : "Select date"}
                                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="overflow-hidden p-0 w-72" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={newHearingDate ? new Date(newHearingDate) : null}
                                                        onSelect={(date) => setNewHearingDate(date)}
                                                        captionLayout="dropdown"

                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Label className="font-medium text-gray-600 text-sm">TIME</Label>
                                            {(() => {
                                                const dateStr = newHearingDate
                                                    ? new Date(newHearingDate).toISOString().split('T')[0]
                                                    : null;
                                                const occupied = dateStr ? (occupiedSlots[dateStr] || new Set()) : new Set();

                                                return (
                                                    <Select
                                                        value={newHearingTime}
                                                        onValueChange={(val) => setNewHearingTime(val)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select time" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Regular Hours</SelectLabel>
                                                                {REGULAR_SLOTS.map((time) => {
                                                                    const isBusy = occupied.has(time);
                                                                    return (
                                                                        <SelectItem
                                                                            key={time}
                                                                            value={time}
                                                                            disabled={isBusy}
                                                                            className={isBusy ? "text-zinc-400 opacity-50" : ""}
                                                                        >
                                                                            {time} {isBusy ? "(Occupied)" : ""}
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectGroup>
                                                            {(() => {
                                                                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                                                                const authData = stored ? JSON.parse(stored) : {};
                                                                if (authData.userRole !== "admin") return null;
                                                                return (
                                                                    <SelectGroup>
                                                                        <SelectLabel className="text-amber-600">⏰ Overtime (After 4 PM)</SelectLabel>
                                                                        {OVERTIME_SLOTS.map((time) => {
                                                                            const isBusy = occupied.has(time);
                                                                            return (
                                                                                <SelectItem
                                                                                    key={time}
                                                                                    value={time}
                                                                                    disabled={isBusy}
                                                                                    className={isBusy ? "text-zinc-400 opacity-50" : "text-amber-700"}
                                                                                >
                                                                                    {time} {isBusy ? "(Occupied)" : "(OT)"}
                                                                                </SelectItem>
                                                                            );
                                                                        })}
                                                                    </SelectGroup>
                                                                );
                                                            })()}
                                                        </SelectContent>
                                                    </Select>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 col-span-2">
                                        <Label>Assigned Lupon Member</Label>
                                        <Popover
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    role="combobox"
                                                    variant="outline"
                                                    className="max-w-max min-w-full justify-between"
                                                >
                                                    {newHearingLuponMember
                                                        ? `${newHearingLuponMember?.first_name}
                                             ${newHearingLuponMember?.last_name}`
                                                        : "Select lupon member..."}
                                                    <ChevronsUpDown className="opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search lupon members..."
                                                        className="h-9"
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>No lupon members found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {members.map((lupon) => (
                                                                <CommandItem
                                                                    key={lupon.id}
                                                                    value={lupon.id}
                                                                    onSelect={() => {
                                                                        setNewHearingLuponMember(lupon);
                                                                    }}
                                                                >
                                                                    {lupon.first_name} {lupon.last_name}
                                                                    <Check
                                                                        className={cn(
                                                                            "ml-auto",
                                                                            newHearingLuponMember?.id === lupon.id
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <Button
                                        className="bg-green-800 hover:bg-green-600"
                                        onClick={() => handleSubmit({
                                            ...payload,
                                            outcome: "new_hearing",
                                            new_hearing_time: newHearingTime,
                                            new_hearing_date: newHearingDate.toISOString().split('T')[0],
                                            time_completed: completedTime,
                                            lupon_member_id: newHearingLuponMember?.id,
                                        })}
                                    >
                                        Add New Hearing
                                    </Button>
                                </>
                            )}

                            {case_hearings[case_hearings.length - 1]?.hearing_number !== hearing?.hearing_number && !completedOutcome && (
                                <>
                                    <div className="flex flex-col gap-3">
                                        <Label className="font-medium text-gray-600 text-sm">TIME COMPLETED
                                            {case_hearings[case_hearings.length - 1]?.hearing_number}
                                        </Label>
                                        <Input
                                            type="time"
                                            value={completedTime}
                                            onChange={(e) => setCompletedTime(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Label className="font-medium text-gray-600 text-sm">REMARKS</Label>
                                        <Textarea
                                            placeholder="Add remarks here..."
                                            value={completedRemarks}
                                            onChange={(e) => setCompletedRemarks(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className="bg-green-800 hover:bg-green-600"
                                        onClick={() => handleSubmit({
                                            ...payload,
                                            outcome: "completed",
                                            time_completed: completedTime,
                                            remarks: completedRemarks,
                                        })}
                                    >
                                        Complete Hearing
                                    </Button>
                                </>
                            )}

                        </div>
                    )}
                    {outcome === 2 && hearing?.hearing_number !== 6 && (
                        <div className="flex flex-col gap-4 border-l-4 border-blue-800 pl-4 w-full">
                            <Label className="font-semibold text-blue-800 text-lg">Reschedule Hearing</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-3">
                                    <Label className="font-medium text-gray-600 text-sm leading-0.5">REASON</Label>
                                    <Textarea placeholder="Add reason for rescheduling..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Label className="font-medium text-gray-600 text-sm leading-0.5">New Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn("justify-between font-normal", !newDate && "text-muted-foreground")}
                                            >
                                                {newDate
                                                    ? dateFormatter(newDate)
                                                    : "Select date"}
                                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="overflow-hidden p-0 w-72" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={newDate ? new Date(newDate) : null}
                                                onSelect={(date) => setNewDate(date)}
                                                captionLayout="dropdown"

                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <Button className=" bg-blue-800 hover:bg-blue-600"
                                onClick={() => handleSubmit({
                                    ...payload,
                                    outcome: "rescheduled",
                                    rescheduled_hearing_date: newDate.toISOString().split('T')[0],
                                    reason: reason
                                })} >Save Hearing</Button>
                        </div>
                    )}
                    {outcome === 3 && (
                        <div className="flex flex-col gap-4 border-l-4 border-green-800 pl-4 w-full">
                            <Label className="font-semibold text-green-800 text-lg">Finalize Settlement</Label>
                            <div className="flex flex-col gap-3">
                                <Label className="font-medium text-gray-600 text-sm leading-0.5">TYPE</Label>
                                <Select
                                    value={type}
                                    onValueChange={(value) => setType(value)}
                                >
                                    <SelectTrigger className={"w-full"}>
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            {settlementTypes.map((stype) => (
                                                <SelectItem key={stype.id} value={stype.id}>{stype.settlement_name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="font-medium text-gray-600 text-sm leading-0.5">REMARKS</Label>
                                <Textarea placeholder="Add remarks here..."
                                    value={resolved_remarks}
                                    onChange={(e) => setResolvedRemarks(e.target.value)} />
                            </div>
                            <Button className=" bg-green-800 hover:bg-green-600"
                                onClick={() => handleSubmit({
                                    ...payload,
                                    settlement_type_id: type,
                                    outcome: "settled",
                                    remarks: resolved_remarks,
                                })}  >Mark as Settled</Button>
                        </div>
                    )}
                    {outcome === 4 && (
                        <div className="flex flex-col gap-4 border-l-4 border-redBase pl-4 w-full">
                            <Label className="font-semibold text-redBase text-lg">Issue Court of Appeal</Label>
                            <div className="flex flex-col gap-3">
                                <Label className="font-medium text-gray-600 text-sm leading-0.5">Destination</Label>
                                <Select
                                    value={destination}
                                    onValueChange={(value) => setDestination(value)}
                                >
                                    <SelectTrigger className={"w-full"}>
                                        <SelectValue placeholder="Select a destination" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            {cfa_types?.map((cfa) => (
                                                <SelectItem key={cfa.id} value={cfa.id}>{cfa.cfa}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="font-medium text-gray-600 text-sm leading-0.5">REASON</Label>
                                <Textarea placeholder="Add reasons here..."
                                    value={court_remarks}
                                    onChange={(e) => setCourtRemarks(e.target.value)} />
                            </div>
                            
                            <Button className=" bg-redBase hover:bg-redBase/90"
                                onClick={() => handleSubmit({
                                    ...payload,
                                    cfa_destination: destination,
                                    outcome: "court",
                                    remarks: court_remarks,
                                })}>Mark as Escalated
                            </Button>
                            
                            {/* <p className="text-sm text-gray-800 text-center -mb-2">Mark case as escalated first before generating document</p>
                            <Button variant={"outline"} 
                                onClick={() => navigate(`/Admin/Generate-Docx/${hearing.case_number}?template_id=${templates.find(t => t.template_type === "court")?.id}`)}>
                                    Generate Document
                            </Button> */}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}