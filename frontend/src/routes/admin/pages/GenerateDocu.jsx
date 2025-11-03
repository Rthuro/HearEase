import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import appointment_form from "@/assets/imgs/appointment_form.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import { PageSync } from "@/components/PageSync"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCaseStore } from "@/store/useCaseStore"
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay"
import { Badge } from "@/components/ui/badge"
import useHearingStore from "@/store/useHearingStore"
import { useLuponStore } from "@/store/useLuponStore"

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function GenerateDocument() {
    const [templates, setTemplates] = useState([]);
    const [generatedDoc, setGeneratedDoc] = useState(null);
    const { cases } = useCaseStore();
    const [searchTerm, setSearchTerm] = useState("");
    const { hearings } = useHearingStore();
    const { members } = useLuponStore();
    const [ noShowUserData, setNoShowUserData ] = useState({});
    const [ noShowModal, setNoShowModal ] = useState(false);
    

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
        const response = await axios.get(`${API_BASE_URL}/document-templates/`);
        setTemplates(response.data);
        } catch (error) {
        console.error('Error fetching templates:', error);
        }
    };

    const filteredCase = cases.filter( c => c.case_type.case_name.toLowerCase().includes(searchTerm.toLowerCase()));
    console.log("Filtered Cases:", filteredCase);

    const handleTemplateSelect = async (case_data, template_name, template_id) => {
        setGeneratedDoc(null);

        let formData = {};
        const case_hearings = hearings.filter( h => h.case === case_data.id).sort((a, b) => new Date(b.create_at) - new Date(a.create_at) );
        const recentHearing = case_hearings[0];

        if (template_name === 'summon') {
            formData = {
                template_id: template_id,
                date_filed: new Date().toISOString().split('T')[0],
                respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
                respondent_address: case_data.respondent_user?.address || 'N/A',
                complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,
                nature_of_complaint: case_data.case_type.case_name,
                case_number: case_data.id,
                hearing_date: case_hearings[0]?.hearing_date || 'N/A',
                time: case_hearings[0]?.time || 'N/A',
                lupon_member: members.find(m => m.id === recentHearing.lupon_member)?.first_name +  ' ' + members.find(m => m.id === recentHearing.lupon_member)?.last_name || 'N/A',
                punong_barangay: 'Hon. Pedro Lopez',
            }
        } else if (template_name === 'monitoring') {
            const formatHearings = case_hearings.map( (h) => ({
                date: h.hearing_date,
                time: h.time,
                status: h.hearing_status,
                remarks: h.remarks,
            }));

            formData = {
                template_id: template_id,
                date_filed: new Date().toISOString().split('T')[0],
                respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
                complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,

                // need to add predicted hearing in case table
                predicted_hearings: 'N/A',
                case_number: case_data.id,
                lupon_member: members.find(m => m.id === recentHearing.lupon_member)?.first_name +  ' ' + members.find(m => m.id === recentHearing.lupon_member)?.last_name || 'N/A',

                // need to add remarks hearing in case table
                remarks: 'N/A',
                hearings: formatHearings,
                resolved: case_data.case_status === 'resolved' ? true : false,
                escalated: case_data.case_status === 'escalated' ? true : false,
                cancelled: case_data.case_status === 'cancelled' ? true : false,
                rejected: case_data.case_status === 'rejected' ? true : false,
            }
        } else if (template_name === 'cancellation') {
            formData = {
                template_id: template_id,
                date: new Date().toISOString().split('T')[0],
                respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
                complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,
                nature_of_complaint: case_data.case_type.case_name,
                case_number: case_data.id,
                hearing_date: case_hearings[0]?.hearing_date || 'N/A',
                time: case_hearings[0]?.time || 'N/A',
                lupon_member: members.find(m => m.id === recentHearing.lupon_member)?.first_name +  ' ' + members.find(m => m.id === recentHearing.lupon_member)?.last_name || 'N/A',
                punong_barangay: 'Hon. Pedro Lopez',
                lupon_secretary: 'Susan D.C. Cabato',
            }
        } else if (template_name === 'court') {
            formData = {
                template_id: template_id,
                respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
                complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,
                nature: case_data.case_type.case_name,
                case_number: case_data.id,
                month: new Date().toLocaleString('default', { month: 'long' }),
                day: new Date().getDate(),
                year: new Date().getFullYear(),
            }
        
        } else if (template_name === 'no-show'){
            const noShowUser = case_data.user;
            const userData = case_data.data;
            const no_show_name = noShowUser == "c" ? userData.complainant_user?.first_name + ' ' + userData.complainant_user?.last_name : userData.respondent_user?.first_name + ' ' + userData.respondent_user?.last_name;

            console.log(noShowUser, "No Show Name:", no_show_name, "complainant:", userData.complainant_user?.first_name, "respondent:", userData.respondent_user?.first_name);

            const no_show_address = noShowUser == "c" ? userData.complainant_user?.address || 'N/A' : userData.respondent_user?.address || 'N/A';

            formData = {
                template_id: template_id,
                date: new Date().toISOString().split('T')[0],
                name: no_show_name,
                address: no_show_address,
                case_number: userData.id,
                punong_barangay: 'Hon. Pedro Lopez',
            }
        } else if (template_name === 'appointment'){
            formData = {
                template_id: template_id,   
            }
        }

            try {
                const response = await axios.post(
                `${API_BASE_URL}/templates/${template_id}/generate/`,
                {   
                    template_id: template_id,
                    data: formData 
                }
                );

                setGeneratedDoc(response.data);

                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                    <title>Print Document</title>
                    <style>
                        ${response.data?.css}
                        @media print {
                        @page { margin: 0.5in; }
                        }
                    </style>
                    </head>
                    <body>
                    ${response.data?.html}
                    <script>
                        window.onload = function() {
                        window.print();
                        }
                    </script>
                    </body>
                </html>
                `);
                printWindow.document.close();
                
                setNoShowUserData({});
            } catch (error) {
                console.error('Error generating document:', error);
                alert(error);
            }
    };



    // const printDocument = () => {
        
    // };

    const generate = [
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
            code: 'appointment',
            title: "Appointment Form",
            img: appointment_form,
            template_id: templates.find( t => t.template_type === 'appointment')?.id,
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

    return(
        <div className="flex flex-col gap-2 p-4 relative">
            <PageSync page="Generate Documents" />
           <h1 className="text-2xl font-medium">Generate Documents</h1>
           <p className="text-zinc-700">Quickly produce official documents for any case.</p>
            <div className="flex flex-wrap gap-4 mt-2 ">
                {generate.map( (doc) =>
                   
                    <Dialog key={doc.code}>
                        <form>
                            {doc.code === 'appointment' ? (
                                <button type="button" key={doc.title} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] " onClick={() => handleTemplateSelect( "", doc.code, doc.template_id) }>
                                    <img src={doc.img} className="h-[150px]" />
                                    <p className="text-redBase">{doc.title}</p>
                                </button>
                            ) : (
                            <DialogTrigger asChild>
                                <button type="button" key={doc.title} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] ">
                                    <img src={doc.img} className="h-[150px]" />
                                    <p className="text-redBase">{doc.title}</p>
                                </button>
                            </DialogTrigger>
                            )}
                            
                            <DialogContent className="sm:max-w-[50%] sm:max-h-fit">
                            <DialogHeader>
                                <DialogTitle>Find case</DialogTitle>
                                <DialogDescription>
                                Search for case and filter through the list to select the appropriate case for generating the {doc.title}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col">
                                <div className="flex">
                                    <Input type="text" placeholder="Enter case ID" onChange={ (e) => setSearchTerm(e.target.value) } />

                                </div>
                                <div className="overflow-hidden my-2">
                                    <div className="flex flex-col gap-4 overflow-y-scroll h-[300px]">
                                        {filteredCase.map( (c) =>
                                            <button type="button" key={c.id} className="p-3 flex flex-col border rounded-lg hover:bg-zinc-50 text-left" 
                                            onClick={ () => {
                                                if (doc.code === 'no-show'){
                                                    setNoShowModal(true);
                                                    setNoShowUserData(c);
                                                    return;
                                                }
                                            
                                                handleTemplateSelect(c, doc.code, doc.template_id)
                                            }}>
                                                <div className="flex gap-2">
                                                    <Badge variant={c.is_active ? "outline" : "destructive"} className="mb-1">{ c.is_active ? "Active" : "Inactive" }</Badge>
                                                    <p className="text-zinc-800 text-sm font-medium">Case #{c.id}: {c.case_type.case_name}</p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="text-zinc-600 text-sm">Complainant: {c.complainant_user.first_name} {c.complainant_user.last_name}</p>
                                                    <CaseStatusDisplay caseStatus={c.case_status} />
                                                </div>

                                            </button>
                                        )}

                                        { noShowModal && (
                                        <div className="absolute z-10 top-0 right-0 bottom-0 left-0  flex flex-col items-center justify-center">
                                            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] border flex flex-col gap-3">
                                                <button className="self-end -mt-3 -mr-3" onClick={ () => setNoShowModal(false) }><X className="h-5" /></button>
                                                <p>Select if no show notice is for complainant or respondent.</p>
                                                <div className="flex flex-col gap-2">
                                                    <Button variant="default" className="bg-redBase hover:bg-redBase/80" onClick={ () => {
                                                        handleTemplateSelect({ data: noShowUserData, user: "c" }, doc.code, doc.template_id);
                                                        setNoShowModal(false);
                                                    } }>
                                                        Complainant
                                                    </Button>

                                                    <Button variant="default" className="bg-redBase hover:bg-redBase/80"  onClick={ () => {
                                                        handleTemplateSelect({ data: noShowUserData, user: "r" }, doc.code, doc.template_id);
                                                        setNoShowModal(false);
                                                    } }>
                                                        Respondent
                                                    </Button>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                                </DialogClose>
                            </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>
                    )}
            </div> 
        </div>
        
    )
}
