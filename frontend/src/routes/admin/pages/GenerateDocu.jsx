import { Link } from "react-router-dom"
import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import appointment_form from "@/assets/imgs/appointment_form.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import { PageSync } from "@/components/PageSync"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function GenerateDocument() {
    // const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [generatedDoc, setGeneratedDoc] = useState(null);
    // const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     fetchTemplates();
    // }, []);

    // const fetchTemplates = async () => {
    //     try {
    //     const response = await axios.get(`${API_BASE_URL}/templates/`);
    //     setTemplates(response.data);
    //     } catch (error) {
    //     console.error('Error fetching templates:', error);
    //     }
    // };

    const handleTemplateSelect = async (template, template_id) => {
        setSelectedTemplate(template);
        setGeneratedDoc(null);

        // Initialize form data based on template type
        let initialFormData = {
            template_id: template_id,
            date_filed: new Date().toISOString().split('T')[0],
            respondent_name: 'Juan Dela Cruz',
            respondent_address: 'Tetuan, Zamboanga City',
            complainant_name: 'Maria Santos',
            nature_of_complaint: 'Property Dispute',
            case_number: 'BRGY-2025-001',
            hearing_date: '2025-11-15',
            time: '2:00 PM',
            lupon_member: 'Kagawad Juan Reyes'
            };

        // if (template === 'summon') {
        //     initialFormData = {
        //     date_filed: new Date().toISOString().split('T')[0],
        //     respondent_name: 'Juan Dela Cruz',
        //     respondent_address: 'Tetuan, Zamboanga City',
        //     complainant_name: 'Maria Santos',
        //     nature_of_complaint: 'Property Dispute',
        //     case_number: 'BRGY-2025-001',
        //     hearing_date: '2025-11-15',
        //     time: '2:00 PM',
        //     lupon_member: 'Kagawad Juan Reyes'
        //     };
        // }

        setFormData(initialFormData);
        console.log('Initial Form Data:', initialFormData);
        // Optional: Auto-generate right after selecting
            try {
                const response = await axios.post(
                `${API_BASE_URL}/templates/${template}/generate/`,
                {   
                    template_id: template_id,
                    data: initialFormData 
                }
                );
                setGeneratedDoc(response.data);

                // Optional: Auto-open print dialog
                printDocument(response.data);
            } catch (error) {
                console.error('Error generating document:', error);
                alert(error);
            }
        };

    // const handleInputChange = (e) => {
    //     setFormData({
    //     ...formData,
    //     [e.target.name]: e.target.value
    //     });
    // };

    // const generateDocument = async () => {
    //     if (!selectedTemplate) return;
        
    //     setLoading(true);
    //     try {
    //     const response = await axios.post(
    //         `${API_BASE_URL}/templates/${selectedTemplate.id}/generate/`,
    //         { data: formData }
    //     );
    //     setGeneratedDoc(response.data);
    //     } catch (error) {
    //     console.error('Error generating document:', error);
    //     alert('Error generating document. Please check all fields.');
    //     } finally {
    //     setLoading(false);
    //     }
    // };

    const printDocument = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
            <title>Print Document</title>
            <style>
                ${generatedDoc.css}
                @media print {
                @page { margin: 0.5in; }
                }
            </style>
            </head>
            <body>
            ${generatedDoc.html}
            <script>
                window.onload = function() {
                window.print();
                }
            </script>
            </body>
        </html>
        `);
        printWindow.document.close();
    };

    const generate = [
        {
            code: 'summon',
            title: "Summon Letter",
            img: summon_letter,
        },{
            code: 'monitoring',
            title: "Case Monitoring Sheet",
            img: case_monitoring,
        },{
            code: 'appointment',
            title: "Appointment Form",
            img: appointment_form,
        },{
            code: 'cancellation',
            title: "Cancellation Notice",
            img: cancellation_notice,
        },{
            code: 'file_court',
            title: "File Court Certification",
            img: file_court,
        },{
            code: 'no-show',
            title: "No Show Notice",
            img: no_show_notice,
        }
    ]
    return(
        <div className="flex flex-col gap-2 p-4">
            <PageSync page="Generate Documents" />
           <h1 className="text-2xl font-medium">Generate Documents</h1>
           <p className="text-zinc-700">Quickly produce official documents for any case.</p>
            <div className="flex flex-wrap gap-4 mt-2 ">
                {generate.map( (doc) =>
                    <button onClick={ () => handleTemplateSelect(doc.code, 2)} key={doc.title} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] ">
                        <img src={doc.img} className="h-[150px]" />
                        <p className="text-redBase">{doc.title}</p>
                    </button>
                )}
            </div> 
        </div>
        
    )
}