import { Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button"
import { ArrowRight, Pencil } from "lucide-react"
import { useState } from "react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label"
import { DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { useCaseStore } from "@/store/useCaseStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { File, Video, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "./ui/separator";

export function EditCaseInfo({caseInfo, refresh}){
    const { updateCaseInfo } = useCaseStore();
    const [ info, setInfo ] = useState({
        id: "",
        case_status: "",
        description: "",
        case_documents: []
    });
    const [open, setOpen] = useState(false);

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);

    useEffect(() => {
        const data = caseInfo ;
        if (!data) return;
        setInfo({
            id: data.id,
            case_status: data?.case_status,
            description:data?.description,
            case_documents: data?.case_documents.map(doc => ({
                id: doc.id,
                name: doc.title,
                file: doc.file
            }))
        })
    }, [caseInfo]); 

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
    
    const handleDeleteFile = (fileToDelete) => {
        const updatedFiles = info?.case_documents?.filter(
        (file) => file.name !== fileToDelete
        );
        setInfo({
            ...info,
            case_documents: updatedFiles
        });
    }

    const checkChanges =info?.case_status !== caseInfo?.case_status || 
        info?.description !== caseInfo?.description ||    
        info?.case_documents.length !== caseInfo?.case_documents.length ||
        info?.case_documents.some((file, index) => file.name !== caseInfo?.case_documents[index]?.title) ; 

    const handleSubmit = (e) => {
        e.preventDefault();

        toast.promise( updateCaseInfo(info, 'case', info.id), {
            loading: "Updating case information...",
            success: () => {
                refresh();
                setOpen(false);
            },
            error: "Failed to update case information."
        });

    }

    const handleCancel = (e) => {
        e.preventDefault();
        setOpen(false);
        setInfo({
            id: caseInfo.id,
            case_status: caseInfo?.case_status,
            description:caseInfo?.description,
            case_documents: caseInfo?.case_documents.map(doc => ({
                id: doc.id,
                name: doc.title,
                file: doc.file
            }))
        })
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                setInfo(null);
            }
        }}>
            <DialogTrigger asChild>     
                <Button variant="outline">
                    <Pencil className="h-4 w-4" />
                    Edit
                </Button>
            </DialogTrigger>
        <DialogContent className={cn('w-2/3')}>
                <DialogHeader>
                    <DialogTitle>Edit Case</DialogTitle>
                    <DialogDescription>Edit Case information.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3">
                    {data.userInfo?.role === "admin" && (
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="status">Case Status
                            </Label>
                            <DropdownMenu id="status">
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                    {info?.case_status || "Select"} 
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuRadioGroup
                                    value={info?.case_status}
                                    onValueChange={(value) => {
                                        setInfo({...info, case_status: value})
                                    }}
                                    >
                                        <DropdownMenuRadioItem value="pending_approval">
                                            Pending Approval
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="approved">
                                            Approved
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="in_progress">
                                            In progress
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="resolved">
                                            Resolved
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="escalated">
                                            Escalated
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="rejected">
                                            Rejected
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="cancelled">
                                            Cancelled
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="description">Case Description
                        </Label>
                        <Textarea id="description" className="w-full" rows={3} 
                        value={info?.description} 
                        onChange ={ (e) => {
                            setInfo({...info, description: e.target.value});
                        }}
                        />
                    </div>
                    <Separator className="mt-2" />
                    {info?.case_documents.length > 0 ? (
                        info?.case_documents.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border border-zinc-300 rounded-md w-full">
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
                    <Input
                        type="file"
                        id="fileUpload"
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
                                    setInfo({
                                        ...info, 
                                        case_documents: [...(info.case_documents || []), ...validFiles]
                                    });
                                }
                            }
                            }}
                            multiple
                    />
                        
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    {checkChanges ? (
                        <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
                    ) : (
                        <Button type="submit" disabled>Save Changes</Button>
                        )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}   