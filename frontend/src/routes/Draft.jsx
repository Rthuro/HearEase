import { useCaseStore } from "@/store/useCaseStore";
import { PageSync } from "@/components/PageSync"
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import useCaseDocumentsStore from "@/store/useCaseDocumentStore";

export function Draft(){
    const { setCaseInfo, cases, setFormData, set_respondents, set_complainants } = useCaseStore();
    const { userInfo, userLinkName } = useAuthenticationStore();
    const { fetchCaseDocuments } = useCaseDocumentsStore();
    
    const navigateTo = userInfo?.role === 'user' ? userLinkName : 'Admin';

    const filedCases = cases?.filter(c => c.case_status == 'filed' && c.create_by == userInfo?.role);
    const navigate = useNavigate();


    const handleEdit = (caseInfo) => {
        
        fetchCaseDocuments(caseInfo.id).then(data => {
            if (data) {
                setFormData("caseDetails", "documents", data.map(doc => ({
                    id: doc.id,
                    name: doc.title,
                    file: doc.file
                })));
            }
        });
        setCaseInfo({
            case_number: caseInfo.id,
        });
        setFormData("caseDetails", "nature_of_complaint_code", caseInfo.case_type.id);
        setFormData("caseDetails", "severity", caseInfo.case_type.severity);
        setFormData("caseDetails", "relationship", caseInfo.relationship.relationship);
        setFormData("caseDetails", "description", caseInfo.description);
        setFormData("caseDetails", "case_status", caseInfo.case_status);
        set_complainants(caseInfo.complainants);
        set_respondents(caseInfo.respondents);
        
        navigate(`/${navigateTo}/File-Case/${caseInfo.id}`);
    }
    
    return (
        <div className="p-6 flex flex-col gap-2">
            <PageSync page="Drafts" />
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Your Drafts</h1>
                <p>You have <span className="font-medium text-redBase">{filedCases?.length || 0}</span> case drafts created.</p>
            </div>
            <div className="border rounded-lg overflow-hidden max-w-5xl bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Case #</TableHead>
                                    <TableHead>Nature of Complaint</TableHead>
                                    <TableHead>Relationship</TableHead>
                                    <TableHead>Complainants</TableHead>
                                    <TableHead>Respondents</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filedCases?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <p className="text-center">No draft cases made.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filedCases?.map((c) => (
                                        <TableRow key={c.id} className={cn("text-zinc-700")}>
                                            <TableCell>{c.id}</TableCell>
                                            <TableCell>{c.case_type.case_name}</TableCell>
                                            <TableCell>{c.relationship.relationship}</TableCell>
                                            <TableCell>
                                                {c.complainants.length > 1 ? `${c.complainants[0].first_name} ${c.complainants[0].last_name} and ${c.complainants.length - 1} others` 
                                                : 
                                                `${c.complainants[0].first_name} ${c.complainants[0].last_name}`}
                                            </TableCell>
                                            <TableCell>
                                                {c.respondents.length > 1 ? `${c.respondents[0].first_name} ${c.respondents[0].last_name} and ${c.respondents.length - 1} others` 
                                                : 
                                                `${c.respondents[0].first_name} ${c.respondents[0].last_name}`}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                </div>
        </div>
    )
}