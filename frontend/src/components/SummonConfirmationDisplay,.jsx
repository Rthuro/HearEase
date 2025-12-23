import { Download, FileText, CalendarIcon, CircleCheck } from "lucide-react";
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore";
import { Label } from "./ui/label";
import { formatedBday, dateFormatter } from "@/lib/helpers";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";

export function SummonConfirmationDisplay({ hearing, caseInfo }) {
    const { generateDocument, templates } = useGenerateDocumentStore();
    const [openCalendar, setOpenCalendar] = useState(false);
    const [summonDeliveryInfo, setSummonDeliveryInfo] = useState({
        date_received: null,
        received_by: null,
    });
    

    const handleTemplateSelect = async () => {
        const template_id = templates.find( t => t.template_type === 'summon')?.id;
        try {
            await generateDocument(caseInfo, 'summon', template_id);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="flex flex-col gap-2 p-4 border-amber-300 border-t-8 bg-white shadow-md rounded-md">
            <p className="text-lg font-semibold">Summon/s Delivery</p>
            <p className="text-sm text-gray-500 -mt-2">
                The hearing cannot proceed until the responden/s officially receives the summon/s.
            </p>
            <div className="border flex justify-evenly  bg-gray-50 px-4 py-6 rounded-md ">
                <div className="flex flex-col gap-4 border-r w-full px-4">
                    <div className="flex flex-col gap-1">
                        <Label className="font-semibold text-gray-500 ">DOCUMENT STATUS</Label>
                        <button type="button" 
                        className="border bg-white rounded-sm flex items-center justify-between p-3 gap-4" 
                        onClick={ () => handleTemplateSelect()}>
                            <div className="flex gap-1 items-center">
                                <FileText className="size-4 text-redBase" />
                                <p className="text-redBase text-sm">{`Summon_letter_${hearing?.hearing_number}`}</p>
                            </div>
                            <p className="p-2 text-blue-800 text-xs bg-blue-50 font-medium rounded-sm">
                                Download / Print
                            </p>
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="font-semibold text-gray-500 ">SCHEDULED HEARING</Label>
                        <p className="border p-2 rounded-sm font-semibold bg-white">{formatedBday(hearing?.hearing_date)} @ {hearing?.time}</p>
                    </div>

                </div>

                <div className="flex flex-col border-l w-full px-4 gap-4">
                    <Label className="font-semibold text-gray-500 ">ACTION REQUIRED</Label>
                    <div className="flex flex-col gap-1">
                        <Label className="font-semibold text-gray-600 ">Date Received</Label>
                        <Popover
                        open={openCalendar}
                        onOpenChange={() => setOpenCalendar(!openCalendar)}
                        >
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            className={cn("justify-between font-normal", !summonDeliveryInfo?.date_received && "text-muted-foreground")}
                            >
                            {summonDeliveryInfo?.date_received
                                ? dateFormatter(summonDeliveryInfo?.date_received)
                                : "Select date"}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="overflow-hidden p-0 w-72" align="start">
                            <Calendar
                            mode="single"
                            selected={summonDeliveryInfo?.date_received ? new Date(summonDeliveryInfo?.date_received) : null}
                            captionLayout="dropdown"
                            onSelect={(date) => setSummonDeliveryInfo((prev) => ({
                                ...prev,
                                date_received: date ? date.toISOString() : null,
                            }))}
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="font-semibold text-gray-600 ">Received By (Name)</Label>
                        <Input type="text" placeholder="e.g. Respondent / Wife" className="bg-white" />
                    </div>
                    <Button className="w-full py-5 bg-amber-400 text-white font-semibold ">
                        <CircleCheck className="size-5" />
                        Mark Summon/s as Served
                    </Button>
                </div>

            </div>  
        </div>
         
    )};