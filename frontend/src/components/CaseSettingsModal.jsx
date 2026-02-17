import { useState, useEffect } from "react";
import { 
  Trash2, 
  Settings, 
  FileText, 
  Printer, 
  Archive, 
  CheckCircle, 
  Bell, 
  Pencil, 
  AlertTriangle ,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input"; 
import { useCaseStore } from "@/store/useCaseStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGenerateDocumentStore } from "@/store/useGenerateDocumentStore";

export function CaseSettingsModal({ role, caseData, hearings}) {
  const {deleteCase, updateCaseInfo} = useCaseStore();
  const { templates, fetchTemplates, generateDocument} = useGenerateDocumentStore();

  const [open, setOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  // Placeholder handlers
  const handlePrint = () => window.print();


  // Secure Delete Logic
  const handleDelete = () => {
    toast.promise(deleteCase(caseData.id , 'delete'), {
      loading: 'Deleting case...',
      success: () => {
        setOpen(false);
        navigate(-1);
        return 'Case deleted successfully!';
      },
      error: 'Error deleting case.',
    });
  };

  const handleTemplateSelect = async (case_data, template_name) => {
        if(templates.length === 0){
              setLoader(true);
              try {
                  await fetchTemplates();
              } catch (error) {
                return toast.error("Error fetching templates. Please try again.");
              } finally {
                  setLoader(false);
              }
          }

        const template_id = templates.find(t => t.template_type === template_name)?.id;  

        try {
            const findHearingCase = hearings?.filter( hearing => hearing?.case == case_data.id)
            .sort((a, b) => a.hearing_number - b.hearing_number) || [] ;

            toast.promise( generateDocument(case_data,findHearingCase, template_name, template_id), {
                loading: 'Generating document...',
                success: 'Document generated successfully!',
                error: 'Error generating document.',
            })

        } catch (error) {
            toast.error("Error generating document. Please try again.");
        }
    }

  const handleCancelCase = async () => {
    setLoader(true);
    let  updateData = null;
    if( caseData.summon_status !=='served'){
      updateData = { case_status: 'archived'};
    }
    if(caseData.summon_status =='served'){
      updateData = { case_status: 'resolved', remarks: 'Settled outside Katarungang Pambarangay Jurisdiction' };
    }
    await updateCaseInfo(updateData, 'case', caseData.id);
    navigate(-1);
    toast.success("Case cancelled successfully");
    setLoader(false);
  };

  const handleWithdrawCase = async () => {
      setLoader(true);
      await deleteCase(caseData.id, 'withdraw');
      navigate(-1);
      setLoader(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Case Settings</DialogTitle>
          <DialogDescription>
            Manage settings, status, and documents for {caseData?.id || "000"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4 overflow-y-auto max-h-[70vh]">

          {/* Section 2: Documents & Exports */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Documents</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto py-3 px-4" onClick={() => handleTemplateSelect(caseData, 'case_report')}>
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Export PDF</span>
                  <span className="text-[10px] text-muted-foreground">Download case report</span>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-3 px-4" 
              onClick={() => handleTemplateSelect(caseData, 'monitoring')}>
                <Printer className="h-4 w-4 mr-2 text-gray-500" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Print Record</span>
                  <span className="text-[10px] text-muted-foreground">Print summary view</span>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Section 3: Case Management */}
          {/* { role == 'admin' && (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Management</h4>
                
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start w-full" onClick={handleResolve}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Mark as Resolved / Closed
                    </Button>
                    <Button variant="ghost" className="justify-start w-full" onClick={handleArchive}>
                        <Archive className="h-4 w-4 mr-2 text-orange-600" />
                        Archive Case (Hide from active list)
                    </Button>
                </div>
              </div>
              <Separator />
            </>
          
          )} */}
          


          {/* Section 4: Danger Zone (Delete) */}
          
            { role !== 'admin' && caseData?.case_status == 'approved' && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-900">Danger Zone</h4>
                        <p className="text-xs text-red-700">Irreversible actions regarding this case.
                          {caseData.summon_status !== 'served' ? " Cancelling will archive the case and remove it from active lists." : " Cancelling will mark the case as resolved with a remark of 'Settled outside Katarungang Pambarangay Jurisdiction'."}
                        </p>
                    </div>
                </div>
                <Button 
                    variant="destructive" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleCancelCase}
                    disabled={loader}
                >
                  {loader ? (
                    <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling Case
                    </>
                  ) : (
                    <>
                    <Trash2 className="h-4 w-4" />
                    Cancel Case
                    </>
                  )}
                    
                </Button>
              </div>
            )}

            { role !== 'admin' && caseData?.case_status == 'pending_approval' && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-900">Danger Zone</h4>
                        <p className="text-xs text-red-700">Irreversible actions regarding this case. This will remove the case from the system permanently.</p>
                    </div>
                </div>
                <Button 
                      variant="destructive" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={handleWithdrawCase}
                      disabled={loader}
                  >
                    {loader ? (
                      <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Withdrawing your case...
                      </>
                    ) : (
                      <>
                      <Trash2 className="h-4 w-4" />
                      Withdraw Case
                      </>
                    )}
                      
                  </Button>
              </div>
            )}

            {role === 'admin' ? 
                !showDeleteConfirm ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-100 text-red-600 rounded-full">
                              <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-red-900">Danger Zone</h4>
                              <p className="text-xs text-red-700">Irreversible actions regarding this case.</p>
                          </div>
                      </div>
                      <Button 
                          variant="destructive" 
                          className="w-full bg-red-600 hover:bg-red-700"
                          onClick={() => setShowDeleteConfirm(true)}
                      >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Case Permanently
                      </Button>
                </div>
            ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-100 text-red-600 rounded-full">
                              <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-red-900">Danger Zone</h4>
                              <p className="text-xs text-red-700">Irreversible actions regarding this case.</p>
                          </div>
                      </div>
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                          <Label className="text-xs font-bold text-red-800">
                              Type "DELETE" to confirm
                          </Label>
                          <div className="flex gap-2">
                              <Input 
                                  value={deleteInput}
                                  onChange={(e) => setDeleteInput(e.target.value)}
                                  className="bg-white border-red-300 focus-visible:ring-red-500 h-9"
                                  placeholder="DELETE"
                              />
                              <Button 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={deleteInput !== "DELETE"}
                                  onClick={handleDelete}
                              >
                                  Confirm
                              </Button>
                              <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                      setShowDeleteConfirm(false);
                                      setDeleteInput("");
                                  }}
                              >
                                  Cancel
                              </Button>
                          </div>
                      </div>
                </div>
            ) : null}  

        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close Settings</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}