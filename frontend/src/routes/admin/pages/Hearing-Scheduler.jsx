import { useParams, useNavigate } from "react-router-dom";
import { useCaseStore } from "@/store/useCaseStore";
import { useLuponStore } from "@/store/useLuponStore";
import { HearingSched } from "@/components/HearingSched";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";

export function HearingScheduler() {
    const { case_id} = useParams();
    const { setFormData, formData, predictions, predictionsLoading, fetchPredictions, caseTypes, fetchCaseTypes,  updateHearings } = useCaseStore();
    const { members, fetchMembers } = useLuponStore();
    const [prediction, setPrediction] = useState(null);
    const navigate = useNavigate();
    const [loadingState, setLoadingState] = useState(false);


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

    const handleSchedConfirmation = async () => {
        setLoadingState(true);

        try {
            await toast.promise(updateHearings(case_id, formData.hearingInfo, prediction), {
                loading: "Confirming schedule...",
                error: "Failed to confirm schedule. Please try again."
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingState(false);
        }
        navigate(-1);
    }
    
  return (
    <div className="p-6  min-h-screen flex flex-col gap-4  ">
        <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ChevronLeft />
                </Button>
                <Button className="bg-redBase" onClick={() => handleSchedConfirmation()} disabled={loadingState}>
                    <CalendarCheck className="size-5" />
                    Confirm Schedule
                </Button>
        </div>
        <div className="flex gap-3 bg-white p-4 rounded-md shadow-2xs border">
            <div className="grid grid-cols-1 gap-2 ">
                    <Label htmlFor="predictedNumber">Number of Predicted Hearing
                        <span className="text-redBase"> (auto)</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="predictedNumber"
                            type="text"
                            className="w-72"
                            value={predictionsLoading ? "Calculating..." : predictedHearings}
                            readOnly
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
                        className="w-72"
                        value={predictedDays ? `Approximately ${predictedWeeks} weeks (${predictedDays} days)` : "Calculating..."}
                        readOnly
                    />
                    {predictionsLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-redBase" />
                    )}
                </div>
            </div>
        </div>
         <HearingSched predicted={formData?.caseDetails?.predicted_number?.value} luponMembers={members} />
    </div>
  );
}