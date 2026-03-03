import { useCaseStore } from "@/store/useCaseStore"
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom"
import { ChevronLeft, RotateCw, FileText, RefreshCw, Printer} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore";
import { PreviewDocx } from "@/components/PreviewDocx";
import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { renderAsync } from "docx-preview"; 
import useHearingStore from "@/store/useHearingStore";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export function GenerateDocx() {
    const { case_id } = useParams();
    const [searchParams] = useSearchParams();
    const template_id = searchParams.get('template_id');
    const previewContainerRef = useRef(null);
    
    const navigate = useNavigate();

    const { templates, fetchTemplateInfo, createDocument } = useGenerateDocumentStore();
    const { cases } = useCaseStore();
    const { hearings } = useHearingStore();

    const caseHearings = hearings.filter(h => h.case_number === case_id);

    const [templateInfo, setTemplateInfo] = useState(null);
    const currentCase = cases.find(c => c.id === case_id);
    const template = templates.find(t => t.id === parseInt(template_id));

    // console.log("Current Hearings:", currentCase);
    const [previewBlob, setPreviewBlob] = useState(null); 

    // place holder state
    const [formData, setFormData] = useState({
        case_number: case_id || '',
        nature_of_complaint: currentCase?.case_type.case_name || '',
        severity: currentCase?.severity || '',
        case_status: currentCase?.case_status || '',
        cfa_destination: currentCase?.cfa?.cfa || '',
        case_completed: currentCase?.case_completed?.split('T')[0] || '',
        approved_case_date: currentCase?.approved_case_date?.split('T')[0] || '',
        rejected_case_date: currentCase?.rejected_case_date?.split('T')[0] || '',
        date_filed: currentCase?.date_filed.split('T')[0] || '',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        month: new Date().toLocaleDateString('en-US', { month: 'long' }),
        day: new Date().toLocaleDateString('en-US', { day: 'numeric' }),
        year: new Date().getFullYear(),
        complainants: currentCase?.complainants.map(c => c.first_name + ' ' + c.last_name).join(', ') || '',
        respondents: currentCase?.respondents.map(r => r.first_name + ' ' + r.last_name).join(', ') || '',
        name: '',
        address: '',
        punong_barangay: 'Hon. Pedro Lopez',
        lupon_member: '',
        lupon_secretary: 'Susan D.C. Cabato',
        hearings: caseHearings,
        hearing_date: '',
        time: '',
        remarks: '',
        summon_hearing_date: caseHearings.find( h => h.hearing_number === 1)?.hearing_date.split('T')[0] || '',
        summon_hearing_time: caseHearings.find( h => h.hearing_number === 1)?.time || '',
        summon_hearing_lupon: caseHearings.find( h => h.hearing_number === 1)?.lupon_member_name || '',
    });

    useEffect(() => {
        if (template_id) {
            fetchTemplateInfo(template_id).then(info => setTemplateInfo(info));
        }
    }, [template_id, fetchTemplateInfo]);

    const generatePreview = async () => {

        try {

            if(template.template_type === "monitoring") {
                const displayHearings = {};

                caseHearings.forEach(h => {
                    displayHearings[`hearing_date_${h.hearing_number}`] = format(new Date(h.hearing_date), 'MMMM dd,yyyy');
                    displayHearings[`hearing_time_${h.hearing_number}`] = h.time;
                    displayHearings[`hearing_status_${h.hearing_number}`] = h.hearing_status;
                    displayHearings[`hearing_remarks_${h.hearing_number}`] = h.remarks;
                });
                
                setFormData({
                    ...formData,
                    ...displayHearings
                })
            }

            const res = await createDocument(template_id, {
                ...formData,
                date_filed: format(new Date(currentCase?.date_filed), 'MMMM dd,yyyy'),
                case_completed: currentCase?.case_completed ? format(new Date(currentCase.case_completed), 'MMMM dd,yyyy') : '',
                approved_case_date: currentCase?.approved_case_date ? format(new Date(currentCase.approved_case_date), 'MMMM dd,yyyy') : '',
                rejected_case_date: currentCase?.rejected_case_date ? format(new Date(currentCase.rejected_case_date), 'MMMM dd,yyyy') : '',
                summon_hearing_date: formData.summon_hearing_date ? format(new Date(formData.summon_hearing_date), 'MMMM dd,yyyy') : '',
            });

            
            setPreviewBlob(res);
            previewContainerRef.current.innerHTML = "";
            await renderAsync(res, previewContainerRef.current);
            
            toast.success("Preview Updated", { id: 'preview-toast' });
        } catch (error) {
            console.error(error);
            toast.error("Template rendering error. Check your tags.");
        } 
    };

    const resetInputs = () => {
        setFormData({
            case_number: case_id || '',
            nature_of_complaint: currentCase?.case_type.case_name || '',
            severity: currentCase?.severity || '',
            case_status: currentCase?.case_status || '',
            cfa_destination: currentCase?.cfa_destination || '',
            case_completed: currentCase?.case_completed?.split('T')[0] || '',
            approved_case_date: currentCase?.approved_case_date?.split('T')[0] || '',
            rejected_case_date: currentCase?.rejected_case_date?.split('T')[0] || '',
            date_filed: currentCase?.date_filed.split('T')[0] || '',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            month: new Date().toLocaleDateString('en-US', { month: 'long' }),
            year: new Date().getFullYear(),
            complainants: currentCase?.complainants.map(c => c.first_name + ' ' + c.last_name).join(', ') || '',
            respondents: currentCase?.respondents.map(r => r.first_name + ' ' + r.last_name).join(', ') || '',
            name: '',
            address: '',
            punong_barangay: 'Hon. Pedro Lopez',
            lupon_member: '',
            lupon_secretary: 'Susan D.C. Cabato',
            hearings: caseHearings,
            hearing_date: '',
            time: '',
            remarks: '',
            summon_hearing_date: caseHearings.find( h => h.hearing_number === 1)?.hearing_date.split('T')[0] || '',
            summon_hearing_time: caseHearings.find( h => h.hearing_number === 1)?.hearing_time || '',
            summon_hearing_lupon: caseHearings.find( h => h.hearing_number === 1)?.lupon?.map(m => m.first_name + ' ' + m.last_name).join(', ') || '',

        });
        previewContainerRef.current.innerHTML = "";
    }

    const printDocument = () => {
        if (!previewBlob) {
            toast.error("No document to print. Please generate a preview first.");
            return;
        }
        const url = window.URL.createObjectURL(previewBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `document_${template_id}.docx`);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
    }

    return (
        <div className="p-4 bg-white flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="font-semibold text-lg">Generate Document for <Link to={`/Admin/Case/${currentCase?.id}`} className="text-redBase underline">{currentCase?.id}</Link></h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button className=" hover:bg-gray-200 text-gray-700 bg-white"
                        onClick={resetInputs}>
                        <RotateCw className="w-4 h-4" />
                        Reset
                    </Button>
                    <Button className="bg-redBase hover:bg-redBase/70 text-white" onClick={printDocument}>
                        <Printer className="w-4 h-4" />
                        Print Docx
                    </Button>
                    
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col p-4">
                <h2 className="font-semibold text-gray-900">
                    Template: <span className="text-red-600">{template?.name || "N/A"}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Placeholders:</span>
                    {templateInfo?.placeholders?.map((p) => (
                        <span key={p} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md border border-gray-200">
                            {p}
                        </span>
                    ))}
                </div>
                <div className="bg-gray-50 p-4 rounded shadow-sm border border-gray-200 space-y-4 grid grid-cols-3 mt-3 gap-2">
                    { templateInfo?.placeholders.length > 0 && templateInfo?.placeholders.map((placeholder) => (
                        (placeholder == 'case_number' || placeholder == 'nature_of_complaint' || placeholder == 'case_status' || placeholder == 'cfa_destination' || placeholder == 'summon_hearing_lupon' || placeholder == 'punong_barangay' || placeholder == 'lupon_secretary'  || placeholder == 'complainants' || placeholder == 'respondents') && (
                            <div key={placeholder.id}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Input 
                                    type="text" 
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>
                        ) || 
                        placeholder == 'severity' && (
                            <div key={placeholder.id}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Input 
                                    type="number" 
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>
                        ) || 
                        (placeholder == 'date_filed' || placeholder == 'case_completed' || placeholder == 'approved_case_date' || placeholder == 'rejected_case_date' || placeholder == 'summon_hearing_date') && (
                            <div key={placeholder.id}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Input 
                                    type="date" 
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>
                        ) ||
                        placeholder == 'summon_hearing_time' && (
                            <div key={placeholder.id}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Input 
                                    type="time" 
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>
                        ) ||
                        placeholder == 'remarks' && (
                            <div key={placeholder.id} className="col-span-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Textarea 
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>  
                        )
                    ))}
                </div>
                <Button onClick={generatePreview} className="self-start mt-3 bg-redBase text-white hover:bg-redBase/80 w-full py-5">
                    <RefreshCw className="w-4 h-4" />
                    Render Template
                </Button>
            </div>
           
            <PreviewDocx blob={previewBlob} blobRef={previewContainerRef} />
        </div>
    )
}