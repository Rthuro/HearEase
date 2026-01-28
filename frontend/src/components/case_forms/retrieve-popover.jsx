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
    const { complainants, respondents, complainants_orgs, respondents_orgs } = useRetrieveUsersStore();
    const display_complainants = () => {
        const complainant_indiv = complainants.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.middle_name || ''} ${c.last_name}`,
            type: 'individual'}));

        const complainant_orgs = complainants_orgs.map((c) => ({
            id: c.id,
            name: c.representative_name,
            type: 'organization'}));

        return [...complainant_indiv, ...complainant_orgs];
    }

    const display_respondents = () => {
        const respondent_indiv = respondents.map((r) => ({
            id: r.id,
            name: `${r.first_name} ${r.middle_name || ''} ${r.last_name}`,
            type: 'individual'}));
        const respondent_orgs = respondents_orgs.map((r) => ({
            id: r.id,
            name: r.representative_name,
            type: 'organization'}));
        return [...respondent_indiv, ...respondent_orgs];
    }

    const [query, setQuery] = useState("")

    const participantKey = participantType === "complainant" ? "complainant" : "respondent";

    const handleSelect = (user) => {
        // const userData = {
        //         id: user.id,
        //         first_name: user.first_name,
        //         middle_name: user.middle_name,
        //         last_name: user.last_name,
        //         sex: user.sex,
        //         contact_number: user.contact_number,
        //         birth_date: user.birth_date,
        //         barangay: user.barangay,
        //         street: user.street,
        //         additional_info: user.additional_info,
        //         type: "individual"
        //     };
        let data = null;

        if (participantType === "complainant" ) {
            
            if (user.type === 'individual') {
                data = complainants.find((c) => c.id === user.id) || respondents.find((r) => r.id === user.id);
                data = {
                        ...data,
                        type: 'individual'
                };
            } else {
                data = complainants_orgs.find((c) => c.id === user.id) || respondents_orgs.find((r) => r.id === user.id);
                data = {
                        ...data,
                        type: 'organization'
                };
            }
            set_complainants([...complainantList, data]);
        } else {
            if (user.type === 'individual') {
                data = respondents.find((r) => r.id === user.id) || complainants.find((c) => c.id === user.id);
                data = {
                        ...data,
                        type: 'individual'
                };
            } else {
                data = respondents_orgs.find((r) => r.id === user.id) || complainants_orgs.find((c) => c.id === user.id);
                data = {
                        ...data,
                        type: 'organization'
                };
            }
            set_respondents([...respondentList, data]);
        }
    }

    const handleReselect = (user) => {
         if (participantType === "complainant") {
            set_complainants(complainantList.filter((p) => p.id !== user.id && p.type !== user.type));
        } else {
            set_respondents(respondentList.filter((p) => p.id !== user.id && p.type !== user.type));
        }
    }

    const participantsList = participantType == "complainant" ? display_complainants() : display_respondents();

    const filteredParticipantsList = () => {
       return participantsList?.filter((user) =>
            `${user.name}`.toLowerCase().includes(query.toLowerCase())
        );
    }

   const isSelected = (user) => {
        const list = participantType === "complainant" ? complainantList : respondentList;
        return list.some((u) => 
            u?.id === user?.id && u?.type === user?.type
        );
    };




return <div className="flex justify-end gap-3">
        <Dialog>
            <DialogTrigger asChild>     
                <Button variant="outline"><Search /> Find {participantKey.charAt(0).toUpperCase() + participantKey.slice(1)}</Button>
            </DialogTrigger>
        <DialogContent>
                <DialogHeader className="hidden">
                    <DialogTitle>
                        Find {participantKey.charAt(0).toUpperCase() + participantKey.slice(1)}
                    </DialogTitle>
                    <DialogDescription>Select a {participantKey}.</DialogDescription>
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
                                        {user.name}
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