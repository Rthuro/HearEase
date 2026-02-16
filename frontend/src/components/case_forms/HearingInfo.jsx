import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useState, useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useCaseStore } from "@/store/useCaseStore";
import { useLuponStore } from "@/store/useLuponStore";
import { HearingSched } from "../HearingSched";
import { Separator } from "../ui/separator";

export function HearingInfo() {
    const { setFormData, formData, predictions, predictionsLoading, fetchPredictions, caseTypes, fetchCaseTypes } = useCaseStore();
    const { members, fetchMembers } = useLuponStore();
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Ensure caseTypes is loaded first
    useEffect(() => {
        if (caseTypes.length === 0) {
            fetchCaseTypes();
        }
    }, []);

    // Fetch predictions only when caseTypes is loaded AND we have a case type selected
    useEffect(() => {
        if (caseTypes.length > 0 && formData?.caseDetails?.nature_of_complaint_code?.value) {
            console.log("caseTypes loaded:", caseTypes.length, "items. Fetching predictions...");
            fetchPredictions();
        }
    }, [caseTypes.length]);

    // Get the first prediction (Amicable Settlement as default display)
    const defaultPrediction = predictions ?
        (predictions["Amicable Settlement"] || Object.values(predictions)[0]) : null;

    const predictedHearings = defaultPrediction?.predicted_hearings ||
        formData?.hearingInfo?.predicted_number?.value || 3;

    const predictedDays = defaultPrediction?.predicted_days || null;
    const predictedWeeks = defaultPrediction?.predicted_weeks ||
        (predictedDays ? Math.round(predictedDays / 7 * 10) / 10 : null);

    // Update formData with AI prediction
    useEffect(() => {
        if (defaultPrediction) {
            setFormData('caseDetails', 'predicted_number', defaultPrediction.predicted_hearings);
            setPrediction(defaultPrediction);
        }
    }, [predictions]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <p className="col-span-2 text-center text-2xl mb-3">Hearing Information</p>

            {/* Predicted Hearings and Resolution Time - Side by Side */}
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="predictedNumber">Number of Predicted Hearing
                    <span className="text-redBase"> (auto)</span>
                </Label>
                <div className="relative">
                    <Input
                        id="predictedNumber"
                        type="text"
                        className="w-72 disabled:opacity-50/10"
                        value={predictionsLoading ? "Calculating..." : predictedHearings}
                        readOnly
                        disabled
                    />
                    {predictionsLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-redBase" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="resolutionTime">Est. Resolution Time
                    <span className="text-redBase"> (auto)</span>
                </Label>
                <div className="relative">
                    <Input
                        id="resolutionTime"
                        type="text"
                        className="w-72 disabled:opacity-50/10"
                        value={predictedDays ? `Approximately ${predictedWeeks} weeks (${predictedDays} days)` : "Calculating..."}
                        readOnly
                        disabled
                    />
                    {predictionsLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-redBase" />
                    )}
                </div>
            </div>

            <Separator className="col-span-2" />

            <HearingSched predicted={formData?.caseDetails?.predicted_number?.value} luponMembers={members} />
        </div>
    )
}
