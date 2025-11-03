import { useParams, useNavigate } from "react-router-dom";
import { useCaseStore } from "@/store/useCaseStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { luponMembers } from "@/test/user_data";
import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import { cn } from "@/lib/utils";
import { PageSync } from "@/components/PageSync";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import { ChevronLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import useHearingStore from "@/store/useHearingStore";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "react-router-dom";
import axios from 'axios';
import useCaseDocumentsStore from "@/store/useCaseDocumentStore";
import { FileText } from "lucide-react";


const API_BASE_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function Case() {
    const { case_number } = useParams();
    const { cases } = useCaseStore();
    const { hearings } = useHearingStore();
    const { complainantsUsers, fetchComplainants} = useRetrieveUsersStore();
    const [templates, setTemplates] = useState([]);
    const { case_documents, fetchCaseDocuments } = useCaseDocumentsStore();
    const [ viewImg, setViewImg ] = useState(null);

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    const userRole = data.userRole;

    useEffect(() => {
        fetchComplainants();
        fetchTemplates();
        fetchCaseDocuments(case_number);
    }, [case_number])

    const fetchTemplates = async () => {
        try {
        const response = await axios.get(`${API_BASE_URL}/document-templates/`);
        setTemplates(response.data);
        } catch (error) {
        console.error('Error fetching templates:', error);
        }
    };
    

    const findHearingCase = hearings.filter( hearing => hearing.case == case_number);

    const caseInfo = cases.find( c => c.id == case_number);

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
                    value: case_documents
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

    const generate = {
        user: [
            {
                code: 'monitoring',
                title: "Case Monitoring Sheet",
                img: case_monitoring,
                template_id: templates.find( t => t.template_type === 'monitoring')?.id,
            }
        ],
        admin:[
             {
                code: 'summon',
                title: "Summon Letter",
                img: summon_letter,
                template_id: templates.find( t => t.template_type === 'summon')?.id,
            },{
                code: 'monitoring',
                title: "Case Monitoring Sheet",
                img: case_monitoring,
                template_id: templates.find( t => t.template_type === 'monitoring')?.id,
            },{
                code: 'cancellation',
                title: "Cancellation Notice",
                img: cancellation_notice,
                template_id: templates.find( t => t.template_type === 'cancellation')?.id,
            },{
                code: 'file_court',
                title: "File Court Certification",
                img: file_court,
                template_id: templates.find( t => t.template_type === 'court')?.id,
            },{
                code: 'no-show',
                title: "No Show Notice",
                img: no_show_notice,
                template_id: templates.find( t => t.template_type === 'no-show')?.id,
            }
        ]
    }
    
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
                                        <div className="flex gap-2">
                                            { detail.value && detail.value.length > 0 ? (
                                                detail.value.map((doc, index) => {
                                                    // const file = doc?.file ? `${BASE_URL}${doc.file}` : "";
                                                    const file = doc?.file
                                                        ? doc.file.startsWith("http")
                                                            ? doc.file
                                                            : `${BASE_URL}${doc.file}`
                                                        : "";
                                                        
                                                    console.log("Document file:", file);
                                                    if (!file) {
                                                        return <p key={index}>No documents submitted</p>;
                                                    }

                                                    return file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                        <Button variant="outline" key={index} onClick={(e) => {
                                                            e.preventDefault();
                                                            setViewImg(file);
                                                        }}>
                                                            <img
                                                            src={file}
                                                            alt={`Document ${index + 1}`}
                                                            className="h-full object-contain"
                                                            />
                                                        </Button>
                                                        
                                                    ) : (
                                                        <Button
                                                        type="link"
                                                        key={index}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.open(file, '_blank');
                                                        }} variant="outline"
                                                        rel="noopener noreferrer"
                                                        className="border  py-2 px-4 rounded-lg flex items-center gap-2"
                                                        >
                                                            <FileText  />
                                                            {doc.title || `Document ${index + 1}`}
                                                        </Button>
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

                    { viewImg && (
                        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
                        onClick={() => setViewImg(null)}
                        >
                            <X className="text-white absolute top-4 right-4 cursor-pointer" onClick={ () => setViewImg(null)} />
                            <img src={viewImg} alt="Document View" className=" h-1/2 rounded-md shadow-lg" />
                        </div>
                    )}

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

            <div className="flex flex-col gap-4 bg-white p-4 rounded-md shadow-2xs border">
                <h2 className="text-xl font-semibold">Hearing Attendance</h2>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="text-left px-4 py-2">Hearing #</TableHead>
                            <TableHead className="text-left px-4 py-2">Date</TableHead>
                            <TableHead className="text-left px-4 py-2">Time</TableHead>
                            <TableHead className="text-left px-4 py-2">Complainant</TableHead>
                            <TableHead className="text-left px-4 py-2">Respondent</TableHead>
                            <TableHead className="text-left px-4 py-2">Status</TableHead>
                            <TableHead className="px-4 py-2"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {findHearingCase.length > 0 ? (
                            findHearingCase.map((hearing, index) => (
                                <TableRow key={hearing.id} className="border-t">
                                <TableCell className="px-4 py-2">{index + 1}</TableCell>
                                <TableCell className="px-4 py-2">{hearing.hearing_date}</TableCell>
                                <TableCell className="px-4 py-2">{hearing.time}</TableCell>
                                <TableCell className="px-4 py-2">hearing attendance</TableCell>
                                <TableCell className="px-4 py-2">hearing attendance</TableCell>
                                <TableCell className="px-4 py-2"> <CaseStatusDisplay caseStatus={hearing.hearing_status} /></TableCell>
                                <TableCell className={cn("py-4")}>
                                    <Link className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm">
                                    Details
                                    </Link>
                                </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell className="px-4 py-2" colSpan={8}>
                                No hearing attendance found.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex flex-col gap-3 bg-white p-4 rounded-md shadow-2xs border">
                <h2 className="text-xl font-medium">Generate Documents</h2>
                <div className="flex flex-wrap gap-4 ">
                    { userRole === 'admin' ? (
                        generate.admin.map( doc => (
                            <button type="button" key={doc.title} className="shadow-sm border bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] ">
                                <img src={doc.img} className="h-[150px]" />
                                <p className="text-redBase">{doc.title}</p>
                            </button>
                        ))
                    ): (
                        generate.user.map( doc => (
                            <button type="button" key={doc.title} className="shadow-sm border bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] " >
                                <img src={doc.img} className="h-[150px]" />
                                <p className="text-redBase">{doc.title}</p>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}