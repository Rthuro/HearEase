import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { useEffect } from "react";

export function CaseForm(){
    const { formData, addCaseData, fetchCaseTypes, fetchSettlementTypes } = useCaseStore();

    useEffect(() => {
        fetchCaseTypes();
        fetchSettlementTypes();
    }, [fetchCaseTypes, fetchSettlementTypes]);

    const { userRole, userLinkName } = useAuthenticationStore();
    const navigate = useNavigate();
    const [stepNumber, setStepNumber] = useState(1);

    

    const formProgress = [
        {
            number :1,
            title: "Complainant Information",
            form: "complainant"
        },
        {
            number :2,
            title: "Respondent Information",
            form: "respondent"
        },
        {
            number :3,
            title: "Case Details",
            form: "caseDetails"
        },
        {
            number :4,
            title: "Hearing Information",
            form: "hearingInfo"
        },
    ]
    
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

    

    const handleNext = () => {
        const currentFormKey = formProgress.find(step => step.number === stepNumber)?.form;

        if (!currentFormKey) return false;

        const currentFormData = formData[currentFormKey];

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

        if (stepNumber === 4) {
            const res = addCaseData();
            if (res) {
                setStepNumber((prev) => prev + 1);
                return;
            } else {
                setStepNumber(4); 
                return;
            }
        }

        setStepNumber((prev) => prev + 1);
    };

    return(
        <main className="flex flex-col w-full h-full items-center justify-center gap-3 bg-white">
            <PageSync page="" />
            
            <div className=" w-full max-h-max flex items-center justify-center pb-20 border-b border-zinc-200">
                <div className="flex items-center">
                    {formProgress.map((step) => (
                        <div key={step.number} className="flex items-center">
                            <div className="flex flex-col items-center gap-2 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center p-2 
                                ${step.number === stepNumber ? 'border border-redBase text-redBase' : step.number < stepNumber ? 'bg-redBase text-white' : 'border border-zinc-400 text-zinc-400'}`
                                }>
                                    {step.number}   
                                </div>
                                <p className={`text-sm absolute top-10 text-center ${step.number === stepNumber || step.number < stepNumber ? 'text-redBase' : 'text-zinc-400'}`}>{step.title}</p>
                            </div>
                            
                            {step.number !== formProgress.length && (
                                <div className={`w-[120px] border 
                                ${step.number < stepNumber ? 'border-redBase' : 'border-zinc-400'}
                                `}></div>
                            )}
                        </div>
                    ))}
                </div> 
            </div>
            <form className="w-full flex flex-col items-center gap-6 h-max my-6">

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

            { stepNumber < 5 && (
                <div className="flex items-center justify-between w-1/2 pb-12 pt-6">
                    <Button onClick={handlePrev} variant="outline" className="text-redBase  !border-redBase ">
                        <ChevronLeft />
                        Previous
                    </Button>
                    <Button onClick={handleNext} className="!bg-redBase">
                        Next
                        <ChevronRight />
                    </Button>
                </div>
            )}
            
        </main>

    )
}