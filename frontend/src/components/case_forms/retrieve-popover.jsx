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
import { checkIndividual , checkOrg } from "@/lib/helpers";

export function RetrievePopover({participantType}) {
    const { complainantList, set_complainants, respondentList, set_respondents} = useCaseStore();
    const { complainants, respondents, complainants_orgs, respondents_orgs } = useRetrieveUsersStore();

    const display_complainants = () => {
        const complainant_indiv = complainants.map((c) => ({
            name: `${c.first_name} ${c.middle_name} ${c.last_name}`,
            type: 'individual'}));

        const complainant_orgs = complainants_orgs.map((c) => ({
            name: c.representative_name,
            type: 'organization'}));

        return [...complainant_indiv, ...complainant_orgs];
    }

    const display_respondents = () => {
        const respondent_indiv = respondents.map((r) => ({
            name: `${r.first_name} ${r.middle_name} ${r.last_name}`,
            type: 'individual'}));
        const respondent_orgs = respondents_orgs.map((r) => ({
            name: r.representative_name,
            type: 'organization'}));
        return [...respondent_indiv, ...respondent_orgs];
    }

    const [query, setQuery] = useState("")

    const participantKey = participantType === "complainant" ? "complainant" : "respondent";

    const handleSelect = (user) => {
        let data = null;

        if (participantType === "complainant" ) {
            
            if (user.type === 'individual') {
                data = complainants.find((c) => 
                `${c.first_name} ${c.middle_name || ''} ${c.last_name}` === user.name);
                data = {
                        ...data,
                        type: 'individual'
                };
            } else {
                data = complainants_orgs.find((c) => c.representative_name === user.name);
                data = {
                        ...data,
                        type: 'organization'
                };
            }
            set_complainants([...complainantList, data]);
        } else {
            if (user.type === 'individual') {
                data = respondents.find((r) => 
                `${r.first_name} ${r.middle_name || ''} ${r.last_name}` === user.name);
                data = {
                        ...data,
                        type: 'individual'
                };
            } else {
                data = respondents_orgs.find((r) => r.representative_name === user.name);
                data = {
                        ...data,
                        type: 'organization'
                };
            }
            set_respondents([...respondentList, data]);
        }
    }

    const handleReselect = (user) => {
    // 1. Determine which list and which setter to use
    const isComplainant = participantType === "complainant";
    const currentList = isComplainant ? complainantList : respondentList;
    const setter = isComplainant ? set_complainants : set_respondents;

    // 2. Filter out the selected user using the same normalization logic as your helpers
    const updatedList = currentList.filter((u) => {
            if (user.type === 'individual') {
                const fullName = `${u.first_name}${u.middle_name || ''}${u.last_name}`;
                const normalizedItem = fullName.toLowerCase().replace(/\s+/g, '');
                const normalizedInput = user.name.toLowerCase().replace(/\s+/g, '');
                
                // Keep the item if it DOES NOT match the clicked user
                return !(normalizedItem === normalizedInput && u.type === user.type);
            } else {
                const fullName = u.representative_name;
                const normalizedItem = fullName.toLowerCase().replace(/\s+/g, '');
                const normalizedInput = user.name.toLowerCase().replace(/\s+/g, '');
                
                return !(normalizedItem === normalizedInput && u.type === user.type);
            }
        });

        // 3. Update the store
        setter(updatedList);
    };

    const participantsList = participantType == "complainant" ? display_complainants() : display_respondents();

    const filteredParticipantsList = () => {
       return participantsList?.filter((user) =>
            `${user.name}`.toLowerCase().includes(query.toLowerCase())
        );
    }

   const isSelected = (user) => {
        // data format: name and type
        // console.log("Checking if selected (filteredParticipantsList):", user);
        
        const list = participantType === "complainant" ? complainantList : respondentList;

        // data format: original datas from db
        // console.log("ComplainantList:", list);

        if(user.type === 'individual') {   
            return checkIndividual(list, user);
                
        } else {
            return checkOrg(list, user);
        }
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
                                        <CommandItem
                                            key={user.id}
                                            onSelect={() => {
                                                if (isSelected(user)) {
                                                    handleReselect(user);
                                                } else {
                                                    handleSelect(user);
                                                }
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isSelected(user) ? (
                                                    <Check className="h-4 w-4 text-green-500" /> 
                                                ) : (
                                                    <div className="w-4" /> // Spacer for alignment
                                                )}
                                                {user.name}
                                            </div>
                                        </CommandItem>
                                    
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