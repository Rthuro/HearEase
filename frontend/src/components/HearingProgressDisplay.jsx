import { Label } from "./ui/label";
import { CalendarDaysIcon, HandshakeIcon, File, CalendarIcon, Loader2 } from "lucide-react";
import { useLuponStore } from "@/store/useLuponStore";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "./ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { dateFormatter } from "@/lib/helpers";
import { Textarea } from "./ui/textarea";
import toast from "react-hot-toast";
import useHearingStore from "@/store/useHearingStore";
import { useCaseStore } from "@/store/useCaseStore";

export function HearingProgressDisplay({ hearing, case_complainants, case_respondents, case_organization_complainants, case_organization_respondents }) {
    const { members } = useLuponStore();
    const [ outcome, setSelectedOutcome ] = useState(null);
    const [ reason, setReason ] = useState("respondent_noShow");
    const [ type, setType ] = useState(1);
    const [ resolved_remarks, setResolvedRemarks ] = useState("Case settled.");
    const [court_remarks, setCourtRemarks ] = useState("Case has been escalated to court.");

    const [ destination, setDestination ] = useState("court");
    const [loader, setLoader ] = useState(false);
    const {settlementTypes,fetchSettlementTypes} = useCaseStore();
    const {updateCaseHearingProgress} = useHearingStore();
    const [payload, setPayload ] = useState({
        outcome: null,
        hearing_id: hearing?.id,
        hearing_number: hearing?.hearing_number,
        rescheduled_hearing_date: null,
        settlement_type_id: null,
        remarks: null,
    });
    
    
    // AI for new date suggestion can be implemented later
    const new_date = new Date();

    const session_outcome = [
        { 
            id: 1,
            label: "Reschedule",
            icon: <CalendarDaysIcon className="text-blue-800" />,
            hover: 'hover:bg-blue-50 hover:border-blue-800',
            visible: 'border-blue-800 bg-blue-50'
        }, 
        {
            id: 2,
            label: "Settled",
            icon: <HandshakeIcon className="text-green-800" />,
            hover: 'hover:bg-green-50 hover:border-green-800',
            visible: 'border-green-800 bg-green-50'
        },
        {
            id: 3,
            label: "Issue CFA",
            icon: <File className="text-redBase" />,
            hover: 'hover:bg-redBase/10 hover:border-redBase',
            visible: 'border-redBase bg-redBase/10'
        }
    ]

    const mediator = members?.find( member => member.id === hearing?.lupon_member);

    useEffect(() => {
        if (settlementTypes.length === 0) {
            fetchSettlementTypes();
        }
    }, []);


    const handleSubmit = async (data) => {
        try{
            setLoader(true);
            const res = await updateCaseHearingProgress(hearing.case, data);
            if(res.success){
                setLoader(false);
                toast.success("Hearing progress updated successfully.");
            }else {
                setLoader(false);
            }
        }catch(error){
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
                <p  className="font-semibold text-gray-500">SESSION</p>
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
                {case_organization_complainants?.map((complainant, idx) => {
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
                            />
                            <div className="grid gap-1">
                                <p className="text-sm leading-none font-medium">
                                    {[complainant?.name, complainant?.representative_name]
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
                {case_organization_respondents?.map((respondent, idx) => {
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
                            />
                            <div className="grid gap-1">
                                <p className="text-sm leading-none font-medium">
                                    {[respondent?.name, respondent?.representative_name]
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
                { mediator ? (
                    <Label 
                        htmlFor="mediator"
                        className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                    >
                        <Checkbox
                            id="mediator"
                            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
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

        <div className="flex flex-col gap-4 p-4 border bg-gray-50 rounded-md">
            <Label className="font-semibold text-gray-800 ">SESSION OUTCOME</Label>
            <div className="flex gap-4">
                {session_outcome.map((o) => (
                    <div key={o.id} className={`flex flex-col items-center justify-center gap-2 border 
                    ${o.hover} py-4 px-2 rounded-md w-full cursor-pointer transition-colors
                    ${ outcome === o.id ? o.visible : ''}
                    `}
                    onClick={() => setSelectedOutcome(o.id)}
                    >
                    {o.icon}
                        <p className="text-lg font-bold">{o.label}</p>
                    </div>
                ))}
            </div>

            <div className={ outcome !== null ?"relative flex py-6 px-8 border rounded-md bg-white shadow-inner" : "hidden"}>
                {loader && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin h-8 w-8 text-redBase" />
                    </div>
                )}
                { outcome === 1 && (
                    <div className="flex flex-col gap-4 border-l-4 border-blue-800 pl-4 w-full">
                        <Label className="font-semibold text-blue-800 text-lg">Reschedule Hearing</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <Label className="font-medium text-gray-600 text-sm leading-0.5">REASON</Label>
                                <Select 
                                    value={reason} 
                                    onValueChange={(value) => setReason(value)}
                                >
                                    <SelectTrigger className={"w-full"}>
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="respondent_noShow">Respondent No-Show</SelectItem>
                                            <SelectItem value="complainant_noShow">Complainant No-show</SelectItem>
                                            <SelectItem value="both_absent">Both Parties Absent</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select> 
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="font-medium text-gray-600 text-sm leading-0.5">New Date (AI SUGGESTED)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant="outline"
                                            className={cn("justify-between font-normal", !new_date && "text-muted-foreground")}
                                            >
                                            {new_date
                                                ? dateFormatter(new_date)
                                                : "Select date"}
                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="overflow-hidden p-0 w-72" align="start">
                                            <Calendar
                                            mode="single"
                                            selected={new_date ? new Date(new_date) : null}
                                            captionLayout="dropdown"
                                
                                            initialFocus
                                            />
                                        </PopoverContent>
                                </Popover>
                            </div> 
                        </div>
                        <Button className=" bg-blue-800 hover:bg-blue-600"
                        onClick={()=> handleSubmit({
                            ...payload,
                            outcome: "rescheduled",
                            rescheduled_hearing_date: new_date.toISOString().split('T')[0],
                        })} >Save Hearing</Button>
                    </div>
                )}
                { outcome === 2 && (
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
                        onClick={()=> handleSubmit({
                            ...payload,
                            settlement_type_id: type,
                            outcome: "settled",
                            remarks: resolved_remarks,
                        })}  >Mark as Settled</Button>
                    </div>
                )}
                { outcome === 3 && (
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
                                        <SelectItem value="court">Municipal Trial Court</SelectItem>
                                        <SelectItem value="prosecutor">PNP / Prosecutor</SelectItem>
                                        <SelectItem value="vawc">VAWC Desk</SelectItem>
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
                         onClick={()=> handleSubmit({
                            ...payload,
                            outcome: "court",
                            remarks: court_remarks,
                        })}>Generate CFA</Button>

                    </div>
                )}
            </div>
           
        </div>
    </div>
   );
}