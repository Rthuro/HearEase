import { PageSync } from "@/components/PageSync";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { useCaseStore } from "@/store/useCaseStore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Loader2, BadgeX, BadgeCheck  } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export function CasePersonManagement() {
    const {fetchAllCasePersons} = useCaseStore();
    const [allCasePersons, setAllCasePersons] = useState([]);
    const [loader, setLoader] = useState(false);
    const [status, setStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

     useEffect(() => {
        const loadData = async () => {
            setLoader(true);
            try {
                const data = await fetchAllCasePersons();
                if (data) {
                    setAllCasePersons(data);
                }
            } catch (error) {
                console.error("Error fetching case persons:", error);
            } finally {
                // This now runs ONLY after the await finishes
                setLoader(false);
            }
        };

        loadData();
    }, []);


    const filteredCasePersons = allCasePersons.filter((person) => {
        const fullName = `${person.first_name} ${person.middle_name || ''} ${person.last_name}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                              (person.email && person.email.toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesStatus = true;
        if (status === "has_acc") {
            matchesStatus = person.has_account === true;
        } else if (status === "no_acc") {
            matchesStatus = person.has_account === false;
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 flex flex-col gap-2">
            <PageSync page="Case Person Management" />
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Case Person Management</h1>
                <p>Currently has <span className="font-medium text-redBase">{allCasePersons?.length}</span> case persons</p>
            </div>
            {loader && (
                <div className="flex items-center justify-center py-3">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="ml-2 text-zinc-500">Loading case persons...</span>
                </div>
            )}
            <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between flex-wrap-reverse md:flex-nowrap gap-3">
                    <div className="flex items-center w-full">
                        <Search className="text-zinc-400 ml-3" size={16} />
                        <Input type="text" placeholder="Search for case..." className="w-full md:w-72 -ml-6 pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                        
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Sort by
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-38">
                            <DropdownMenuRadioGroup value={status} 
                            onValueChange={ (s) => {
                                setStatus(s);

                            }}>
                            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="no_acc">No Account</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="has_acc">Has Account</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="border rounded-lg overflow-hidden bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Account Status</TableHead>
                                <TableHead>Case Involvement</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            { filteredCasePersons?.length > 0 ? filteredCasePersons?.map((person) => (
                                <TableRow key={person?.id}>
                                    <TableCell>
                                        <Link to={`/Admin/Case-Person/${person?.id}`} className="text-redBase underline">
                                        {person?.first_name} {person?.middle_name} {person?.last_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{person?.email}</TableCell>
                                    <TableCell>{person?.contact_number}</TableCell> 
                                    <TableCell>
                                        {person?.has_account ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                <BadgeCheck data-icon="inline-start"
                                                />
                                                Has Account
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-red-100 text-red-700">
                                                <BadgeX data-icon="inline-start"
                                                />
                                                No Account
                                            </Badge>
                                        )}</TableCell>
                                    <TableCell>{person?.cases}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        No case persons found.
                                    </TableCell>
                                </TableRow>
                            )}

                            
                        </TableBody>
                    </Table>
                </div>
            </section>
        </div>
    );
}