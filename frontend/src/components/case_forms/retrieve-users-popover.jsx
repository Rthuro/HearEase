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

export function RetrieveUserPopover() {
    const { setFormData } = useCaseStore();
    const { fetchUsers, users, fetchComplainants, complainantsUsers } = useRetrieveUsersStore();
    const stored = localStorage.getItem("authData");
    const storedData = stored ? JSON.parse(stored) : null;
    const [ complainantOption, setComplainantOption] = useState("withAccount");

    useEffect(() => {
        if(storedData.userRole === 'admin') {
            fetchUsers();
            fetchComplainants();
        }
    }, []);

    const [query, setQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState(null)

    const handleSelect = (user) => {
        setSelectedUser(user)
        setFormData("complainant", "first_name", user.first_name)
        setFormData("complainant", "middle_name", user.middle_name)
        setFormData("complainant", "last_name", user.last_name)
        setFormData("complainant", "sex", user.sex)
        setFormData("complainant", "contact_number", user.contact_number)
        setFormData("complainant", "birth_date", user.birth_date ? new Date(user.birth_date).toLocaleDateString("en-US") : null)
        setFormData("complainant", "barangay", user.barangay)
        setFormData("complainant", "street", user.street)
        setFormData("complainant", "additional_info", user.additional_info)
    }

    const handleReset = (e) => {
        e.preventDefault();
        setSelectedUser(null)
        setFormData("complainant", "first_name", "")
        setFormData("complainant", "middle_name", "")
        setFormData("complainant", "last_name", "")
        setFormData("complainant", "sex", "")
        setFormData("complainant", "contact_number", "")
        setFormData("complainant", "birth_date", "")
        setFormData("complainant", "barangay", "")
        setFormData("complainant", "street", "")
        setFormData("complainant", "additional_info", "")
    }


    const filteredUsers = () => {
        if (complainantOption === "withAccount") {
            return users.filter((user) =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            return complainantsUsers.filter((user) =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

return <div className="flex justify-end col-span-2 border-b mb-2 pb-3 gap-3">
        <Dialog>
            <DialogTrigger>     
                <Button variant="outline"><Search /> Find Complainant</Button>
            </DialogTrigger>
        <DialogContent>
                <DialogHeader className="hidden">
                    <DialogTitle>Find Complainant</DialogTitle>
                    <DialogDescription>Select a complainant to retrieve their information.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-end gap-4 mt-3">
                    <div className="flex items-center justify-between w-full">
                        <p className="font-medium">
                            Find Complainant
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="outline" className="w-fit justify-between ">
                                    {complainantOption === "withAccount" ? "with account" : "without account"}
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setComplainantOption("withAccount")}>With account</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setComplainantOption("withoutAccount")}>Without account</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Command className={cn('border')}>
                        <CommandInput
                            id="complainantSearch"
                            placeholder="Search complainant name..."
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
                                        {user.first_name} {user.last_name} — {user.email}
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