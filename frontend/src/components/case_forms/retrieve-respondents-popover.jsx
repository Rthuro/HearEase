import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCaseStore } from "@/store/useCaseStore";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";
import { Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem
} from "@/components/ui/command"
import { ChevronDown, Search, Check } from "lucide-react";
import { Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"

export function RetrieveRespondentsPopover() {
    const { setFormData } = useCaseStore();
    const { fetchRespondents, respondents} = useRetrieveUsersStore();

    useEffect(() => {
        fetchRespondents();
    }, []);

    const [query, setQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState(null)

    const handleSelect = (user) => {
        setSelectedUser(user)
        setFormData("respondent", "first_name", user.first_name)
        setFormData("respondent", "middle_name", user.middle_name)
        setFormData("respondent", "last_name", user.last_name)
        setFormData("respondent", "sex", user.sex)
        setFormData("respondent", "contact_number", user.contact_number)
        setFormData("respondent", "birth_date", user.birth_date ? new Date(user.birth_date).toLocaleDateString("en-US") : null)
        setFormData("respondent", "barangay", user.barangay)
        setFormData("respondent", "street", user.street)
        setFormData("respondent", "additional_info", user.additional_info)
    }

    const handleReset = (e) => {
        e.preventDefault();
        setSelectedUser(null)
        setFormData("respondent", "first_name", "")
        setFormData("respondent", "middle_name", "")
        setFormData("respondent", "last_name", "")
        setFormData("respondent", "sex", "")
        setFormData("respondent", "contact_number", "")
        setFormData("respondent", "birth_date", "")
        setFormData("respondent", "barangay", "")
        setFormData("respondent", "street", "")
        setFormData("respondent", "additional_info", "")
    }


    const filteredUsers = () => {
        return respondents.filter((user) =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(query.toLowerCase())
            );
    }

return <div className="flex justify-end col-span-2 border-b mb-2 pb-3 gap-3">
        <Dialog>
            <DialogTrigger>     
                <Button variant="outline"><Search />Find Respondents</Button>
            </DialogTrigger>
        <DialogContent>
                <DialogHeader className="hidden">
                    <DialogTitle>Find Respondents</DialogTitle>
                    <DialogDescription>Select a respondents to retrieve their information.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-end gap-4 mt-3">
                    <div className="flex items-center justify-between w-full">
                        <p className="font-medium">
                            Find Respondents
                        </p>
                    </div>
                    <Command className={cn('border')}>
                        <CommandInput
                            id="respondentSearch"
                            placeholder="Search respondent name..."
                            value={query}
                            onValueChange={setQuery}
                            
                        />
                        <CommandList>
                            {filteredUsers().length > 0 ? (
                                filteredUsers().map((user) => (
                                    <DialogClose asChild>
                                        <CommandItem
                                        key={user.id}
                                        onSelect={() => handleSelect(user)}
                                        className="cursor-pointer"
                                        >
                                        {selectedUser?.id === user.id && <Check />}
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
        <Button className={cn('bg-redBase')} onClick={handleReset}>Reset</Button>
    </div>
}