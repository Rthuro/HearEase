import { useState } from "react";
import { 
  Trash2, 
  Settings, 
  FileText, 
  Printer, 
  Archive, 
  CheckCircle, 
  Bell, 
  Pencil, 
  AlertTriangle 
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
import { Input } from "@/components/ui/input"; // Optional, for confirmation input

export function CaseSettingsModal({ caseData, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Placeholder handlers
  const handleExportPDF = () => console.log("Exporting PDF for", caseData.id);
  const handlePrint = () => window.print();
  const handleArchive = () => console.log("Archiving", caseData.id);
  const handleResolve = () => console.log("Marking resolved", caseData.id);

  // Secure Delete Logic
  const handleDelete = () => {
    if (deleteInput === "DELETE") {
      onDelete(caseData.id);
      setOpen(false);
    }
  };

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
          
          {/* Section 1: General & Notifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">General</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Edit Case Details</p>
                  <p className="text-xs text-muted-foreground mt-1">Update title, description, or involved parties.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-md">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">Receive updates about hearing schedules.</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator />

          {/* Section 2: Documents & Exports */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Documents</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto py-3 px-4" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Export PDF</span>
                  <span className="text-[10px] text-muted-foreground">Download case report</span>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-3 px-4" onClick={handlePrint}>
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

          {/* Section 4: Danger Zone (Delete) */}
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

            {!showDeleteConfirm ? (
                <Button 
                    variant="destructive" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Case Permanently
                </Button>
            ) : (
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
            )}
          </div>

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