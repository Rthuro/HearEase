import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Check, ChevronsUpDown, CloudUpload, Trash2, File} from "lucide-react"
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
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { useFormStore } from "@/store/useFormStore";

const natureOfComplaints = [
  {
    code: "NOISE_NUISANCE",
    label: "Noise / Nuisance",
    examples: ["Karaoke past quiet hours", "Loud parties", "Barking dogs"],
    severity: 1,
    recommended_action: "Barangay conciliation (Lupon mediation)",
    legal_notes: ["Covered by KP; typical neighbor dispute."],
  },
  {
    code: "OBSTRUCTION_NUISANCE",
    label: "Obstruction / Minor Nuisance",
    examples: ["Blocking driveway or alley", "Improper sidewalk use"],
    severity: 1,
    recommended_action: "Barangay conciliation; issue barangay notice",
    legal_notes: ["Covered by KP unless tied to a serious offense."],
  },
  {
    code: "SMALL_MONEY_CLAIM",
    label: "Unpaid Debt / Small Money Claim",
    examples: ["Utang/loan unpaid", "Split-bill disputes"],
    severity: 2,
    recommended_action: "Barangay conciliation; settlement agreement",
    legal_notes: ["KP covers civil disputes among residents of same city/municipality."],
  },
  {
    code: "PROPERTY_BOUNDARY",
    label: "Property / Boundary / Right of Way",
    examples: ["Fence encroachment", "Right-of-way access"],
    severity: 2,
    recommended_action: "Barangay conciliation; minutes & settlement",
    legal_notes: ["KP-coverage civil dispute unless cross-LGU boundary (exempt)."],
  },
  {
    code: "MINOR_PROPERTY_DAMAGE",
    label: "Minor Property Damage (Malicious Mischief)",
    examples: ["Broken plant pots", "Scratched gate"],
    severity: 2,
    recommended_action: "Barangay conciliation; consider settlement for damages",
    legal_notes: ["Covered if penalty is not >1 year or fine >₱5,000."],
  },
  {
    code: "VERBAL_ABUSE_DEFAMATION",
    label: "Verbal Abuse / Simple Oral Defamation",
    examples: ["Name-calling", "Shouting matches"],
    severity: 2,
    recommended_action: "Barangay conciliation; apology/undertakings",
    legal_notes: ["Often handled at KP level unless escalated to serious threats."],
  },
  {
    code: "THREATS_ALARMS",
    label: "Threats / Alarms and Scandals (non-deadly)",
    examples: ["Non-specific threats", "Disturbance in public"],
    severity: 3,
    recommended_action: "Barangay conciliation or police blotter depending on gravity",
    legal_notes: ["KP covers minor offenses; serious threats should go to police/prosecutor."],
  },
  {
    code: "TRESSPASS_SIMPLE",
    label: "Simple Trespass to Dwelling (no violence)",
    examples: ["Entered yard without permission"],
    severity: 3,
    recommended_action: "Barangay conciliation; escalate if aggravated",
    legal_notes: ["Check penalty; if likely >1 year, KP exemption applies → police/court."],
  },
  {
    code: "MINOR_PHYSICAL_INJURY",
    label: "Minor Physical Injuries (no weapon, brief medical attention)",
    examples: ["Pushing/shoving", "Small bruise"],
    severity: 3,
    recommended_action: "Barangay conciliation; medical note for records",
    legal_notes: ["KP may cover if penalty does not exceed 1 year/₱5,000."],
  },
  {
    code: "PETTY_THEFT_LOSS",
    label: "Petty Theft / Loss of Property (low value, no violence)",
    examples: ["Missing laundry", "Stolen plant"],
    severity: 4,
    recommended_action: "Police blotter; KP conciliation usually not required",
    legal_notes: ["Criminal; many theft cases are exempt from KP—file with police/prosecutor."],
  },
  {
    code: "VANDALISM_MODERATE",
    label: "Vandalism / Moderate Property Damage",
    examples: ["Spray paint on wall", "Broken window"],
    severity: 4,
    recommended_action: "Police blotter; civil damages may be settled",
    legal_notes: ["Criminal + civil; KP may handle civil aspect but crimes go to police/court."],
  },
  {
    code: "ASSAULT_SERIOUS",
    label: "Assault (Serious Injuries) / Weapon Involved",
    examples: ["Knife attack", "Fractures, severe wounds"],
    severity: 5,
    recommended_action: "Emergency services + police; not for KP",
    legal_notes: ["Exempt from KP (serious offense)."],
  },
  {
    code: "VAWC_RA9262",
    label: "Violence Against Women and their Children (RA 9262)",
    examples: ["Physical/psychological/economic abuse", "Stalking, harassment"],
    severity: 5,
    recommended_action: "Issue BPO; assist victim; immediate police if danger",
    legal_notes: ["Barangay Protection Order (BPO) under RA 9262; urgent handling."],
  },
  {
    code: "CHILD_ABUSE_RA7610",
    label: "Child Abuse / Exploitation (RA 7610 and related laws)",
    examples: ["Physical/psychological abuse of minors"],
    severity: 5,
    recommended_action: "Immediate report to police/DSWD; not for KP",
    legal_notes: ["Serious offense; KP-exempt."],
  },
  {
    code: "DRUGS_ILLEGAL",
    label: "Illegal Drugs (possession, use, sale)",
    examples: ["Suspected shabu use/sale"],
    severity: 5,
    recommended_action: "Police/PNP; not for KP",
    legal_notes: ["Criminal offense; KP-exempt."],
  },
];

export function CaseDetails(){
  const { setFormData, formData } = useFormStore();
  const [open, setOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState(formData.caseDetails.documents.value || []);

  const handleDeleteFile = (fileToDelete) => {
    const updatedFiles = uploadedFiles.filter(
      (file) => file.name !== fileToDelete
    );
    setUploadedFiles(updatedFiles);
    setFormData('caseDetails', 'documents', updatedFiles);
  }

    return (
        <div className="grid grid-cols-1 gap-3">
            <p className=" text-center  text-2xl mb-3">Case Details</p>
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
                        className="max-w-max min-w-[400px] justify-between"
                        >
                        {formData.caseDetails.nature_of_complaint_code.value
                            ? natureOfComplaints.find((complaint) => complaint.code === formData.caseDetails.nature_of_complaint_code.value)?.label
                            : "Select nature of complaint..."}
                        <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                        <Command>
                        <CommandInput placeholder="Search nature of complaint..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No nature of complaint found.</CommandEmpty>
                            <CommandGroup>
                            {natureOfComplaints.map((complaint) => (
                                <CommandItem
                                key={complaint.code}
                                value={complaint.code}
                                onSelect={(currentValue) => {
                                    setFormData('caseDetails', 'nature_of_complaint_code', currentValue)
                                    setFormData('caseDetails', 'severity', complaint.severity)
                                    setOpen(false)
                                }}
                                >
                                {complaint.label}
                                <Check
                                    className={cn(
                                    "ml-auto",
                                    formData.caseDetails.nature_of_complaint_code.value === complaint.code ? "opacity-100" : "opacity-0"
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
                <Input id="severity" type="number" className="w-full" disabled 
                value={
                  formData.caseDetails.nature_of_complaint_code.value ? natureOfComplaints.find((complaint) => 
                    complaint.code === formData.caseDetails.nature_of_complaint_code.value)?.severity : ""
                } />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="description">Short Description
                </Label>
                <Textarea id="description" className="w-full" rows={3} 
                value={formData.caseDetails.description.value} 
                onChange={(e) => setFormData('caseDetails', 'description', e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
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
    )
}