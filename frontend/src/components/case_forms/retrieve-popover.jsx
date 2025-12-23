import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCaseStore } from "@/store/useCaseStore";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";
import { Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem
} from "@/components/ui/command"
import { Search, Check } from "lucide-react";
import { Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"

export function RetrievePopover({participantType}) {
    const { complainantList, set_complainants, respondentList, set_respondents} = useCaseStore();
    const { complainants, respondents} = useRetrieveUsersStore();

    const [query, setQuery] = useState("")

    const participantKey = participantType === "complainant" ? "complainant" : "respondent";

    const handleSelect = (user) => {
        const userData = {
                id: user.id,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                sex: user.sex,
                contact_number: user.contact_number,
                birth_date: user.birth_date,
                barangay: user.barangay,
                street: user.street,
                additional_info: user.additional_info
            };
        if (participantType === "complainant") {
            set_complainants([...complainantList, userData]);
        } else {
            set_respondents([...respondentList, userData]);
        }
    }

    const handleReselect = (user) => {
        // const updatedSelected = selected.filter((id) => id !== user.id);
        // setSelected(updatedSelected);
         if (participantType === "complainant") {
            set_complainants(complainantList.filter((p) => p.id !== user.id));
        } else {
            set_respondents(respondentList.filter((p) => p.id !== user.id));
        }
    }

    

    const participantsList = participantType == "complainant" ? complainants : respondents;

    const filteredParticipantsList = () => {
       return participantsList?.filter((user) =>
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(query.toLowerCase())
        );
    }

   const isSelected = (user) => {
        const list = participantType == "complainant" ? complainantList : respondentList;

        return list.some(
            (u) =>
            u.first_name?.toLowerCase() === user.first_name?.toLowerCase() &&
            u.last_name?.toLowerCase() === user.last_name?.toLowerCase()
        );
    };



return <div className="flex justify-end gap-3">
        <Dialog>
            <DialogTrigger asChild>     
                <Button variant="outline"><Search /> Find {participantKey.charAt(0).toUpperCase() + participantKey.slice(1)}</Button>
            </DialogTrigger>
        <DialogContent>
                <DialogHeader className="hidden">
                    <DialogTitle>Find {participantKey.charAt(0).toUpperCase() + participantKey.slice(1)}</DialogTitle>
                    <DialogDescription>Select a {participantKey} to retrieve their information.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-end gap-4 mt-3">
                    <div className="flex items-center justify-between w-full">
                        <p className="font-medium">
                            Find {participantKey.charAt(0).toUpperCase() + participantKey.slice(1)}
                        </p>
                    </div>
                    <Command className={cn('border')}>
                        <CommandInput
                            id={`${participantKey} Search`}
                            placeholder={`Search ${participantKey} name...`}
                            value={query}
                            onValueChange={setQuery}
                            
                        />
                        <CommandList>
                            {filteredParticipantsList().length > 0 ? (
                                filteredParticipantsList().map((user) => (
                                    <DialogClose  key={user.id} asChild>
                                        <CommandItem
                                        key={user.id}
                                        onSelect={() => {
                                            if (isSelected(user)) {
                                                handleReselect(user);
                                            } else {
                                                handleSelect(user)
                                            }
                                        }}
                                        className="cursor-pointer"
                                        >
                                        {isSelected(user) && <Check />}
                                        {user.first_name} {user.last_name}
                                        </CommandItem>
                                    </DialogClose>
                                    
                                ))
                            ) : (
                            <CommandEmpty>No users found.</CommandEmpty>
                            )}
                        </CommandList>
                    </Command>
                </div>
            </DialogContent>
        </Dialog>
    </div>
}