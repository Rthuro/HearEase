
import React, { useState, useEffect, useActionState, startTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCaseStore } from "@/store/useCaseStore"; 
import { cn } from "@/lib/utils";
import { useSystemConfigStore } from "@/store/useSystemConfigStore";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2 } from "lucide-react";

export function SystemConfiguration() {
  const { fetchCaseTypes, fetchSettlementTypes } = useCaseStore();
  const { updateCaseType, updateSettlementType, addCaseType, addSettlementType, deleteSystemConfig } = useSystemConfigStore();
  
  const [res, callCaseTypes, isPending] = useActionState(fetchCaseTypes, []);
  const [settlementTypes, callSettlementTypes, isPendingSettlement] = useActionState(fetchSettlementTypes, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Adjust this number as needed

  // 4. Initial Data Fetch
  useEffect(() => {
    startTransition(() => {
      callCaseTypes();
      callSettlementTypes();
    });
  }, []);

  const filteredCaseTypes = (res || []).filter((c) => {
    return c.case_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 3:
        return "bg-red-100 text-red-700 border-red-200";
      case 2:
        return "bg-amber-100 text-amber-700 border-amber-200";
      case 1:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

    // Case Types
  const totalPages = Math.ceil(filteredCaseTypes?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredCaseTypes?.slice(startIndex, endIndex) || [];

//   Settlement Types
  const [s_currentPage, setSCurrentPage] = useState(1);
  
  const s_totalPages = Math.ceil(settlementTypes?.length / ITEMS_PER_PAGE);
  const s_startIndex = (s_currentPage - 1) * ITEMS_PER_PAGE;
  const s_endIndex = s_startIndex + ITEMS_PER_PAGE;
  const s_currentData = settlementTypes?.slice(s_startIndex, s_endIndex) || [];

  useEffect(() => {
    setCurrentPage(1);
    setSCurrentPage(1);
  }, [searchQuery]);

  const [c_open, setCOpen] = useState(false);
  const [c_descrip, setCDescrip] = useState("");
  const [c_name, setCName] = useState("");
  const [c_severity, setCSeverity] = useState("");
  
  const [s_open, setSOpen] = useState(false);
  const [s_descrip, setSDescrip] = useState("");
  const [s_name, setSName] = useState("");

  const [editType, setEditType] = useState("case");
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const handleAddSubmit = async (type) => {
    if (type === "case") {
        toast.promise(
          addCaseType({ case_name: c_name, description: c_descrip, severity: c_severity }),
          {
            loading: "Adding case type...",
            success: () => {
                setCOpen(false);
                startTransition(() => {
                    callCaseTypes();
                });
                return "Case type added successfully!";
            },
            error: "Failed to add case type.",
          }
        );
    } else if (type === "settlement") {
        toast.promise(
          addSettlementType({ settlement_name: s_name, description: s_descrip }),
          {
            loading: "Adding settlement type...",
            success: () => {
                setSOpen(false);
                startTransition(() => {
                    callSettlementTypes();
                });
                return "Settlement type added successfully!";
            },
            error: "Failed to add settlement type.",
          }
        );
    }
  }

  const handleDelete = async (configType, configId) => {
    toast.promise(
      deleteSystemConfig(configType, configId),
      {
        loading: `Deleting ${configType === "caseType" ? "case type" : "settlement type"}...`,
        success: () => {
            startTransition(() => {
                callCaseTypes();
                callSettlementTypes();
            });
            return `${configType === "caseType" ? "Case type" : "Settlement type"} deleted successfully!`;
        },
        error: `Failed to delete ${configType === "caseType" ? "case type" : "settlement type"}.`,
      }
    );
  }

  const handleEditSubmit = async (type) => {
        if (type === "case") {
            toast.promise(
            updateCaseType(editData.id, editData),
            {
                loading: "Updating case type...",
                success: () => {
                    setEditOpen(false);
                    startTransition(() => {
                        callCaseTypes();
                    }
                    );
                    setEditData({});
                    return "Case type updated successfully!";
                },
                error: "Failed to update case type.",
            }
            );
        } else if (type === "settlement") {
            toast.promise(
            updateSettlementType(editData.id, editData),
            {
                loading: "Updating settlement type...",
                success: () => {
                    setEditOpen(false);
                    startTransition(() => {
                        callSettlementTypes();
                    }
                    );
                    setEditData({});
                    return "Settlement type updated successfully!";
                },
                error: "Failed to update settlement type.",
            }
            );
        }
    }

  return (
    <div className="flex-1 flex flex-col gap-3 mt-3">
      {/* Header Section */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">System Configuration</h2>
        {(isPending || isPendingSettlement) && (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-4 w-4 text-red-600" />
          </div>
        )}
      </div>

      <section className="flex flex-col gap-3 bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <Input
            type="text"
            placeholder="Search case names..."
            className="w-full max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Dialog open={c_open} onOpenChange={setCOpen}>
                <DialogTrigger asChild>     
                    <Button className="bg-redBase">
                        <Plus className="w-4 h-4 mr-1" /> Add Case Type
                    </Button>
                </DialogTrigger>
                <DialogContent className={cn('max-w-[100vw] min-w-fit')}>
                    <DialogHeader>
                        <DialogTitle>Add Case Type</DialogTitle>
                        <DialogDescription>Add a new case type. These case types will be available for selection in the system configuration.</DialogDescription>
                    </DialogHeader>
                        <div className=" overflow-y-auto max-h-[70vh] min-w-fit p-3">
                            <Input type="text" id="case_name" className="w-full" placeholder="Case Name" value={c_name} onChange={(e) => setCName(e.target.value)} />
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between mt-1">
                                { c_severity
                                    || "Select severity level..."}
                                <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full min-w-[300px]">
                                <DropdownMenuRadioGroup
                                value={c_severity?.toString() || ""}
                                onValueChange={(value) => setCSeverity(parseInt(value))}
                                >
                                <DropdownMenuRadioItem value="1">Level 1 - Low (minor disputes)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="2">Level 2 - Moderate (property issues, harassment)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="3">Level 3 - High (threats, physical harm)</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <Textarea id="description" className="w-full mt-2" rows={4} placeholder="Description" value={c_descrip} onChange={(e) => setCDescrip(e.target.value)} />
                        </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCOpen(false)}>Close</Button>
                        <Button className="bg-redBase"  onClick={() => handleAddSubmit("case")}
                        disabled={isPending}>Add Case</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {/* Table Section */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead>Case Name</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((c) => (
                  <TableRow key={c.id} className="text-zinc-700">
                    <TableCell className="font-medium">{c.case_name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityStyle(c.severity)}`}>
                        {c.severity}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {c.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm"
                      onClick={() => {
                        setEditType("case");
                        setEditData({
                            id: c.id,
                            case_name: c.case_name,
                            description: c.description,
                            severity: c.severity
                        });
                        setEditOpen(true);
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" className="ml-2 bg-redBase" onClick={() => handleDelete("caseType", c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Shadcn Pagination Component */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-2">
            <div className="text-sm text-zinc-500 mr-4">
              Page {currentPage} of {totalPages}
            </div>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Generate Page Numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Basic logic to show only nearby pages if totalPages is large
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === pageNumber}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="font-bold">
            Settlement Types
          </p>
          <Dialog open={s_open} onOpenChange={setSOpen}>
                <DialogTrigger asChild>     
                    <Button className="bg-redBase">
                        <Plus className="w-4 h-4 mr-1" /> Add Settlement Type
                    </Button>
                </DialogTrigger>
                <DialogContent className={cn('max-w-[100vw] min-w-fit')}>
                    <DialogHeader>
                        <DialogTitle>Add Settlement Type</DialogTitle>
                        <DialogDescription>Add a new settlement type. These settlement types will be available for selection in the system configuration.</DialogDescription>
                    </DialogHeader>
                        <div className=" overflow-y-auto max-h-[70vh] min-w-fit p-3">
                            <Input type="text" id="settlement_name" className="w-full" placeholder="Settlement Name" value={s_name} onChange={(e) => setSName(e.target.value)} />
                            <Textarea id="description" className="w-full mt-2" rows={4} placeholder="Description" value={s_descrip} onChange={(e) => setSDescrip(e.target.value)} />
                        </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSOpen(false)}>Close</Button>
                        <Button className="bg-redBase"  onClick={() => handleAddSubmit("settlement")}
                        disabled={isPendingSettlement}>Add Settlement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {/* Table Section */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead>Settlement Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {s_currentData.map((s) => (
                  <TableRow key={s.id} className="text-zinc-700">
                    <TableCell className="font-medium">{s.settlement_name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {s.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm"
                      onClick={() => {
                        setEditType("settlement");
                        setEditData({
                            id: s.id,
                            settlement_name: s.settlement_name,
                            description: s.description
                        });
                        setEditOpen(true);
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" className="ml-2 bg-redBase" onClick={() => handleDelete("settlementType", s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {s_totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-2">
            <div className="text-sm text-zinc-500 mr-4">
              Page {s_currentPage} of {s_totalPages}
            </div>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (s_currentPage > 1) setSCurrentPage(s_currentPage - 1);
                    }}
                    className={
                      s_currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Generate Page Numbers */}
                {[...Array(s_totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Basic logic to show only nearby pages if s_totalPages is large
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === pageNumber}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>  
            <DialogContent className={cn('max-w-[100vw] min-w-fit')}>
                <DialogHeader>
                    <DialogTitle>Edit {editType == "case" ? "Case Type" : "Settlement"}</DialogTitle>
                    <DialogDescription>Adjust the details of the selected {editType == "case" ? "case type" : "settlement"} below.</DialogDescription>
                </DialogHeader>
                    <div className=" overflow-y-auto max-h-[70vh] min-w-fit p-3">
                        <Input type="text" id="" className="w-full" placeholder={editType == "case" ? "Case Name" : "Settlement Name"}
                         value={editType == "case" ? editData.case_name : editData.settlement_name} 
                         onChange={(e) => editType == "case" ? setEditData({ ...editData, case_name: e.target.value }) : setEditData({ ...editData, settlement_name: e.target.value })} />
                        {editType == "case" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between mt-1">
                                { editData?.severity
                                    || "Select severity level..."}
                                <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            
                            <DropdownMenuContent className="w-full min-w-[300px]">
                                <DropdownMenuRadioGroup
                                value={editData?.severity?.toString() || ""}
                                onValueChange={(value) => setEditData({ ...editData, severity: parseInt(value) })}
                                >
                                <DropdownMenuRadioItem value="1">Level 1 - Low (minor disputes)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="2">Level 2 - Moderate (property issues, harassment)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="3">Level 3 - High (threats, physical harm)</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                        <Textarea id="description" className="w-full mt-2" rows={4} placeholder="Description" value={editData?.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                    </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
                    <Button className="bg-redBase"  onClick={() => 
                    handleEditSubmit(editType)}
                    disabled={isPending}>Edit {editType == "case" ? "Case Type" : "Settlement"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
    
  );
}