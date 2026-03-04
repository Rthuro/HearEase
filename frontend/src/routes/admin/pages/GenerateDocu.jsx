import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import docs from "@/assets/google-docs.png"
import { PageSync } from "@/components/PageSync"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { BadgeQuestionMark, FileText, X } from "lucide-react"
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
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore"
import useHearingStore from "@/store/useHearingStore"
import { useNavigate } from "react-router-dom";

export function GenerateDocument() {
    const { cases } = useCaseStore();
    const { hearings} = useHearingStore()
    const [searchTerm, setSearchTerm] = useState("");
    const [ noShowUserData, setNoShowUserData ] = useState({});
    const [ noShowModal, setNoShowModal ] = useState(false);
    const { templates, fetchTemplates, generateDocument} = useGenerateDocumentStore();
    const [loader, setLoader] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(templates.length === 0){
            setLoader(true);
            try {
                fetchTemplates();
            } catch (error) {
                console.log(error);
            } finally {
                setLoader(false);
            }
        }
    }, []);

    const handleTemplateSelect = async (case_data, template_name, template_id) => {
        try {
            const findHearingCase = hearings?.filter( hearing => hearing?.case == case_data.id)
            .sort((a, b) => a.hearing_number - b.hearing_number) || [] ;
            await generateDocument(case_data,findHearingCase, template_name, template_id);
        } catch (error) {
            console.log(error);
        }
    }

    const default_templates = [ "summon", "monitoring", "cancellation", "court", "no-show", "case_report" ];
    
    const [term, setTerm] = useState("all");

    const filterCases = (term) => {
        switch(term) {
            case 'summon':
                return cases.filter( c => c.summon_status === "pending" );
            case 'monitoring':
                return cases.filter( c => c.case_status !== "filed" && c.case_status !== "pending_approval" && c.case_status !== "rejected" );
            case 'cancellation':
                return cases.filter( c => c.case_status === "in_progress" );
            case 'court':
                return cases.filter( c => c.case_status === "escalated");
            case 'no-show':
                return cases.filter( c => c.case_status === "in_progress" );
            default:
                return cases;
        }
    }

    const filteredCase = filterCases(term)?.filter( c => c?.id.toLowerCase().includes(searchTerm.toLowerCase()));


    return(
        <div className="flex flex-col gap-2 p-4 relative">
            <PageSync page="Generate Documents" />

            
           <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-medium">Generate Documents</h1>
                    <p className="text-zinc-700">Quickly produce official documents for any case.</p>
                </div>
                <Button variant="outline" className="bg-white" onClick={ () => navigate("/Admin/Template-Editor")}>
                    <FileText />
                    Template Editor
                </Button>
           </div>

            <div className="flex flex-wrap gap-4 mt-2 ">
                {templates.map( (doc) =>
                    <Dialog key={doc.template_type}>
                        <form>
                            {doc.template_type === 'appointment' ? (
                                <button type="button" key={doc.name} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] " onClick={() => handleTemplateSelect( "", doc.code, doc.id) }>
                                    <img src={docs} className="h-[150px]" />
                                    <p className="text-redBase">{doc.name}</p>
                                </button>
                            ) : (
                            <DialogTrigger asChild>
                                <button type="button" key={doc.name} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] " onClick={ () => setTerm(doc.template_type)}>
                                    { default_templates.includes(doc.template_type) ? ( 
                                        <p className="text-gray-500 text-xs self-start tracking-wide bg-gray-100/80 rounded-full py-1 px-2 font-medium -mt-2 ">Default</p>
                                     ) : (
                                        <p className="text-redBase/70 text-xs self-start tracking-wide bg-red-100/80 rounded-full py-1 px-2 font-medium -mt-2 ">Custom</p>
                                     )}
                                    <img src={docs} className="h-[150px]" />
                                    <p className="text-redBase">{doc.name}</p>
                                </button>
                            </DialogTrigger>
                            )}
                            
                            <DialogContent className="sm:max-w-[50%] sm:max-h-fit">
                            <DialogHeader>
                                <DialogTitle>Find case</DialogTitle>
                                <DialogDescription>
                                Search for case and filter through the list to select the appropriate case for generating the {doc.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col">
                                <div className="flex">
                                    <Input type="text" placeholder="Enter case ID" onChange={ (e) => setSearchTerm(e.target.value) } />

                                </div>
                                <div className="overflow-hidden my-2">
                                    <div className="flex flex-col gap-4 px-3 overflow-y-scroll max-h-[300px]">
                                        <button type="button" className="p-3 my-2 flex items-center gap-2 border border-red-300 rounded-lg bg-red-50 text-left text-redBase font-medium" 
                                            onClick={ () => {
                                                navigate(`/Admin/Generate-Docx?template_id=${doc.id}`);
                                            }}>
                                            <FileText size={20} />
                                            Generate Blank Template
                                        </button>
                                        {filteredCase.map( (c) =>
                                            <button type="button" key={c.id} className="p-3 flex item justify-between border rounded-lg hover:bg-zinc-50 text-left" 
                                            onClick={ () => {
                                                if (doc.template_type === 'no-show'){
                                                    setNoShowModal(true);
                                                    setNoShowUserData(c);
                                                    return;
                                                }
                                            
                                                navigate(`/Admin/Generate-Docx/${c.id}?template_id=${doc.id}`);
                                            }}>
                                                <div className="flex flex-col">
                                                    <div className="flex gap-2">
                                                        <Badge variant={c.is_active ? "outline" : "destructive"} className="mb-1">{ c.is_active ? "Active" : "Inactive" }</Badge>
                                                        <p className="text-zinc-800 text-sm font-medium">{c.id}: {c.case_type.case_name}</p>
                                                    </div>
                                                     <p className="text-zinc-600 text-xs">Complainants:
                                                         {' '} 
                                                        {c?.complainants.length > 0 && (
                                                            <>
                                                                {c?.complainants.map( (p, index) => (
                                                                    <span key={p.id}>
                                                                        {p.first_name} {p.last_name}{index < c.complainants.length - 1 ? ", " : ""}
                                                                    </span>
                                                                ))}
                                                            </>
                                                        )}

                                                    </p>
                                                </div>
                                                <CaseStatusDisplay caseStatus={c.case_status} />

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
                
                { templates.length === 0 && (
                    <div className="flex flex-col gap-2 items-center justify-center p-6 w-full mt-5">
                        <BadgeQuestionMark size={32} className=" text-gray-500" />
                        <p className="text-gray-500">No templates available.</p>
                    </div>
                )}
                {/* {templates.filter(t => !generate.some(tt => tt.code === t.template_type)).map( t =>
                    <button type="button" key={t.id} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] " onClick={() => handleTemplateSelect( "", t.template_type, t.id) }>
                        <p className="text-redBase/70 text-xs self-start tracking-wide bg-red-100/80 rounded-full py-1 px-2 font-medium -mt-2 ">Custom</p>
                        <FileText className="h-[150px] text-gray-300" />
                        <p className="text-redBase">{t.name}</p>
                    </button>
                )} */}
            </div> 
        </div>
        
    )
}
