import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Check, ChevronsUpDown, CloudUpload, Trash2, File, ChevronDown, AlertCircle, X, Video } from "lucide-react"
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
import useAuthenticationStore from "@/store/useAuthenticationStore";

export function CaseDetails() {
  const { setFormData, formData, caseTypes, relationshipList, fetchRelationshipList, jurisdictionWarning, setJurisdictionWarning } = useCaseStore();
  const [open, setOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState(formData.caseDetails.documents.value || []);
  const { userRole } = useAuthenticationStore();

  useEffect(() => {
    if (relationshipList.length === 0) {
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

  // Helper function to get severity label
  const getSeverityLabel = (level) => {
    const labels = {
      1: "Low",
      2: "Moderate",
      3: "High"
    };
    return labels[level] || "";
  };

  // File type and size validation
  const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    document: ['application/pdf']
  };
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  const isVideoFile = (file) => {
    return ALLOWED_TYPES.video.includes(file.type) || file.name.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  const isImageFile = (file) => {
    return ALLOWED_TYPES.image.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const validateFile = (file) => {
    if (isVideoFile(file)) {
      if (file.size > MAX_VIDEO_SIZE) {
        return { valid: false, error: `Video "${file.name}" exceeds 50MB limit` };
      }
    } else if (isImageFile(file)) {
      if (file.size > MAX_IMAGE_SIZE) {
        return { valid: false, error: `Image "${file.name}" exceeds 10MB limit` };
      }
    }
    return { valid: true };
  };

  const getFileIcon = (file) => {
    if (isVideoFile(file)) {
      return <Video size={16} className="text-blue-500" />;
    }
    return <File size={16} />;
  };

  // Case types beyond barangay jurisdiction (Katarungang Pambarangay Law - RA 7160)
  const EXCLUDED_CASE_TYPES = [
    // Crimes against persons - serious bodily harm or death
    "murder", "homicide", "parricide", "infanticide", "manslaughter", "rape",
    "sexual assault", "acts of lasciviousness", "attempted murder", "frustrated murder",
    "serious physical injuries",
    // Crimes against liberty
    "kidnapping", "serious illegal detention", "human trafficking", "trafficking in persons",
    "forced labor", "child trafficking", "slavery",
    // Crimes against property - with violence
    "robbery", "robbery with violence", "robbery with homicide", "carnapping",
    "highway robbery", "brigandage", "arson",
    // Drug-related offenses
    "drug trafficking", "drug possession", "illegal drugs", "drug pushing",
    "drug manufacturing", "drug importation",
    // Crimes against public order
    "rebellion", "sedition", "terrorism", "coup d'etat",
    // Crimes against chastity
    "qualified seduction", "child abuse", "child exploitation", "pedophilia",
    // Other serious crimes
    "estafa", "qualified theft", "falsification", "illegal possession of firearms",
    "illegal discharge of firearms", "violation of anti-violence against women and children act",
    "vawc", "domestic violence", "cybercrime", "identity theft", "money laundering",
    "corruption", "graft", "bribery", "election offenses",
    // Additional serious offenses
    "attempted rape", "frustrated homicide", "serious threats with weapon", "grave coercion",
    "killing", "kill", "slay", "stabbing"
  ];

  // Check if case type is beyond barangay jurisdiction
  const checkJurisdiction = (caseTypeName) => {
    if (!caseTypeName) return { valid: true };
    const lowerName = caseTypeName.toLowerCase().trim();
    for (const excluded of EXCLUDED_CASE_TYPES) {
      if (lowerName.includes(excluded) || excluded.includes(lowerName)) {
        return {
          valid: false,
          message: `"${caseTypeName}" is beyond barangay jurisdiction and cannot be handled through the Katarungang Pambarangay system. Please refer this case to the Police, Prosecutor's Office, or Courts.`
        };
      }
    }
    return { valid: true };
  };

  // Note: jurisdictionWarning state is from Zustand store (shared with CaseForm)

  // Check jurisdiction when custom case type changes
  const handleCustomCaseTypeChange = (value) => {
    setFormData("caseDetails", "custom_case_type_name", value);
    const check = checkJurisdiction(value);
    if (!check.valid) {
      setJurisdictionWarning(check.message);
    } else {
      setJurisdictionWarning(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className=" text-center  text-2xl mb-3">Case Details</p>
      <div className="grid grid-cols-2 gap-3 w-full md:max-w-[500px] md:min-w-[400px]">
        <div className="grid grid-cols-1 col-span-2 gap-2">
          <Label htmlFor="natureComplaint">Nature of Complaint
            <span className="text-redBase">*</span>
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                role="combobox"
                aria-expanded={open}
                variant="outline"
                className="w-full min-w-[250px] justify-between"
              >
                {formData.caseDetails.nature_of_complaint_code.value === "other"
                  ? "Other (Custom)"
                  : caseTypes.find(
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
                          setFormData("caseDetails", "custom_case_type_name", "");
                          // Check jurisdiction for predefined case types too
                          const check = checkJurisdiction(complaint.case_name);
                          setJurisdictionWarning(check.valid ? null : check.message);
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
                    <CommandItem
                      key="other"
                      value="Other"
                      onSelect={() => {
                        setFormData("caseDetails", "nature_of_complaint_code", "other");
                        setFormData("caseDetails", "severity", null); // User must select severity
                        setOpen(false);
                      }}
                      className="border-t border-zinc-200 mt-1 pt-2"
                    >
                      <span className="text-zinc-600">Other (not listed above)</span>
                      <Check
                        className={cn(
                          "ml-auto",
                          formData.caseDetails.nature_of_complaint_code.value === "other"
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Jurisdiction Warning Alert - shown for predefined case types */}
          {jurisdictionWarning && formData.caseDetails.nature_of_complaint_code.value !== "other" && (
            <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Case Beyond Barangay Jurisdiction</p>
                <p className="text-xs text-red-700 mt-1">{jurisdictionWarning}</p>
              </div>
            </div>
          )}

          {/* Custom case type input - shown when "Other" is selected */}
          {formData.caseDetails.nature_of_complaint_code.value === "other" && (
            <div className="mt-2 space-y-3 p-3 border border-zinc-200 rounded-md bg-zinc-50">
              <div>
                <Label htmlFor="customCaseType">
                  Case Type Name<span className="text-redBase">*</span>
                </Label>
                <Input
                  id="customCaseType"
                  placeholder="e.g., Property Dispute, Noise Complaint..."
                  value={formData.caseDetails.custom_case_type_name?.value || ""}
                  onChange={(e) => handleCustomCaseTypeChange(e.target.value)}
                  className={cn("mt-1", jurisdictionWarning && "border-red-500")}
                />
                {/* Jurisdiction Warning Alert */}
                {jurisdictionWarning && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Case Beyond Barangay Jurisdiction</p>
                      <p className="text-xs text-red-700 mt-1">{jurisdictionWarning}</p>
                    </div>
                  </div>
                )}
              </div>
              {/* <div>
                <Label htmlFor="customSeverity">
                  Severity Level<span className="text-redBase">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1">
                      {formData.caseDetails.severity.value
                        ? `Level ${formData.caseDetails.severity.value} - ${getSeverityLabel(formData.caseDetails.severity.value)}`
                        : "Select severity level..."}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[300px]">
                    <DropdownMenuRadioGroup
                      value={formData.caseDetails.severity.value?.toString() || ""}
                      onValueChange={(value) => setFormData("caseDetails", "severity", parseInt(value))}
                    >
                      <DropdownMenuRadioItem value="1">Level 1 - Low (minor disputes)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="2">Level 2 - Moderate (property issues, harassment)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="3">Level 3 - High (threats, physical harm)</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
              <p className="text-xs text-zinc-500">
                This case type will be added to the system for future use.
              </p>
            </div>
          )}
        </div>
        {userRole === "admin" && (
          <div className="grid grid-cols-1 col-span-2 gap-2">
                  <Label htmlFor="customSeverity">
                    Severity Level<span className="text-redBase">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between mt-1">
                        {formData.caseDetails.severity.value
                          ? `Level ${formData.caseDetails.severity.value} - ${getSeverityLabel(formData.caseDetails.severity.value)}`
                          : "Select severity level..."}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full min-w-[300px]">
                      <DropdownMenuRadioGroup
                        value={formData.caseDetails.severity.value?.toString() || ""}
                        onValueChange={(value) => setFormData("caseDetails", "severity", parseInt(value))}
                      >
                        <DropdownMenuRadioItem value="1">Level 1 - Low (minor disputes)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="2">Level 2 - Moderate (property issues, harassment)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="3">Level 3 - High (threats, physical harm)</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
          </div>
        )}
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
                onValueChange={(value) =>
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
          <p className="font-medium text-lg">Upload Evidence</p>
          <p className="text-sm text-zinc-700">Upload images, videos, or documents as evidence. Videos up to 50MB allowed.</p>
          <Input
            type="file"
            id="fileUpload"
            className="hidden"
            accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime,.pdf"
            onChange={(e) => {
              const selectedFiles = e.target.files;
              if (selectedFiles) {
                const fileArray = Array.from(selectedFiles);
                const validFiles = [];
                const errors = [];

                fileArray.forEach(file => {
                  const validation = validateFile(file);
                  if (validation.valid) {
                    validFiles.push(file);
                  } else {
                    errors.push(validation.error);
                  }
                });

                if (errors.length > 0) {
                  alert(errors.join('\n'));
                }

                if (validFiles.length > 0) {
                  setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);
                  setFormData('caseDetails', 'documents',
                    [...formData.caseDetails.documents.value, ...validFiles]);
                }
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
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border border-zinc-300 rounded-md w-[400px]">
                  <div className="flex items-center gap-1">
                    {getFileIcon(file)}
                    <p className="text-sm truncate max-w-[300px]">{file.name}</p>
                    {isVideoFile(file) && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">Video</span>
                    )}
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