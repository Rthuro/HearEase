import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCaseStore } from "@/store/useCaseStore";
import toast from "react-hot-toast";

export function DeleteCaseModal({case_id}) {
    const {deleteCase, fetchCases} = useCaseStore();
    const [open, setOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const handleDelete = () => {
        toast.promise(deleteCase(case_id , 'delete'), {
        loading: 'Deleting case...',
        success: () => {
            setOpen(false);
            fetchCases(); // Refresh the list of cases after deletion
            return 'Case deleted successfully!';
        },
        error: 'Error deleting case.',
        });
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                    <Trash2 className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Delete Case</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete case {case_id}?
                    </DialogDescription>
                </DialogHeader>
                {!showDeleteConfirm ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-100 text-red-600 rounded-full">
                              <AlertTriangle className="h-4 w-4" />
                          </div>
                          <h4 className="text-sm font-bold text-red-900">Irreversible actions regarding this case.</h4>
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
                          <h4 className="text-sm font-bold text-red-900">Irreversible actions regarding this case.</h4>
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
                )}
            </DialogContent>
        </Dialog>
    )
}