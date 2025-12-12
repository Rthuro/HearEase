import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Check, ChevronsUpDown, CloudUpload, Trash2, File, ChevronDown, AlertCircle, X} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { useCaseStore } from "@/store/useCaseStore";

export function CaseDetails(){
  const { setFormData, formData, caseTypes, relationshipList, fetchRelationshipList } = useCaseStore();
  const [open, setOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState(formData.caseDetails.documents.value || []);

  useEffect(() => {
    if(relationshipList.length === 0){
      fetchRelationshipList();
    }
  }, [fetchRelationshipList]);

  const handleDeleteFile = (fileToDelete) => {
    const updatedFiles = uploadedFiles.filter(
      (file) => file.name !== fileToDelete
    );
    setUploadedFiles(updatedFiles);
    setFormData('caseDetails', 'documents', updatedFiles);
  }

  console.log("relationshipList:", relationshipList);
    
    return (
        <div className="flex flex-col items-center gap-4">
            <p className=" text-center  text-2xl mb-3">Case Details</p>
            <div className="grid grid-cols-2 gap-3 max-w-[500px] min-w-[400px]">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="natureComplaint">Nature of Complaint
                    <span className="text-redBase">*</span>
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    role="combobox"
                    aria-expanded={open}
                    variant="outline"
                    className="max-w-max min-w-[250px] justify-between"
                  >
                    {caseTypes.find(
                      (type) => type.id === formData.caseDetails.nature_of_complaint_code.value
                    )?.case_name || "Select nature of complaint..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search nature of complaint..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No nature of complaint found.</CommandEmpty>
                      <CommandGroup>
                        {caseTypes.map((complaint) => (
                          <CommandItem
                            key={complaint.id}
                            value={complaint.case_name}
                            onSelect={() => {
                              setFormData("caseDetails", "nature_of_complaint_code", complaint.id);
                              setFormData("caseDetails", "severity", complaint.severity);
                              setOpen(false);
                            }}
                          >
                            {complaint.case_name}
                            <Check
                              className={cn(
                                "ml-auto",
                                formData.caseDetails.nature_of_complaint_code.value === complaint.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              </div>
              <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="severity">Severity
                  </Label>
                  <Input id="severity" type="number"  disabled 
                  value={
                    caseTypes.find(
                        (type) => type.id === formData.caseDetails.nature_of_complaint_code.value
                      )?.severity || ""
                  } />
              </div>
              <div className="grid grid-cols-1 col-span-2 gap-2">
                <Label htmlFor="settlement">Relationship
                    <span className="text-redBase">*</span>
                </Label>
                <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" className={cn('justify-between')}>
                              {formData.caseDetails.relationship.value || "Select relationship..."}
                              <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-fit">
                          <DropdownMenuRadioGroup value={formData.caseDetails.relationship.value} 
                          onValueChange={ (value) => 
                            setFormData('caseDetails', 'relationship', value)
                            }>
                              {relationshipList.map((r) => (
                                <DropdownMenuRadioItem key={r.id} value={r.relationship}>
                                  {r.relationship}
                                </DropdownMenuRadioItem>
                              ))}
                          </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
              <div className="grid grid-cols-1 col-span-2 gap-2">
                  <Label htmlFor="description">Short Description
                      <span className="text-redBase">*</span>
                  </Label>
                  <Textarea id="description" className="w-full" rows={3} 
                  value={formData.caseDetails.description.value} 
                  onChange={(e) => setFormData('caseDetails', 'description', e.target.value)}
                  />
              </div>
              <div className="col-span-2 flex flex-col gap-1 bg-amber-50 border border-amber-300 rounded-md p-3">
                    <p className="font-medium text-sm ">Data Privacy Warning</p>  
                    <p className="text-xs text-zinc-600">You are responsible for ensuring that any uploaded media involving another person’s face or personal information is taken with their consent. Unauthorized disclosure may violate the Data Privacy Act.</p>           
              </div>

              <div className="flex flex-col gap-2 col-span-2">
                <p className="font-medium text-lg">Upload Documents</p>
                <p className="text-sm text-zinc-700">Select file evidence.</p>
                <Input type="file" id="fileUpload" className="hidden" 
                  onChange={(e) => {
                    const selectedFiles = e.target.files;
                    if (selectedFiles) {
                      const fileArray = Array.from(selectedFiles);
                      setUploadedFiles((prevFiles) => [...prevFiles, ...fileArray]);
                      setFormData('caseDetails', 'documents', 
                        [...formData.caseDetails.documents.value, ...fileArray]);
                    }
                  }} 
                  multiple
                />
                <label htmlFor="fileUpload">
                  <div className="flex flex-col justify-center items-center border-2 border-dashed border-zinc-300 rounded-md h-32 cursor-pointer hover:bg-zinc-50 transition">
                    <CloudUpload className="mb-2 text-zinc-600" />
                    <p className="text-sm ">Click to upload file</p>
                  </div>
                </label>
                <p className="font-medium mt-2">Uploaded Files</p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  { uploadedFiles.length > 0 ? (
                    uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-zinc-300 rounded-md w-[400px]">
                        <div className="flex items-center gap-1">
                          <File size={16}/>
                          <p className="text-sm">{file.name}</p>
                        </div>
                        <Button type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteFile(file.name);
                        }} 
                        variant="ghost" size="icon" className="h-6 w-6 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-600 text-center">No files uploaded.</p>
                  )}
                </div>
              </div>
            </div>
            
           
            

            
        </div>
    )
}