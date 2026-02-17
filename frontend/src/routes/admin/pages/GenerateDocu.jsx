import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import { PageSync } from "@/components/PageSync"
import React, { useState, useEffect } from 'react';
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
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore"
import useHearingStore from "@/store/useHearingStore"

export function GenerateDocument() {
    const { cases } = useCaseStore();
    const { hearings} = useHearingStore()
    const [searchTerm, setSearchTerm] = useState("");
    const [ noShowUserData, setNoShowUserData ] = useState({});
    const [ noShowModal, setNoShowModal ] = useState(false);
    const { templates, fetchTemplates, generateDocument} = useGenerateDocumentStore();
    const [loader, setLoader] = useState(false);

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
            code: 'cancellation',
            title: "Cancellation Notice",
            img: cancellation_notice,
            template_id: templates.find( t => t.template_type === 'cancellation')?.id,
        },{
            code: 'court',
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

    const [term, setTerm] = useState("all");

    const filterCases = (term) => {
        switch(term) {
            case 'summon':
                return cases.filter( c => c.summon_status === "pending" && c.case_status !== "filed" && c.case_status !== "rejected" && c.case_status !== "archived" );
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
           <h1 className="text-2xl font-medium">Generate Documents</h1>
           <p className="text-zinc-700">Quickly produce official documents for any case.</p>
           
           { loader && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redBase">
                    
                </div>
            </div>)}

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
                                <button type="button" key={doc.title} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] " onClick={ () => setTerm(doc.code)}>
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
                                    <div className="flex flex-col gap-4 overflow-y-scroll max-h-[300px]">
                                        {filteredCase.map( (c) =>
                                            <button type="button" key={c.id} className="p-3 flex item justify-between border rounded-lg hover:bg-zinc-50 text-left" 
                                            onClick={ () => {
                                                if (doc.code === 'no-show'){
                                                    setNoShowModal(true);
                                                    setNoShowUserData(c);
                                                    return;
                                                }
                                            
                                                handleTemplateSelect(c, doc.code, doc.template_id)
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
            </div> 
        </div>
        
    )
}
