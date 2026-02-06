import { useParams, useNavigate } from "react-router-dom";
import { useCaseStore } from "@/store/useCaseStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import { cn } from "@/lib/utils";
import { PageSync } from "@/components/PageSync";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import { ChevronLeft, X, Check, Edit, ArrowRight, ArrowUpRight } from "lucide-react";
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
import useCaseDocumentsStore from "@/store/useCaseDocumentStore";
import { FileText } from "lucide-react";
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore";
import { EditCaseInfo } from "@/components/EditCaseInfo";
import { CaseCancellationModal } from "@/components/CaseCancellationModal";
import { useLuponStore } from "@/store/useLuponStore";
import { EditCoAttendee } from "@/components/EditCoAttendee";
import { CaseSettingsModal } from "@/components/CaseSettingsModal";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function Case() {
    const { case_number } = useParams();
    const { cases, updateCaseStatus, deleteCase, setFormData, set_complainants, set_respondents } = useCaseStore();
    const { hearings } = useHearingStore();
    const { case_complainants, case_respondents, fetchCaseComplainants, fetchCaseRespondents } = useRetrieveUsersStore();
    const [template, setTemplate] = useState({});
    const { case_documents, fetchCaseDocuments } = useCaseDocumentsStore();
    const [viewImg, setViewImg] = useState(null);
    const { templates, fetchTemplates, generateDocument } = useGenerateDocumentStore();
    const { members } = useLuponStore();
    const [noShowModal, setNoShowModal] = useState(false);
    const [noShowUserData, setNoShowUserData] = useState({});

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    const userRole = data.userRole;

    useEffect(() => {
        fetchTemplates();
        fetchCaseDocuments(case_number);
    }, [case_number])

    const caseInfo = cases.find(c => c.id == case_number);

    useEffect(() => {
        if (caseInfo) {
            setFormData('caseDetails', 'nature_of_complaint_code', caseInfo.case_type.id);
            setFormData('caseDetails', 'severity', caseInfo.case_type.severity);
            setFormData('caseDetails', 'relationship', caseInfo.relationship);
            set_complainants(caseInfo.complainants);
            set_respondents(caseInfo.respondents);
        }
    }, [caseInfo]);

    const findHearingCase = hearings.length > 0 ? hearings.filter(hearing => hearing.case == case_number) : [];

    const lupon = members.find(member => member.id === findHearingCase[0]?.lupon_member);


    useEffect(() => {
        // Only fetch if caseInfo has valid complainants/respondents arrays
        if (caseInfo?.complainants && Array.isArray(caseInfo.complainants) && caseInfo.complainants.length > 0) {
            fetchCaseComplainants(caseInfo.complainants);
        }
        if (caseInfo?.respondents && Array.isArray(caseInfo.respondents) && caseInfo.respondents.length > 0) {
            fetchCaseRespondents(caseInfo.respondents);
        }
    }, [caseInfo])

    const navigate = useNavigate();

    // Show loading if cases haven't loaded yet
    if (!cases || cases.length === 0) {
        return (
            <div className="p-6 flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!caseInfo) {
        navigate(-1);
        return null;
    }

    const caseDetails =
    {
        section: "Case Information",
        details: [
            {
                label: "Case Number",
                value: caseInfo?.id,
            },
            {
                label: "Status",
                value: caseInfo?.case_status,
            },
            {
                label: "Date of Hearing",
                value: caseInfo?.date || '-'
            },
            {
                label: "Time",
                value: caseInfo?.time || '-'
            },
            {
                label: "Assigned Lupon",
                value: lupon ? lupon?.first_name + " " + (lupon?.middle_name ? lupon?.middle_name + " " : "") + lupon?.last_name : '-'
            },
            {
                label: "Predicted Hearings",
                value: (caseInfo?.predicted_hearings ? caseInfo.predicted_hearings + ' hearings' : '-')
            },
            {
                label: "Nature of Complaint",
                value: caseInfo.case_type.case_name || '-'
            }, {
                label: "Settlement",
                value: caseInfo?.settlement_type?.settlement_name || '-'
            },
            {
                label: "Severity",
                value: caseInfo?.case_type.severity || '-'
            },
            {
                label: "Description",
                value: caseInfo?.description || '-'
            },
            {
                label: "Documents",
                value: case_documents
            }
        ]
    }
        ;

    const generate = {
        user: [
            {
                code: 'monitoring',
                title: "Case Monitoring Sheet",
                img: case_monitoring,
                template_id: templates.find(t => t.template_type === 'monitoring')?.id,
            }
        ],
        admin: [
            {
                code: 'summon',
                title: "Summon Letter",
                img: summon_letter,
                template_id: templates.find(t => t.template_type === 'summon')?.id,
            }, {
                code: 'monitoring',
                title: "Case Monitoring Sheet",
                img: case_monitoring,
                template_id: templates.find(t => t.template_type === 'monitoring')?.id,
            }, {
                code: 'cancellation',
                title: "Cancellation Notice",
                img: cancellation_notice,
                template_id: templates.find(t => t.template_type === 'cancellation')?.id,
            }, {
                code: 'file_court',
                title: "File Court Certification",
                img: file_court,
                template_id: templates.find(t => t.template_type === 'court')?.id,
            }, {
                code: 'no-show',
                title: "No Show Notice",
                img: no_show_notice,
                template_id: templates.find(t => t.template_type === 'no-show')?.id,
            }
        ]
    }

    const handleTemplateSelect = async (case_data, template_name, template_id) => {
        try {
            await generateDocument(case_data, template_name, template_id);
        } catch (error) {
            console.log(error);
        }
    }

    const userStatusDisplay = (status) => {
        switch (status) {
            case "approved":
                return (
                    <>
                        <p className="font-medium">Case Approved</p>
                        <p className="text-zinc-700 text-sm">Your case is approved. A summon letter will be delivered to the respondent on: <strong>_____</strong>.</p>
                    </>
                );

            case "pending_approval":
                return (
                    <>
                        <p className="font-medium">Pending Approval</p>
                        <p className="text-zinc-700 text-sm">Your case is pending approval. The Lupon Secretary will review your submission.</p>
                    </>
                );

            case "in_progress":
                return (
                    <>
                        <p className="font-medium">In progess</p>
                        <p className="text-zinc-700 text-sm">Respondent acknowledged the summon. Your hearing schedule is on <strong>date</strong> at <strong>time</strong>.</p>
                    </>
                );

            case "rejected":
                return (
                    <>
                        <p className="font-medium text-lg text-redBase">
                            Your case appointment has been rejected.
                        </p>
                        <p className="text-redBase">
                            Rejected section: {caseInfo.rejection_section == "case_details" ? "Case Details" : caseInfo.rejection_section == "complainant_info" ? "Complainant Information" : "Respondent Information"}
                        </p>
                        <p className="text-redBase">
                            Reason: {caseInfo.remarks}
                        </p>
                        <EditCaseInfo section={caseInfo.rejection_section == "case_details" ? "case" : caseInfo.rejection_section == "complainant_info" ? "complainant" : "respondent"}
                            caseInfo={caseInfo} forResubmission={true} />
                    </>
                );

            default:
                return <p>Unknown Status</p>;
        }
    };

    return (
        <div className="relative flex flex-col gap-4 p-6 ">
            <PageSync page="" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft />
                    </Button>
                </div>


                <div className="flex gap-3">
                    {userRole == 'admin' && caseInfo.case_status == 'pending_approval' && (
                        <div className="flex gap-2">
                            <CaseCancellationModal caseInfo={caseInfo} />
                            <Button variant="default" className={cn("bg-redBase")}
                                onClick={() => {
                                    updateCaseStatus({
                                        id: caseInfo.id,
                                        case_status: "approved",
                                    }, "approved");
                                }}>
                                <Check />
                                Approve Case
                            </Button>
                        </div>
                    )}
                    {userRole == 'user' && caseInfo.case_status == 'pending_approval' && (
                        <div className="flex gap-2">
                            <Button variant="default" className={cn("bg-redBase")}
                                onClick={() => {
                                    deleteCase(caseInfo.id);
                                }}>
                                Withdraw Application
                            </Button>
                        </div>
                    )}
                    <CaseSettingsModal caseData={caseInfo} />
                </div>

            </div>

            <div className="flex flex-col gap-6 bg-white p-4 rounded-md shadow-2xs border ">
                <div className={`grid grid-cols-4 items-center gap-3`}>
                    <div className="flex flex-col gap-2 items-center">
                        <p className="text-sm">Appointment Submitted</p>
                        <div className="h-1 w-full rounded-full bg-green-600 "></div>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <p className="text-sm">Pending Approval</p>
                        <div
                            className={`w-full h-1 rounded-full 
                                ${caseInfo.case_status === 'approved' || caseInfo.case_status !== 'pending_approval' ? 'bg-green-600' : 'bg-gray-300'}`}
                        ></div>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <p className="text-sm">On-Going Hearing</p>
                        <div
                            className={`w-full h-1 rounded-full 
                                ${caseInfo.case_status === 'in_progress' ? 'bg-green-600' : 'bg-gray-300'}`}
                        ></div>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <p className="text-sm">Case Resolved</p>
                        <div
                            className={`w-full h-1 rounded-full 
                                ${caseInfo.case_status === 'resolved' ? 'bg-green-600' : 'bg-gray-300'}`}
                        ></div>
                    </div>
                </div>
                {userRole == 'user' && (
                    <div className="flex flex-col">
                        {userStatusDisplay(caseInfo.case_status)}
                    </div>
                )}
            </div>


            <div className="flex flex-col gap-4 bg-white p-4 rounded-md border shadow-2xs">

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">{caseDetails.section}</h2>
                    <EditCaseInfo section="case"
                        caseInfo={caseInfo} forResubmission={false} />
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {caseDetails.details.map((detail) => (
                        <div key={detail.label}
                            className={`flex flex-col gap-1 
                            ${detail.label === 'Description' ? 'col-span-2' : ''}
                            ${detail.label === 'Documents' ? 'col-span-4' : ''}
                            `}
                        >
                            <Label className={cn("text-zinc-600 font-normal text-xs")}>
                                {detail.label}
                            </Label>
                            {detail.label === 'Status' ? <CaseStatusDisplay caseStatus={detail.value} /> :
                                detail.label === 'Documents' ?
                                    <div className="flex gap-2">
                                        {detail.value && detail.value.length > 0 ? (
                                            detail.value.map((doc, index) => {

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
                                                        <FileText />
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

                {viewImg && (
                    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
                        onClick={() => setViewImg(null)}
                    >
                        <X className="text-white absolute top-4 right-4 cursor-pointer" onClick={() => setViewImg(null)} />
                        <img src={viewImg} alt="Document View" className=" h-1/2 rounded-md shadow-lg" />
                    </div>
                )}






            </div>

            {case_complainants?.length > 0 &&
                (<div className="flex flex-col gap-4 bg-white p-4 rounded-md border shadow-2xs">

                    <div className="flex flex-col">
                        <h2 className="font-medium mb-2 text-zinc-900">Complainants</h2>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-left px-4 py-2">Full Name</TableHead>
                                        <TableHead className="text-left px-4 py-2">Contact</TableHead>
                                        <TableHead className="px-4 py-2"></TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {case_complainants.map(c => (

                                        <TableRow key={c.id} className="border-t">
                                            <TableCell className="px-4 py-2">{c.first_name} {c.middle_name ? c.middle_name + ' ' : ''}{c.last_name}</TableCell>
                                            <TableCell className="px-4 py-2">{c.contact_number || "-"}</TableCell>
                                            <TableCell>
                                                <EditCoAttendee co_attendees={caseInfo.complainants} type="complainant"
                                                    attendeeInfo={c} />
                                            </TableCell>
                                        </TableRow>

                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                )
            }

            {case_respondents?.length > 0 &&
                (
                    <div className="flex flex-col gap-4 bg-white p-4 rounded-md border shadow-2xs">
                        <div className="flex flex-col">
                            <h2 className="font-medium mb-2 text-zinc-900">Respondents</h2>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-left px-4 py-2">Full Name</TableHead>
                                            <TableHead className="text-left px-4 py-2">Contact</TableHead>
                                            <TableHead className="px-4 py-2"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {case_respondents.map(c => (
                                            <TableRow key={c.id} className="border-t">
                                                <TableCell className="px-4 py-2">{c.first_name} {c.middle_name ? c.middle_name + ' ' : ''}{c.last_name}</TableCell>
                                                <TableCell className="px-4 py-2">{c.contact_number || "-"}</TableCell>
                                                <TableCell>
                                                    <EditCoAttendee co_attendees={caseInfo.respondents} type="respondent"
                                                        attendeeInfo={c} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )
            }

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
                                            <Link
                                                to={userRole === 'admin' ? `/Admin/Hearing/${hearing.id}` : `/u/${data.id}/Hearing/${hearing.id}`}
                                                className="text-redBase bg-red-100 px-3 py-2 rounded-lg text-sm">
                                                Details
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    {userRole === 'admin' && caseInfo.case_status == 'approved' ? (
                                        <TableCell className="px-4 py-3 text-center" colSpan={7}>
                                            <Link to={`/Admin/Case/Hearing-Scheduler/${caseInfo.id}`}
                                                className="text-redBase border-b border-redBase">
                                                Schedule Case Hearings
                                                <ArrowUpRight className="inline-block ml-1 h-4 w-4" />
                                            </Link>
                                        </TableCell>
                                    ) : (
                                        <TableCell className="px-4 py-2 text-center" colSpan={7}>
                                            Hearing schedule will appear here once approved.
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex flex-col gap-3 bg-white p-4 rounded-md shadow-2xs border">
                <h2 className="text-xl font-medium">Generate Documents</h2>
                <div className="grid grid-cols-5 gap-3 ">
                    {userRole === 'admin' ? (
                        generate.admin.map(doc => (
                            <button type="button" key={doc.title}
                                className="shadow-sm border bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-3  "
                                onClick={() => {
                                    if (doc.code === 'no-show') {
                                        setNoShowModal(true);
                                        setNoShowUserData(caseInfo);
                                        setTemplate(doc);
                                        return;
                                    }

                                    handleTemplateSelect(caseInfo, doc.code, doc.template_id)
                                }}>
                                <img src={doc.img} className="h-[50%] object-contain" />
                                <p className="text-redBase text-sm">{doc.title}</p>
                            </button>
                        ))
                    ) : (
                        generate.user.map(doc => (
                            <button type="button" key={doc.title}
                                className="shadow-sm border bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-3 "
                                onClick={() => handleTemplateSelect(caseInfo, doc.code, doc.template_id)}>
                                <img src={doc.img} className="h-[50%] object-contain" />
                                <p className="text-redBase text-sm">{doc.title}</p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {noShowModal && (
                <div className="fixed bg-black/80 z-10 top-0 right-0 bottom-0 left-0  flex flex-col items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] border flex flex-col gap-3">
                        <button className="self-end -mt-3 -mr-3" onClick={() => setNoShowModal(false)}><X className="h-5" /></button>
                        <p>Select if no show notice is for complainant or respondent.</p>
                        <div className="flex flex-col gap-2">
                            <Button variant="default" className="bg-redBase hover:bg-redBase/80" onClick={() => {
                                handleTemplateSelect({ data: noShowUserData, user: "c" }, template.code, template.template_id);
                                setNoShowModal(false);
                            }}>
                                Complainant
                            </Button>

                            <Button variant="default" className="bg-redBase hover:bg-redBase/80" onClick={() => {
                                handleTemplateSelect({ data: noShowUserData, user: "r" }, template.code, template.template_id);
                                setNoShowModal(false);
                            }}>
                                Respondent
                            </Button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}