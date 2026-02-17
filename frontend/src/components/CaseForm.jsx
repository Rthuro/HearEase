import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import { Complainant } from "./case_forms/Complainant";
import { Respondent } from "./case_forms/Respondent";
import { CaseDetails } from "./case_forms/CaseDetails";
import { HearingInfo } from "./case_forms/HearingInfo";
import { FiledSuccess } from "./case_forms/FiledSuccess";
import { PageSync } from "./PageSync";
import { useCaseStore } from "@/store/useCaseStore";
import { toast } from "react-hot-toast";
import { invalidContactNumber } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function CaseForm() {
    const { formData, addCaseData, complainantList, respondentList, jurisdictionWarning, draftCase } = useCaseStore();

    const { userRole, userLinkName } = useAuthenticationStore();
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();
    const [stepNumber, setStepNumber] = useState(1);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);


    const formProgress = [
        {
            number: 1,
            title: "Complainant Information",
            form: "complainant"
        },
        {
            number: 2,
            title: "Respondent Information",
            form: "respondent"
        },
        {
            number: 3,
            title: "Case Details",
            form: "caseDetails"
        },
        {
            number: 4,
            title: "Hearing Information",
            form: "hearingInfo"
        },
    ]

    const visibleSteps = userRole === "user"
        ? formProgress.filter(step => step.number <= 3)
        : formProgress;

    const handlePrev = () => {
        if (stepNumber === 1) {
            if (userRole === 'admin') {
                navigate('/Admin/File-Case');
            } else {
                navigate(
                    '/' + userLinkName + '/File-Case'
                );
            }
            return;
        }

        setStepNumber((prev) => prev - 1);
    };

    const handleSubmit = async (e, submission) => {
        e.preventDefault();
        // setLoading(true); 
        if(submission == 'submit'){
            toast.promise(addCaseData(), {
                loading: 'Submitting Case Form...',
                success: (data) => {
                    setStepNumber(5); 
                    setLoading(false);

                return <b>Case form submitted successfully!</b>;
                },
                error: (err) => {
                    setLoading(false);
                    return <b>An error occurred: {err.message}</b>;
                },
            });
        }
        
        if(submission == 'draft') {
            toast.promise(draftCase(), {
                loading: 'Saving case to draft...',
                success: (data) => {
                    setStepNumber(5); 
                    setLoading(false);
                    
                    return <b>Case saved to draft!</b>;  
                },
                error: (err) => {
                    setLoading(false);
                    return <b>An error occurred: {err.message}</b>;
                },
            });
        }
    };


    const handleNext = () => {
        const currentFormKey = formProgress.find(step => step.number === stepNumber)?.form;

        if (!currentFormKey) return false;

        if (stepNumber == 1) {
            if (complainantList.length === 0) {
                toast.error("Please add at least one complainant.");
                return;
            }
        }

        if (stepNumber == 2) {
            if (respondentList.length === 0) {
                toast.error("Please add at least one respondent.");
                return;
            }
        }

        const currentFormData = formData[currentFormKey];

        if (stepNumber === 3 || (stepNumber === 4 && userRole === 'admin')) {

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
        }

        if (stepNumber === 3 && userRole === 'user') {
            setSubmitModalOpen(true);
            return;
        }

        if (stepNumber === 4) {
            setSubmitModalOpen(true);
            return;
        }

        setStepNumber((prev) => prev + 1);
    };


    return (
         <main className="relative flex flex-col w-full h-full items-center pt-12 gap-3 bg-white">
            <PageSync page="" />

            <div className="w-full max-h-max flex items-center justify-center pb-20 border-b border-zinc-200">
                <div className="flex items-center">
                    
                    {visibleSteps.map((step, index) => (
                        <div key={step.number} className="flex items-center">          
                        <div className="flex flex-col items-center gap-2 relative">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center p-2 
                                ${
                                    step.number === stepNumber
                                    ? "border border-redBase text-redBase"
                                    : step.number < stepNumber
                                    ? "bg-redBase text-white"
                                    : "border border-zinc-400 text-zinc-400"
                                }`}
                            >
                                {step.number}
                            </div>

                            <p
                                className={`text-xs md:text-sm absolute top-10 text-center 
                                ${
                                    step.number === stepNumber || step.number < stepNumber
                                    ? "text-redBase"
                                    : "text-zinc-400"
                                }`}
                            >
                                {step.title}
                            </p>
                        </div>

                        {/* Connector Line */}
                        {index !== visibleSteps.length - 1 && (
                        <div
                            className={`w-[60px] md:w-[120px] border  
                            ${step.number < stepNumber ? "border-redBase" : "border-zinc-400"}`}
                                ></div>
                            )}

                        </div>
                    ))}
                </div>
            </div>

            <form className="w-full flex flex-col items-center gap-6 max-h-max min-h-64 my-6 px-4">

                {stepNumber == 1 && (
                    <Complainant />
                )}

                {stepNumber == 2 && (
                    <Respondent />
                )}

                {stepNumber == 3 && (
                    <CaseDetails />
                )}

                {stepNumber == 4 && (
                    <HearingInfo />
                )}

                {stepNumber == 5 && (
                    <FiledSuccess />
                )}

            </form>

            <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
                <DialogContent className="sm:max-w-[480px] p-8">
                    <DialogHeader className="flex flex-col items-center gap-2">
                    <DialogTitle className="text-xl font-semibold">Confirm Submission</DialogTitle>
                    <DialogDescription className="text-center text-zinc-800 font-medium leading-relaxed pt-2">
                        I hereby swear that the information and evidence I have provided are true, 
                        accurate, and based on facts. I understand that providing false information 
                        may result in penalties under the law.
                    </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col sm:flex-col gap-2 w-full mt-4">
                    <Button 
                        className={cn('bg-redBase hover:bg-red-700 w-full')} 
                        onClick={(e) => {
                        handleSubmit(e, "submit");
                        setSubmitModalOpen(false);
                        }}
                    >
                        Submit Case
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                            handleSubmit(e, "draft");
                            setSubmitModalOpen(false);
                        }}
                    >
                        Save as Draft
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {loading && (
                <div className="flex justify-center items-center absolute bottom-0 top-0 left-0 right-0 z-50 ">
                    <div className="flex items-center gap-2 bg-white p-4 rounded-md">
                        <Loader2 className="animate-spin" />
                        Submitting Case Form...
                    </div>
                </div>
            )}

            {stepNumber < 5 && (
                <div className="flex items-center justify-between w-1/2 pb-12 pt-6">
                    <Button onClick={handlePrev} variant="outline" className="text-redBase  !border-redBase ">
                        <ChevronLeft />
                        Previous
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="!bg-redBase"
                        disabled={stepNumber === 3 && jurisdictionWarning}
                    >
                        {stepNumber === 3 && userRole === 'user' ? "Submit Case" : stepNumber === 4 ? "Submit Case" : "Next"}
                        <ChevronRight />
                    </Button>
                </div>
            )}

        </main>

    )
}