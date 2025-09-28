import { useParams, useNavigate } from "react-router-dom";
import { useCaseStore } from "@/store/useCaseStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { luponMembers } from "@/test/user_data";
import { natureOfComplaints } from "@/test/data";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PageSync } from "@/components/PageSync";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import { ChevronLeft } from "lucide-react";

export function Case() {
    const { case_number } = useParams();
    const { getCaseByNumber } = useCaseStore();
    const caseInfo = getCaseByNumber(case_number);
    const navigate = useNavigate();

    if(!caseInfo){
        navigate(-1);
        return null;
    }

    const lupon = luponMembers.find(member => member.id === caseInfo?.lupon_member_id);
    const natureOfComplaint = natureOfComplaints.find(noc => noc.code === caseInfo?.nature_of_complaint_code);

    const formatedBday = (dateString) => {
        if(!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    const caseDetails = [
        {
            section: "Case Information",
            details: [
                {
                    label:"Status",
                    value: caseInfo?.case_status, 
                },
                {
                    label:"Date of Hearing",
                    value: caseInfo?.date || '-'
                },
                {
                    label:"Time",
                    value: caseInfo?.time || '-'
                },
                {
                    label: "Assigned Lupon",
                    value: lupon?.name || '-'
                },
                {
                    label:"Predicted Hearings",
                    value: (caseInfo?.predicted_number ? caseInfo.predicted_number + ' hearings' : '-') 
                },
                {
                    label:"Nature of Complaint",
                    value: natureOfComplaint?.label || '-'
                },
                {
                    label:"Severity",
                    value: caseInfo?.severity || '-'
                },
                {
                    label:"Description",
                    value: caseInfo?.description || '-'
                },
                {
                    label:"Documents",
                    value: caseInfo?.documents
                }
            ]
        },
        {
            section: "Complainant Information",
            details: [
                {
                    label: "Full Name",
                    value: `${caseInfo?.c_first_name} ${caseInfo?.c_middle_name ? caseInfo?.c_middle_name + ' ' : ''}${caseInfo?.c_last_name}`
                },
                {
                    label: "Gender",
                    value: caseInfo?.c_sex || '-'
                },
                {
                    label: "Birth Date",
                    value: formatedBday(caseInfo?.c_birth_date)
                },
                {
                    label: "Contact",
                    value: caseInfo?.c_contact_number || '-'
                },
                {  
                    label: "Address",
                    value: `${caseInfo?.c_street}, ${caseInfo?.c_barangay}${caseInfo?.c_additional_info ? ', ' + caseInfo?.c_additional_info  : ''}`
                },
            ]
        },
        {
            section: "Respondent Information",
            details: [
                {
                    label: "Full Name",
                    value: `${caseInfo?.r_first_name} ${caseInfo?.r_middle_name ? caseInfo?.r_middle_name + ' ' : ''}${caseInfo?.r_last_name}`
                },
                {
                    label: "Gender",
                    value: caseInfo?.r_sex || '-'
                },
                {
                    label: "Birth Date",
                    value: formatedBday(caseInfo?.c_birth_date)
                },
                {
                    label: "Contact",
                    value: caseInfo?.r_contact_number || '-'
                },
                {  
                    label: "Address",
                    value: `${caseInfo?.r_street}, ${caseInfo?.r_barangay}${caseInfo?.r_additional_info ? ', ' + caseInfo?.r_additional_info  : ''}`
                },
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-4 p-6 bg-white">
            <PageSync page="" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft />
                    </Button>
                    <h1 className="text-xl font-medium text-redBase">{caseInfo?.case_number}</h1>
                </div>
                <Button variant="outline">Edit Case</Button>
            </div>

            <Separator />
            
            {caseDetails.map((section) => (
                <div key={section.section} className="flex flex-col gap-4">
                    {section.section === "Case Information" &&                     
                    <h2 className="text-lg font-medium">{section.section}</h2>
                    }

                    {section.section === "Complainant Information" &&                     
                    <h2 className=" w-fit px-2 text-lg font-medium bg-blue-50 text-blue-500">{section.section}</h2>
                    }

                    {section.section === "Respondent Information" &&                     
                    <h2 className=" w-fit px-2 text-lg font-medium bg-orange-50 text-orange-500">{section.section}</h2>
                    }

                    <div className="grid grid-cols-4 gap-4">
                        {section.details.map((detail) => (
                            <div key={detail.label} 
                            className={`flex flex-col gap-1 
                            ${detail.label === 'Description' ? 'col-span-2' : ''}
                            ${detail.label === 'Documents' ? 'col-span-4' : ''}`}>
                                <Label className={cn("text-zinc-600 font-normal text-xs")}>
                                    {detail.label}
                                </Label>
                                {detail.label === 'Status'? <CaseStatusDisplay caseStatus={detail.value} /> : 
                                detail.label === 'Documents'? 
                                    <div>
                                        { detail.value && detail.value.length > 0 ? (
                                            detail.value.map((doc, index) => {
                                                const file = doc?.url || doc?.path || ""; // adjust based on your actual API

                                                if (!file) {
                                                    return <p>No documents submitted</p>;
                                                }

                                                return file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                <img
                                                    key={index}
                                                    src={file}
                                                    alt={`Document ${index + 1}`}
                                                    className="max-w-xs mb-2 border"
                                                />
                                                ) : (
                                                <a
                                                    key={index}
                                                    href={file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-redBase underline"
                                                >
                                                    Document {index + 1}
                                                </a>
                                                );
                                            })
                                        ) : (
                                        <p>-</p>
                                        )}
                                    </div> 
                                    : 
                                    <p>{detail.value}</p> }
                            </div>
                        ))}
                    </div>

                    <Separator />

                </div>
            ))}

            <h2 className="text-xl font-semibold">Hearings</h2>


        </div>
    );
}