import axios from 'axios';
import { create } from "zustand";
import useHearingStore from './useHearingStore';
import { useLuponStore } from './useLuponStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
const { hearings } = useHearingStore.getState();
const { members } = useLuponStore.getState();


export const useGenerateDocumentStore = create((set) => ({
    templates: [],
    fetchTemplates: async () => {
        try {
            const response = await axios.get(`${API_URL}/document-templates/`);
            set({ templates: response.data})
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    },

    generateDocument: async (case_data, template_name, template_id) => {

        let formData = {};
        const case_hearings = hearings.filter( h => h.case === case_data.id).sort((a, b) => new Date(b.create_at) - new Date(a.create_at) );
        const recentHearing = case_hearings[0];

        switch (template_name) {
            case 'summon':
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
                break;
            case 'monitoring':
                {
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

                        predicted_hearings: case_data.predicted_hearings,
                        case_number: case_data.id,
                        lupon_member: members.find(m => m.id === recentHearing.lupon_member)?.first_name +  ' ' + members.find(m => m.id === recentHearing.lupon_member)?.last_name || 'N/A',

                        remarks: case_data.remarks,
                        hearings: formatHearings,
                        resolved: case_data.case_status === 'resolved' ? true : false,
                        escalated: case_data.case_status === 'escalated' ? true : false,
                        cancelled: case_data.case_status === 'cancelled' ? true : false,
                        rejected: case_data.case_status === 'rejected' ? true : false,
                    }
                    break;
                }
            case 'cancellation':
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
                break;
            case 'court':
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
                break;
            case 'no-show':
                {
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
                    break;
                }
            default:
                toast.error('Invalid template name provided.');
                return;
        }

        // if (template_name === 'summon') {
        //     formData = {
        //         template_id: template_id,
        //         date_filed: new Date().toISOString().split('T')[0],
        //         respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
        //         respondent_address: case_data.respondent_user?.address || 'N/A',
        //         complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,
        //         nature_of_complaint: case_data.case_type.case_name,
        //         case_number: case_data.id,
        //         hearing_date: case_hearings[0]?.hearing_date || 'N/A',
        //         time: case_hearings[0]?.time || 'N/A',
        //         lupon_member: members.find(m => m.id === recentHearing.lupon_member)?.first_name +  ' ' + members.find(m => m.id === recentHearing.lupon_member)?.last_name || 'N/A',
        //         punong_barangay: 'Hon. Pedro Lopez',
        //     }
        // } else if (template_name === 'monitoring') {
        //     const formatHearings = case_hearings.map( (h) => ({
        //         date: h.hearing_date,
        //         time: h.time,
        //         status: h.hearing_status,
        //         remarks: h.remarks,
        //     }));

        //     formData = {
        //         template_id: template_id,
        //         date_filed: new Date().toISOString().split('T')[0],
        //         respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
        //         complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,

        //         predicted_hearings: case_data.predicted_hearings,
        //         case_number: case_data.id,
        //         lupon_member: members.find(m => m.id === recentHearing.lupon_member)?.first_name +  ' ' + members.find(m => m.id === recentHearing.lupon_member)?.last_name || 'N/A',

        //         remarks: case_data.remarks,
        //         hearings: formatHearings,
        //         resolved: case_data.case_status === 'resolved' ? true : false,
        //         escalated: case_data.case_status === 'escalated' ? true : false,
        //         cancelled: case_data.case_status === 'cancelled' ? true : false,
        //         rejected: case_data.case_status === 'rejected' ? true : false,
        //     }
        // } else if (template_name === 'cancellation') {
        //     formData = {
        //         template_id: template_id,
        //         date: new Date().toISOString().split('T')[0],
        //         respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
        //         complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,
        //         nature_of_complaint: case_data.case_type.case_name,
        //         case_number: case_data.id,
        //         hearing_date: case_hearings[0]?.hearing_date || 'N/A',
        //         time: case_hearings[0]?.time || 'N/A',
        //         lupon_member: members.find(m => m.id === recentHearing.lupon_member)?.first_name +  ' ' + members.find(m => m.id === recentHearing.lupon_member)?.last_name || 'N/A',
        //         punong_barangay: 'Hon. Pedro Lopez',
        //         lupon_secretary: 'Susan D.C. Cabato',
        //     }
        // } else if (template_name === 'court') {
        //     formData = {
        //         template_id: template_id,
        //         respondent_name: case_data.respondent_user?.first_name + ' ' + case_data.respondent_user?.last_name,
        //         complainant_name: case_data.complainant_user?.first_name + ' ' + case_data.complainant_user?.last_name,
        //         nature: case_data.case_type.case_name,
        //         case_number: case_data.id,
        //         month: new Date().toLocaleString('default', { month: 'long' }),
        //         day: new Date().getDate(),
        //         year: new Date().getFullYear(),
        //     }
        
        // } else if (template_name === 'no-show'){
        //     const noShowUser = case_data.user;
        //     const userData = case_data.data;
        //     const no_show_name = noShowUser == "c" ? userData.complainant_user?.first_name + ' ' + userData.complainant_user?.last_name : userData.respondent_user?.first_name + ' ' + userData.respondent_user?.last_name;

        //     console.log(noShowUser, "No Show Name:", no_show_name, "complainant:", userData.complainant_user?.first_name, "respondent:", userData.respondent_user?.first_name);

        //     const no_show_address = noShowUser == "c" ? userData.complainant_user?.address || 'N/A' : userData.respondent_user?.address || 'N/A';

        //     formData = {
        //         template_id: template_id,
        //         date: new Date().toISOString().split('T')[0],
        //         name: no_show_name,
        //         address: no_show_address,
        //         case_number: userData.id,
        //         punong_barangay: 'Hon. Pedro Lopez',
        //     }
        // } else if (template_name === 'appointment'){
        //     formData = {
        //         template_id: template_id,   
        //     }
        // }

            try {
                const response = await axios.post(
                `${API_URL}/templates/${template_id}/generate/`,
                {   
                    template_id: template_id,
                    data: formData 
                }
                );

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
                
            } catch (error) {
                toast.error('Error generating document:', error)
            }
    }
})) 