import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";

export function CaseForm(){
    const { formData, addCaseData, fetchCaseTypes, fetchSettlementTypes, complainantList, respondentList, setComplainantInfo, set_complainants } = useCaseStore();
    const { fetchComplainants, fetchRespondents} = useRetrieveUsersStore();
    
    const { userRole, userLinkName } = useAuthenticationStore();

    const userInfo = {
        first_name: formData?.complainant?.first_name?.value,
        last_name: formData?.complainant?.last_name?.value,
        middle_name: formData?.complainant?.middle_name?.value,
        birth_date: formData?.complainant?.birth_date?.value,
        sex: formData?.complainant?.sex?.value,
        contact_number: formData?.complainant?.contact_number?.value,
        barangay: formData?.complainant?.barangay?.value,
        street: formData?.complainant?.street?.value,
        additional_info: formData?.complainant?.additional_info?.value,
    }  

    useEffect(() => {
        fetchCaseTypes();
        fetchSettlementTypes();
    }, [fetchCaseTypes, fetchSettlementTypes]);

    useEffect(() => {
        if(userRole === 'admin') {
            fetchComplainants();
        }
        fetchRespondents();
    }, []);

    const isSelected = (user) => {
        return complainantList.some(
            (u) =>
            u.first_name?.toLowerCase() === user.first_name?.toLowerCase() &&
            u.last_name?.toLowerCase() === user.last_name?.toLowerCase()
        );
    };

     useEffect(() => {
        setComplainantInfo()
        if(userRole === 'user' && !isSelected(userInfo)) {
            set_complainants([userInfo])
        }
    }, [])


    const navigate = useNavigate();
    const [stepNumber, setStepNumber] = useState(1);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await addCaseData(); 

        if (res) {
            setStepNumber(5);
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

        if(stepNumber === 3 || (stepNumber === 4 && userRole === 'admin')) {
            
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

        if(stepNumber === 3 && userRole === 'user') {
            setSubmitModalOpen(true);
            return;
        }

        if (stepNumber === 4) {
           setSubmitModalOpen(true);
           return;
        }

        setStepNumber((prev) => prev + 1);
    };


    return(
        <main className="flex flex-col w-full h-full items-center justify-center gap-3 bg-white">
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
                            className={`text-sm absolute top-10 text-center 
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
                            className={`w-[120px] border 
                            ${step.number < stepNumber ? "border-redBase" : "border-zinc-400"}`}
                        ></div>
                        )}

                    </div>
                    ))}
                </div>
            </div>

            <form className="w-full flex flex-col items-center gap-6 max-h-max min-h-64 my-6 ">

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

            { submitModalOpen && (
                <div className="flex fixed items-center justify-center bottom-0 top-0 left-0 right-0 bg-black/50 z-50">
                    <div className="relative bg-white rounded-md p-6 flex flex-col items-center gap-3 w-[480px]">
                        <X className=" absolute top-3 right-3 cursor-pointer"
                        onClick={() => setSubmitModalOpen(false)} />
                        <p className="font-medium mt-5 text-center">I hereby swear that the information and evidence I have provided are true, accurate, and based on facts. I understand that providing false information may result in penalties under the law.</p>
                        <Button className={cn('!bg-redBase w-full mt-2')} onClick={(e) => {
                            handleSubmit(e);
                            setSubmitModalOpen(false);
                        }}>Submit Case</Button>
                        <Button variant="outline" className="w-full">Save as Draft</Button>
                    </div>
                </div>
            )}

            { stepNumber < 5 && (
                <div className="flex items-center justify-between w-1/2 pb-12 pt-6">
                    <Button onClick={handlePrev} variant="outline" className="text-redBase  !border-redBase ">
                        <ChevronLeft />
                        Previous
                    </Button>
                    <Button onClick={handleNext} className="!bg-redBase">
                        { stepNumber === 3 && userRole === 'user' ? "Submit Case" : stepNumber === 4 ? "Submit Case" : "Next" }
                        <ChevronRight />
                    </Button>
                </div>
            )}
            
        </main>

    )
}