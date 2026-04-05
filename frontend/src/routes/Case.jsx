import { useParams, useNavigate, Link } from "react-router-dom";
import { useCaseStore } from "@/store/useCaseStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import { cn } from "@/lib/utils";
import docs from "@/assets/google-docs.png"
import { PageSync } from "@/components/PageSync";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import { ChevronLeft, X,Check, Scale, ArrowRight, ArrowUpRight, Loader2, FileText, CheckCircle2, PartyPopper, Loader2Icon, AlertCircle, RotateCw, CalendarIcon, Users2  } from "lucide-react";
import { useEffect, useState } from "react";
import useHearingStore from "@/store/useHearingStore";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import useCaseDocumentsStore from "@/store/useCaseDocumentStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore";
import { EditCaseInfo } from "@/components/EditCaseInfo";
import { CaseCancellationModal } from "@/components/CaseCancellationModal";
import { useLuponStore } from "@/store/useLuponStore";
import { EditCoAttendee } from "@/components/EditCoAttendee";
import { CaseSettingsModal } from "@/components/CaseSettingsModal";
import { fetchCase } from "@/store/useCaseStore";
import toast from "react-hot-toast";
import { formatedDateToString } from "@/lib/helpers";
import useAuthenticationStore from "@/store/useAuthenticationStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function Case() {
    const { case_number } = useParams();
    const { userLinkName, userInfo } = useAuthenticationStore();
    const { cases, updateCaseStatus, setFormData, set_complainants, set_respondents, reSubmitCase } = useCaseStore();
    const { caseHearings, fetchHearingsByCase } = useHearingStore();
    const [template, setTemplate] = useState({});
    const { case_documents, fetchCaseDocuments } = useCaseDocumentsStore();
    const [viewImg, setViewImg] = useState(null);
    const { templates, fetchTemplates, generateDocument } = useGenerateDocumentStore();
    const { members } = useLuponStore();

    const [ noShowModal, setNoShowModal ] = useState(false);
    const [ noShowUserData, setNoShowUserData ] = useState({});
    const [refreshLoader, setRefreshLoader] = useState(false);

    const [resubmitLoader, setResubmitLoader] = useState(false);
    const [approveLoader, setApproveLoader] = useState(false);

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    const userRole = data.userRole;


    useEffect(() => {
        fetchTemplates();
        fetchCaseDocuments(case_number);
    }, [case_number])

    const [caseInfo, setCaseInfo] = useState(cases?.find(c => c.id == case_number));
    const [findHearingCase, setFindHearingCase] = useState(caseHearings);

    useEffect(() => {
        if (caseInfo) {
            setFormData('caseDetails', 'nature_of_complaint_code', caseInfo.case_type.id);
            setFormData('caseDetails', 'severity', caseInfo.case_type.severity);
            setFormData('caseDetails', 'relationship', caseInfo.relationship);
            set_complainants(caseInfo.complainants);
            set_respondents(caseInfo.respondents);
            fetchHearingsByCase(case_number).then((data) => setFindHearingCase(data));
        }
    }, [caseInfo]);

    const navigate = useNavigate();

    if (!caseInfo) {
        navigate(-1);
        return null;
    }

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
            await generateDocument(case_data,findHearingCase, template_name, template_id);
        } catch (error) {
            console.log(error);
        }
    }

    const reSubmission = async () => {
        setResubmitLoader(true);
        try {
            await toast.promise( reSubmitCase(caseInfo.id), {
                loading: "Resubmitting case...",
                success: async () => {
                    const updatedCase = await fetchCase(caseInfo?.id);
                    setCaseInfo(updatedCase);
                    return "Case resubmitted successfully!"
                },
                error: "Failed to resubmit case. Please try again."
            });
        } catch (error) {
            console.error("Error resubmitting case:", error);
        } finally {
            setResubmitLoader(false);
        }
    };

    const approveCase = async () => {
        setApproveLoader(true);

        try {
            await toast.promise(
                updateCaseStatus({ id: caseInfo.id, case_status: "approved", approved_case_date: new Date() }, "approved"),
                {
                    loading: "Approving case...",
                    success: async () => {
                        const updatedCase = await fetchCase(caseInfo?.id);
                        setCaseInfo(updatedCase);

                        await fetchHearingsByCase(caseInfo?.id); 
                        
                        setFindHearingCase(caseHearings);
                        
                        return "Case approved successfully!";
                    },
                    error: (err) => {
                        return err?.response?.data?.message || "Failed to approve case.";
                    },
                }
            );
        } catch (error) {
            console.error("Error approving case:", error);
        } finally {
            setApproveLoader(false);
        }
    };

    const userStatusDisplay = (status) => {
        switch (status) {
            case "approved": {
                const getTargetDate = () => {
                    if (caseInfo?.summon_status === 'pending') {
                        return findHearingCase?.find(h => h.hearing_number === 1)?.hearing_date || '-';
                    }
                    if (caseInfo?.summon_status === 'served') {
                        return findHearingCase?.find(h => h.hearing_status === 'scheduled' || h.hearing_status === 'rescheduled')?.hearing_date || '-';
                    }
                    return null;
                };

                const targetDate = getTargetDate();

                return (
                    <>
                        <p className="font-medium">Case Approved</p>
                        <p className="text-zinc-700 text-sm">
                            Your case is approved.{" "}
                            {targetDate ? (
                                <>
                                    A summon letter will be delivered to the respondent before:{" "}
                                    <strong>{targetDate}</strong>.
                                </>
                            ) : (
                                "Lupon Secretary will soon generate your case schedule."
                            )}
                        </p>
                    </>
                );
            }
            case "pending_approval":
                return (
                    <>
                        <p className="font-medium">Pending Approval</p>
                        <p className="text-zinc-700 text-sm">Your case is pending approval. The Lupon Secretary will review your submission. You can still edit your case information if needed.</p>
                    </>
                );

            case "in_progress":{
                const h_sched = findHearingCase?.find( h => h.hearing_status == 'scheduled');
                return (
                    <>
                        <p className="font-medium">In progess</p>
                        <p className="text-zinc-700 text-sm">Respondent acknowledged the summon. Your hearing schedule is on <strong>{h_sched?.hearing_date || '-'}</strong> at <strong>{h_sched?.time || '-'}</strong>.</p>
                    </>
                );
            }

            default:
                return <p>Unknown Status</p>;
        }
    };

    const refreshCaseData = async () => {
        try{
            setRefreshLoader(true);
            const updatedCase = await fetchCase(caseInfo?.id);
            setCaseInfo(updatedCase);
            fetchHearingsByCase(case_number);
            setFindHearingCase(caseHearings);   
            fetchCaseDocuments(case_number);
            setRefreshLoader(false);
        }
        catch(error){
            setRefreshLoader(false);
            toast.error("Failed to refresh case data. Please try again.");
        }
    }

    const checkIfComplainant = caseInfo?.complainants?.find(comp => comp.email === userInfo.email)
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
                            <CaseCancellationModal caseInfo={caseInfo} refresh={refreshCaseData} />
                            <Button variant="default" className={cn("bg-redBase")}
                                onClick={approveCase} disabled={approveLoader}>
                                <Check />
                                Approve Case
                            </Button>
                        </div>
                    )}
                    <CaseSettingsModal role={userRole} caseData={caseInfo} hearings={findHearingCase} />
                    <Button
                    variant="outline"
                    onClick={refreshCaseData}>

                        <RotateCw className={refreshLoader ? "animate-spin" : ""} />
                    </Button>
                </div>

            </div>

            {caseInfo.case_status !== 'filed' && (checkIfComplainant || userRole == 'admin') && (
            <div className="flex flex-col gap-6 bg-white p-4 rounded-md shadow-2xs">
                <div className={`grid grid-cols-2 md:grid-cols-4 items-center gap-3`}>
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
                                ${caseInfo.case_status === 'in_progress' || caseInfo.case_status === 'resolved' || caseInfo.case_status === 'escalated' ? 'bg-green-600' : 'bg-gray-300'}`}
                        ></div>
                    </div>
                    {caseInfo.case_status === 'escalated' ? (
                        <div className="flex flex-col gap-2 items-center">
                            <p className="text-sm">Case Escalated</p>
                            <div
                                className={`w-full h-1 rounded-full 
                                    ${caseInfo.case_status === 'escalated' ? 'bg-redBase' : 'bg-gray-300'}`}
                            ></div>
                        </div>
                    ): (
                        <div className="flex flex-col gap-2 items-center">
                            <p className="text-sm">Case Resolved</p>
                            <div
                                className={`w-full h-1 rounded-full 
                                    ${caseInfo.case_status === 'resolved' ? 'bg-green-600' : 'bg-gray-300'}`}
                            ></div>
                        </div>
                    )}
                </div>
                {userRole == 'user' && caseInfo?.case_status != 'rejected'  && (
                    <div className="flex flex-col">
                        {userStatusDisplay(caseInfo?.case_status)}
                    </div>
                )}
            </div>
            )}

            {userRole == 'user' && caseInfo?.case_status == 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                {/* Icon Container */}
                <div className="bg-red-100 p-3 rounded-full shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-red-900 leading-none">
                                Appointment Rejected
                            </h3>
                            <span className="text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                                Action Required
                            </span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">
                            Your case appointment was not approved. Please review the details below and resubmit.
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                        <div className="bg-white/50 p-3 rounded-lg border border-red-100">
                            <p className="text-[10px] uppercase font-bold text-red-400">Section to Fix</p>
                            <p className="text-sm font-semibold text-red-900">{caseInfo?.rejection_section}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-lg border border-red-100">
                            <p className="text-[10px] uppercase font-bold text-red-400">Reason for Rejection</p>
                            <p className="text-sm font-medium text-red-800 italic">"{caseInfo?.remarks || "No specific reason provided."}"</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <Button 
                            onClick={reSubmission} 
                            disabled={resubmitLoader}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm gap-2"
                        >
                            Resubmit Case
                        </Button>
                    </div>
                </div>
            </div> )}

            {caseInfo.case_status === 'filed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-blue-900 leading-none">
                                Draft Case
                            </h3>
                        </div>
                        <p className="text-blue-700 text-sm mt-1">
                            This case has been saved to draft.
                        </p>
                    </div>
                </div>
            )}

            {caseInfo.case_status === 'resolved' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="bg-emerald-100 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-emerald-900 leading-none">
                                Case Resolved
                            </h3>
                            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                                Official
                            </span>
                        </div>
                        <p className="text-emerald-700 text-sm mt-1">
                            This case has been successfully settled and closed.
                        </p>
                        
                        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-emerald-100 italic text-sm text-emerald-800">
                            <span className="font-semibold not-italic">Closing Remarks: </span> 
                            "{caseInfo?.remarks}"
                        </div>
                    </div>
                </div>
            )}

            {/* Display for escalated or resolved cases */}
            {caseInfo.case_status === 'escalated' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="bg-red-100 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-redBase" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-redBase leading-none">
                                Case Escalated
                            </h3>
                            <span className="text-[10px] bg-red-200 text-redBase px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                                Official
                            </span>
                        </div>
                        <p className="text-redBase text-sm mt-1">
                            This case has been escalated to {caseInfo?.cfa.cfa || 'further review'}.
                        </p>
                        
                        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-red-100 italic text-sm text-redBase">
                            <span className="font-semibold not-italic">Closing Remarks: </span> 
                            "{caseInfo?.remarks}"
                        </div>
                    </div>
                </div>
            )}

            <Card className="shadow-sm border-zinc-200 py-2">
                <CardHeader className="flex flex-row items-center justify-between gap-2 border-b bg-zinc-50/50 py-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                                Case Information
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-zinc-900">{caseInfo?.id}</h2>
                                <CaseStatusDisplay caseStatus={caseInfo?.case_status} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-zinc-400">Nature of Complaint</p>
                            <p className="font-semibold text-zinc-700">{caseInfo?.case_type?.case_name || '-'}</p>
                        </div>
                        { (checkIfComplainant || userRole == 'admin' ) && (
                            <EditCaseInfo section="case"
                            caseInfo={{
                                ...caseInfo,
                                case_documents: case_documents
                            }} refresh={refreshCaseData} />
                         )}
                        
                </CardHeader>

                <CardContent className="px-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    
                    {/* Column 1: Hearing Progress */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <CalendarIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Hearing Timeline</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-50 p-3 rounded-lg border">
                                <p className="text-[10px] uppercase text-zinc-400 font-bold">Actual</p>
                                <p className="text-lg font-semibold">{caseInfo?.actual_hearings || "0"}</p>
                            </div>
                            <div className="bg-zinc-50 p-3 rounded-lg border">
                                <p className="text-[10px] uppercase text-zinc-400 font-bold">Predicted</p>
                                <p className="text-lg font-semibold">{caseInfo?.predicted_hearings || "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Settlement Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <Users2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Relationship</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-400">Parties Relationship</p>
                            <p className="font-medium text-zinc-800">
                                {caseInfo?.relationship?.relationship }
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <Scale className="w-4 h-4" />
                            <span className="text-sm font-medium">Resolution Status</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-400">Settlement Type</p>
                            <p className="font-medium text-zinc-800">
                                {caseInfo?.settlement_type?.settlement_name || (
                                    <span className="text-zinc-400 italic text-sm font-normal">Case not yet settled</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Column 3: Priority/Severity */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Severity Level</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-400">Based on Nature of Complaint</p>
                            <p className={cn("text-lg uppercase tracking-tight")}>
                                {caseInfo?.case_type?.severity || '-'}
                            </p>
                        </div>
                    </div>
                    </div>

                    {/* Full Width Sections */}
                    <div className="mt-8 pt-6 border-t space-y-6">
                    
                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-zinc-900">Brief Description</h4>
                            <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-md italic border-l-4 border-zinc-300">
                            "{caseInfo?.description || 'No description provided.'}"
                            </p>
                        </div>

                        {/* Documents Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Supporting Documents
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {case_documents && case_documents.length > 0 ? (
                                    case_documents.map((doc, idx) => {

                                                const file = doc?.file
                                                    ? doc.file.startsWith("http")
                                                        ? doc.file
                                                        : `${BASE_URL}${doc.file}`
                                                    : "";

                                                if (!file) {
                                                    return <p key={idx}>No documents submitted</p>;
                                                }

                                                return file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                    <Button variant="outline" key={idx} onClick={(e) => {
                                                        e.preventDefault();
                                                        setViewImg(file);
                                                    }}>
                                                        <img
                                                            src={file}
                                                            alt={`Document ${idx + 1}`}
                                                            className="h-full object-contain"
                                                        />
                                                    </Button>

                                                ) : (
                                                    <Button
                                                        type="link"
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.open(file, '_blank');
                                                        }} variant="outline"
                                                        rel="noopener noreferrer"
                                                        className="border  py-2 px-4 rounded-lg flex items-center gap-2"
                                                    >
                                                        <FileText />
                                                        {doc.title || `Document ${idx + 1}`}
                                                    </Button>
                                                );
                                            })
                                ) : (
                                    <span className="text-sm text-zinc-400 italic">No documents submitted</span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="flex flex-col gap-4 bg-white p-4 rounded-md border shadow-2xs">
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
                            {caseInfo?.complainants?.map( c => (
                                
                                <TableRow key={c.id} className="border-t">
                                    <TableCell className="px-4 py-2">
                                        {userRole == 'admin' ? (
                                            <Link className="underline text-redBase" to={`/Admin/Case-Person/${c.id}`}>
                                                {c.first_name} {c.middle_name ? c.middle_name + ' ' : ''}{c.last_name}
                                            </Link>
                                        ) : `${c.first_name} ${c.middle_name ? c.middle_name + ' ' : ''}
                                        ${c.last_name}`}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">{c.contact_number || "-"}</TableCell>
                                    <TableCell>
                                        { (userInfo.email === c.email || userRole == 'admin' ) && (
                                            <EditCoAttendee co_attendees={caseInfo.complainants} type="complainant"
                                            attendeeInfo={c}
                                            case_id={caseInfo.id}
                                            update_caseInfo={refreshCaseData} />
                                        )}
                                    </TableCell>
                                </TableRow>
                                          
                            ))}
                            {caseInfo?.complainants.length == 0 && (
                                <TableRow>
                                    <TableCell className="px-4 py-2 text-center" colSpan={3}>No complainants added.</TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            
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
                            {caseInfo?.respondents?.map( c => (
                                
                                <TableRow key={c.id} className="border-t">
                                    <TableCell className="px-4 py-2">
                                        {userRole == 'admin' ? (
                                            <Link className="underline text-redBase" to={`/Admin/Case-Person/${c.id}`}>
                                                {c.first_name} {c.middle_name ? c.middle_name + ' ' : ''}{c.last_name}
                                            </Link>
                                        ) : `${c.first_name} ${c.middle_name ? c.middle_name + ' ' : ''}
                                        ${c.last_name}`}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">{c.contact_number || "-"}</TableCell>
                                    <TableCell>
                                        <EditCoAttendee co_attendees={caseInfo.respondents} type="respondent"
                                        attendeeInfo={c}
                                        case_id={caseInfo.id}
                                        update_caseInfo={refreshCaseData} />
                                    </TableCell>
                                </TableRow>
                                          
                            ))}
                            {caseInfo?.respondents.length == 0 && (
                                <TableRow>
                                    <TableCell className="px-4 py-2 text-center" colSpan={3}>No respondents added.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-white p-4 rounded-md shadow-2xs border">
                <h2 className="text-xl font-semibold">Hearings</h2>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left px-4 py-2">Hearing #</TableHead>
                                <TableHead className="text-left px-4 py-2">Date</TableHead>
                                <TableHead className="text-left px-4 py-2">Time</TableHead>
                                <TableHead className="text-left px-4 py-2">Status</TableHead>
                                <TableHead className="px-4 py-2"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {findHearingCase.length > 0 ? (
                                findHearingCase.map((hearing, index) => (
                                    <TableRow key={hearing.id} className="border-t">
                                        <TableCell className="px-4 py-2">
                                            {hearing?.hearing_number}

                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            {formatedDateToString(hearing.hearing_date)}
                                        </TableCell>
                                        <TableCell className="px-4 py-2">{hearing.time}</TableCell>
                                        <TableCell className="px-4 py-2"> <CaseStatusDisplay caseStatus={hearing.hearing_status} /></TableCell>
                                        <TableCell className={cn("py-4")}>
                                            <Link
                                                to={userRole === 'admin' ? `/Admin/Hearing/${hearing.id}` : `/${userLinkName}/Hearing/${hearing.id}`}
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
            
            {userRole === 'admin' && (
            <div className="flex flex-col gap-3 bg-white p-4 rounded-md shadow-2xs border">
                <h2 className="text-xl font-medium">Generate Documents</h2>
                <div className="flex flex-wrap gap-3 ">
                        {templates.map(doc => (
                             <button type="button" key={doc.name} className="border bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] " 
                             onClick={() => navigate(`/Admin/Generate-Docx/${case_number}?template_id=${doc.id}`)}>
                                <img src={docs} className="h-[150px]" />
                                <p className="text-redBase">{doc.name}</p>
                            </button>
                        ))}
                    
                </div>
            </div>
            ) }

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