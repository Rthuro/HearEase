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
import { Separator } from "@/components/ui/separator";
import { format, isValid } from 'date-fns';

const safeFormat = (dateValue, formatStr = 'MMMM dd, yyyy') => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatStr) : ''; 
};

export function GenerateDocx() {
    const { case_id } = useParams();
    const [searchParams] = useSearchParams();
    const template_id = searchParams.get('template_id');
    const previewContainerRef = useRef(null);
    
    const navigate = useNavigate();

    const { templates, fetchTemplateInfo, createDocument } = useGenerateDocumentStore();
    const { cases } = useCaseStore();
    const { hearings } = useHearingStore();

    const caseHearings = hearings.filter(h => h.case_number === case_id) || null;

    const [templateInfo, setTemplateInfo] = useState(null);
    const currentCase = cases.find(c => c.id === case_id) || null;
    const template = templates.find(t => t.id === parseInt(template_id));

    // console.log("Current Hearings:", currentCase);
    const [previewBlob, setPreviewBlob] = useState(null); 

    // place holder state
    const [formData, setFormData] = useState({
        case_number: case_id ? case_id : '',
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
        hearing_date: null,
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

                caseHearings?.forEach(h => {
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
                date_filed: safeFormat(formData?.date_filed),
                case_completed: safeFormat(formData?.case_completed),
                approved_case_date: safeFormat(formData?.approved_case_date),
                rejected_case_date: safeFormat(formData?.rejected_case_date),
                summon_hearing_date: safeFormat(formData?.summon_hearing_date),
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

    const placeholders = templateInfo?.placeholders || [];

    const def_placeholders = placeholders.filter( p => Object.keys(formData).includes(p) );
    const not_in_form_placeholders = placeholders.filter(p => !def_placeholders.includes(p));

    const num_placeholders = def_placeholders.filter(p => p == 'severity');
    const time_placeholders = def_placeholders.filter(p => p?.includes('time'));
    const date_placeholders = def_placeholders.filter(p => p?.includes('date'));
    const textArea_placeholders = def_placeholders.filter(p => p?.includes('remarks') || p == 'complainants' || p == 'respondents' );

    const text_placeholders = def_placeholders.filter(p => !num_placeholders.includes(p) && !time_placeholders.includes(p) && !date_placeholders.includes(p) && !textArea_placeholders.includes(p));



    return (
        <div className="p-4 bg-white flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="font-semibold text-lg">Generate Document 
                        { currentCase && (<Link to={`/Admin/Case/${currentCase?.id}`} className="text-redBase underline ml-2">{currentCase?.id}</Link>)}
                        </h1>
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
                    Template: <span className="text-red-600">{
                        <Link to={`/Admin/Generate-Docx?template_id=${template_id}`} className="text-redBase underline ml-2">{template.name}</Link>}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Placeholders:</span>
                    {placeholders?.map((p) => (
                        <span key={p} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md border border-gray-200">
                            {p}
                        </span>
                    ))}
                </div>
                <div className="bg-gray-50 p-4 rounded shadow-sm border border-gray-200 space-y-4 grid grid-cols-3 mt-3 gap-2">
                    { num_placeholders.length > 0 && num_placeholders.map((placeholder) => (
                        <div key={placeholder}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Input 
                                    type="number" 
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>
                    ))}

                    { date_placeholders.length > 0 && date_placeholders.map((placeholder) => (
                        <div key={placeholder}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                            <Input
                                type="date"
                                className="bg-white"
                                value={formData[placeholder] || ''}
                                onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                            />
                        </div>
                    ))}

                    { time_placeholders.length > 0 && time_placeholders.map((placeholder) => ( 
                        <div key={placeholder}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                            <Input 
                                type="time" 
                                className="bg-white"
                                value={formData[placeholder] || ''}
                                onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                            />
                        </div>

                    ))}
                    

                    { text_placeholders.length > 0 && text_placeholders
                        .map((placeholder) => (
                            <div key={placeholder} className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Input 
                                    type="text"
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>  
                        ))
                    }

                    {textArea_placeholders.length > 0 && textArea_placeholders
                        .map((placeholder) => (
                            <div key={placeholder} className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Textarea 
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>  
                        ))
                    }

                    { not_in_form_placeholders.length > 0 && (
                        <div className="col-span-full">
                            <p className="text-sm  font-semibold text-redBase">
                                Not a default placeholders
                            </p>
                            <Separator className="my-2 " />
                        </div>

                    )}

                    { not_in_form_placeholders.length > 0 && not_in_form_placeholders.map((placeholder) => (
                            <div key={placeholder}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{placeholder}</label>
                                <Input 
                                    type="text"
                                    className="bg-white"
                                    value={formData[placeholder] || ''}
                                    onChange={(e) => setFormData({...formData, [placeholder]: e.target.value})}
                                />
                            </div>
                        ))
                    }

                    
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