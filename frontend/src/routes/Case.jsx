import { useParams, useNavigate } from "react-router-dom";
import { useCaseStore } from "@/store/useCaseStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { luponMembers } from "@/test/user_data";
// import { natureOfComplaints } from "@/test/data";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PageSync } from "@/components/PageSync";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import useHearingStore from "@/store/useHearingStore";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";

export function Case() {
    const { case_number } = useParams();
    const { cases } = useCaseStore();
    const { hearings } = useHearingStore();
    const { complainantsUsers, fetchComplainants} = useRetrieveUsersStore();

    useEffect(() => {
        fetchComplainants()
    }, [])

    

    const findHearingCase = hearings.filter( hearing => hearing.case == case_number);

    const caseInfo = cases.find( c => c.id == case_number);
    console.log(caseInfo)

    const caseCoComplainants = [];

    caseInfo?.co_complainants_ids?.map( (c) => {
        caseCoComplainants.push(complainantsUsers.find( co_c => co_c.id == c))
    })

    const formatCoComplainants = () => {
        const newFormat = []
        caseCoComplainants.map( (co_c) => 
            newFormat.push(
                {
                    full_name: `${co_c?.first_name} ${co_c?.middle_name ? co_c?.middle_name + ' ' : ''}${co_c?.last_name}`,
                    contact_number: co_c?.contact_number,
                }
            )
        )
        return newFormat;
    } 

    const navigate = useNavigate();
    

    if(!caseInfo){
        navigate(-1);
        return null;
    }


    const lupon = luponMembers.find(member => member.id === caseInfo?.lupon_member_id);
    

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
                    value: caseInfo.case_type.case_name || '-'
                },{
                    label:"Settlement",
                    value: caseInfo.settlement_type.settlement_name || '-'
                },
                {
                    label:"Severity",
                    value: caseInfo?.case_type.severity || '-'
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
                    value: `${caseInfo?.complainant_user?.first_name} ${caseInfo?.complainant_user?.middle_name ? caseInfo?.complainant_user?.middle_name + ' ' : ''}${caseInfo?.complainant_user?.last_name}`
                },
                {
                    label: "Gender",
                    value: caseInfo?.complainant_user?.sex || '-'
                },
                {
                    label: "Birth Date",
                    value: formatedBday(caseInfo?.complainant_user?.birth_date)
                },
                {
                    label: "Contact",
                    value: caseInfo?.complainant_user?.contact_number || '-'
                },
                {  
                    label: "Address",
                    value: `${caseInfo?.complainant_user?.street}, ${caseInfo?.complainant_user?.barangay}${caseInfo?.complainant_user?.additional_info ? ', ' + caseInfo?.complainant_user?.additional_info : ''}`
                },
            ]
        },
        {
            section: "Respondent Information",
            details: [
                {
                    label: "Full Name",
                    value: `${caseInfo?.respondent_user?.first_name} ${caseInfo?.respondent_user?.middle_name ? caseInfo?.respondent_user?.middle_name + ' ' : ''}${caseInfo?.respondent_user?.last_name}`
                },
                {
                    label: "Gender",
                    value: caseInfo?.respondent_user?.sex || '-'
                },
                {
                    label: "Birth Date",
                    value: formatedBday(caseInfo?.respondent_user?.birth_date)
                },
                {
                    label: "Contact",
                    value: caseInfo?.respondent_user?.contact_number || '-'
                },
                {  
                    label: "Address",
                    value: `${caseInfo?.respondent_user?.street}, ${caseInfo?.respondent_user?.barangay}${caseInfo?.respondent_user?.additional_info ? ', ' + caseInfo?.respondent_user?.additional_info : ''}`
                },
            ]
        }
    ];

    
    return (
        <div className="flex flex-col gap-4 p-6 ">
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
            
            {caseDetails.map((section) => (
                <div key={section.section} className="flex flex-col gap-4 bg-white p-4 rounded-md border shadow-2xs">
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
                                ${detail.label === 'Documents' ? 'col-span-4' : ''}
                                `}
                                >
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
                                        <p>{detail.value}</p>
                                    }
                                </div>
                            ))}
                    </div> 

                    { section.section === "Complainant Information" && caseCoComplainants.length > 0 &&                     
                        (
                            <div className="flex flex-col">
                                <h2 className="font-medium mb-2 text-zinc-700">Co-Complainants</h2>
                                    {formatCoComplainants().map( c => (
                                        <div key={c} 
                                        className="ml-2 grid grid-cols-2 gap-4 "
                                        >
                                            <div
                                            className="flex flex-col gap-1 "
                                            >
                                                <Label className={cn("text-zinc-600 font-normal text-xs")}>
                                                Full Name
                                                </Label>
                                                <p>{c.full_name}</p>
                                            </div>
                                            <div
                                            className="flex flex-col gap-1 "
                                            >
                                                <Label className={cn("text-zinc-600 font-normal text-xs")}>
                                                    Contact
                                                </Label>
                                                <p>{c.contact_number}</p>
                                            </div>
                                        </div>
                                        
                                    ))}
                            </div>
                        )
                    }
                   

                </div>
            ))}

            <h2 className="text-xl font-semibold">Hearings</h2>


        </div>
    );
}