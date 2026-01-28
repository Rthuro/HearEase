import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddEditParticipant } from "./add-edit-participant";
import { Button } from "../ui/button";
import { Plus, Edit } from "lucide-react";
import { useState } from "react";

export function DropdownParticipants({ action, type }) {
    const [openDialog, setOpenDialog] = useState(null);
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                     { action == 'Add' ? (
                            <Plus /> 
                    ) : (
                            <Edit /> 
                    ) }
                    {action} {typeLabel}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => setOpenDialog('individual')}>
                    Individual
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('organization')}>
                    Organization
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
         <AddEditParticipant 
            type={type} 
            action={action} 
            form_type="individual" 
            open={openDialog === 'individual'} 
            onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}
        />
        <AddEditParticipant 
            type={type} 
            action={action} 
            form_type="organization" 
            open={openDialog === 'organization'} 
            onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}
        />
        </>
        
    )
}