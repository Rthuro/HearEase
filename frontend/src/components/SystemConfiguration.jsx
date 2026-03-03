
import React, { useState, useEffect, useActionState, startTransition, useMemo } from "react";
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
import { AppPagination } from "./Pagination";

export function SystemConfiguration() {
  const { fetchCaseTypes, fetchSettlementTypes, fetchRelationshipList,  } = useCaseStore();
  const { updateCaseType, updateSettlementType, addCaseType, addSettlementType, deleteSystemConfig, updateRelationship, addRelationship, fetchCFA, updateCFA, addCFA } = useSystemConfigStore();
  
  const [caseTypes, callCaseTypes, isPending] = useActionState(fetchCaseTypes, []);

  const [settlementTypes, callSettlementTypes, isPendingSettlement] = useActionState(fetchSettlementTypes, []);
  const [relationshipList, callRelationshipList, isPendingRelationship] = useActionState(fetchRelationshipList, []);

  const [cfaTypes, callCFATypes, isPendingCFA] = useActionState(fetchCFA, []);

  const [searchQuery_CaseType, setSearchQuery_CaseType] = useState("");
  const [searchQuery_SettlementType, setSearchQuery_SettlementType] = useState("");
  const [searchQuery_Relationship, setSearchQuery_Relationship] = useState("");

  const [currentPage_CaseType, setCurrentPage_CaseType] = useState([]);
  const [currentPage_SettlementType, setCurrentPage_SettlementType] = useState([]);
  const [currentPage_Relationship, setCurrentPage_Relationship] = useState([]);

  const [submitLoader, setSubmitLoader] = useState(false);

  // 4. Initial Data Fetch
  useEffect(() => {
    startTransition(() => {
      callCaseTypes();
      callSettlementTypes();
      callRelationshipList();
      callCFATypes();
    });
  }, [callCaseTypes, callSettlementTypes, callRelationshipList, callCFATypes]);



  const filteredCaseTypes = useMemo(() => {
    return caseTypes.filter((c) =>
      c.case_name.toLowerCase().includes(searchQuery_CaseType.toLowerCase())
    );
  }, [caseTypes, searchQuery_CaseType]);

  const filteredSettlementTypes = useMemo(() => {
    return settlementTypes.filter((s) => {
      return s.settlement_name.toLowerCase().includes(searchQuery_SettlementType.toLowerCase());
    });
  }, [settlementTypes, searchQuery_SettlementType]);

  const filteredRelationships = useMemo(() => {
    return relationshipList?.filter((r) => {
      return r.relationship.toLowerCase().includes(searchQuery_Relationship.toLowerCase());
    }) || [];
  }, [relationshipList, searchQuery_Relationship]);

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

  const [c_open, setCOpen] = useState(false);
  const [c_descrip, setCDescrip] = useState("");
  const [c_name, setCName] = useState("");
  const [c_severity, setCSeverity] = useState("");
  
  const [s_open, setSOpen] = useState(false);
  const [s_descrip, setSDescrip] = useState("");
  const [s_name, setSName] = useState("");

  const [cfa_open, setCFAOpen] = useState(false);
  const [cfa_description, setCFA_Description] = useState("");
  const [cfa_name, setCFAName] = useState("");

  const [r_open, setROpen] = useState(false);
  const [r_name, setRName] = useState("");


  const [editType, setEditType] = useState("case");
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const handleAddSubmit = async (type) => {
    try {
      setSubmitLoader(true);
      const promiseFunction = type === "case" ? 
        addCaseType({ case_name: c_name, description: c_descrip, severity: c_severity }) : 
      type === "settlement" ? 
        addSettlementType({ settlement_name: s_name, description: s_descrip }) : 
      type === "relationship" ?
      addRelationship({ relationship: r_name }) :
      addCFA({ cfa: cfa_name, description: cfa_description });

      const callFunction = type === "case" ? callCaseTypes : type === "settlement" ? callSettlementTypes : type === "cfa" ? callCFATypes : callRelationshipList;

      const openFunction = type === "case" ? setCOpen : type === "settlement" ? setSOpen : type === "cfa" ? setCFAOpen : setROpen;

      toast.promise(
        promiseFunction,
        {
          loading: `Adding ${type === "case" ? "case type" : type === "settlement" ? "settlement type" : type === "cfa" ? "CFA type" : "relationship"}...`,
          success: () => {
              openFunction(false);
              startTransition(() => {
                  callFunction();
              });
              return `${type === "case" ? "Case type" : type === "settlement" ? "Settlement type" : type === "cfa" ? "CFA type" : "Relationship"} added successfully!`;
          },
          error: `Failed to add ${type === "case" ? "case type" : type === "settlement" ? "settlement type" : type === "cfa" ? "CFA type" : "relationship"}.`,
        }
      );

    } catch (error) {
      console.error("Add configuration error:", error);
    } finally {
      setSubmitLoader(false);
    }
  }

  const handleDelete = async (configType, configId) => {
    toast.promise(
      deleteSystemConfig(configType, configId),
      {
        loading: `Deleting ${configType === "caseType" ? "case type" : configType === "settlementType" ? "settlement type" : configType === "cfaType" ? "CFA type" : "relationship"}...`,
        success: () => {
            startTransition(() => {
                callCaseTypes();
                callSettlementTypes();
                callRelationshipList();
                callCFATypes();
            });
            return `${configType === "caseType" ? "Case type" : configType === "settlementType" ? "Settlement type" : configType === "cfaType" ? "CFA type" : "Relationship"} deleted successfully!`;
        },
        error: `Failed to delete ${configType === "caseType" ? "case type" : configType === "settlementType" ? "settlement type" : configType === "cfaType" ? "CFA type" : "relationship"}.`,
      }
    );
  }

  const handleEditSubmit = async (type) => {
        const promiseFunction = type === "case" ? updateCaseType(editData.id, editData) : type === "settlement" ? updateSettlementType(editData.id, editData) : type === "cfa" ? updateCFA(editData.id, editData) : updateRelationship(editData.id, editData);
        const callFunction = type === "case" ? callCaseTypes : type === "settlement" ? callSettlementTypes : type === "cfa" ? callCFATypes : callRelationshipList;

        toast.promise(
          promiseFunction,
          {
              loading: `Updating ${type === "case" ? "case type" : type === "settlement" ? "settlement type" : type == "cfa" ? "CFA" : "relationship"}...`,
              success: () => {
                  setEditOpen(false);
                  startTransition(() => {
                      callFunction();
                  }
                  );
                  setEditData({});
                  return `${type === "case" ? "case type" : type === "settlement" ? "settlement type" : type == "cfa" ? "CFA" : "relationship"} updated successfully!`;
              },
              error: `Failed to update ${type === "case" ? "case type" : type === "settlement" ? "settlement type" : type == "cfa" ? "CFA" : "relationship"}.`,
          }
        );
    }

  return (
    <div className="flex-1 flex flex-col gap-3 mt-3">
      {/* Header Section */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">System Configuration</h2>
      </div>
        
      <section className="flex flex-col gap-3 bg-white rounded-lg p-4 border shadow-sm">
        <p className="font-bold flex items-center">
            Case Types
            {(isPending) && (
              <span className="flex items-center justify-center ml-1">
                <Loader2 className="animate-spin h-4 w-4 text-red-600" />
              </span>
            )}
        </p>
        <div className="flex items-center justify-between gap-4">
          <Input
            type="text"
            placeholder="Search case type..."
            className="w-full max-w-sm"
            value={searchQuery_CaseType}
            onChange={(e) => setSearchQuery_CaseType(e.target.value)}
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
                        disabled={submitLoader}>Add Case</Button>
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
              {currentPage_CaseType.map((c) => (
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
        
        <AppPagination 
        item_per_page={5} 
        items={filteredCaseTypes} 
        searchQuery={searchQuery_CaseType} 
        setPagedItems={setCurrentPage_CaseType} />
      </section>

      <section className="flex flex-col gap-3 bg-white rounded-lg p-4 border shadow-sm">
        <p className="font-bold flex items-center">
            Settlement Types
            {(isPendingSettlement) && (
              <span className="flex items-center justify-center ml-1">
                <Loader2 className="animate-spin h-4 w-4 text-red-600" />
              </span>
            )}
          </p>
          <div className="flex items-center justify-between gap-4">
              <Input
                type="text"
                placeholder="Search settlement type..."
                className="w-full max-w-sm"
                value={searchQuery_SettlementType}
                onChange={(e) => setSearchQuery_SettlementType(e.target.value)}
              />
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
                          <Button className="bg-redBase"  
                            onClick={() => handleAddSubmit("settlement")}
                            disabled={submitLoader}
                          >Add Settlement</Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
          </div>

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
              {currentPage_SettlementType.map((s) => (
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

        <AppPagination 
        item_per_page={5} items={filteredSettlementTypes} searchQuery={searchQuery_SettlementType} 
        setPagedItems={setCurrentPage_SettlementType} />
      </section>

      <section className="flex flex-col gap-3 bg-white rounded-lg p-4 border shadow-sm">
        <p className="font-bold flex items-center">
            Case Relationship Types
            {(isPendingRelationship) && (
              <span className="flex items-center justify-center ml-1">
                <Loader2 className="animate-spin h-4 w-4 text-red-600" />
              </span>
            )}
        </p>
        <div className="flex items-center justify-between gap-4">
          <Input
            type="text"
            placeholder="Search case relationship type..."
            className="w-full max-w-sm"
            value={searchQuery_Relationship}
            onChange={(e) => setSearchQuery_Relationship(e.target.value)}
          />
          <Dialog open={r_open} onOpenChange={setROpen}>
                <DialogTrigger asChild>     
                    <Button className="bg-redBase">
                        <Plus className="w-4 h-4 mr-1" /> Add Case Relationship Type
                    </Button>
                </DialogTrigger>
                <DialogContent className={cn('max-w-[100vw] min-w-fit')}>
                    <DialogHeader>
                        <DialogTitle>Add Case Relationship Type</DialogTitle>
                        <DialogDescription>Add a new case relationship type. These case relationship types will be available for selection in the system configuration.
                        </DialogDescription>
                    </DialogHeader>
                        <div className=" overflow-y-auto max-h-[70vh] min-w-fit p-3">
                            <Input type="text" id="case_name" className="w-full" placeholder="Case Name" value={r_name} onChange={(e) => setRName(e.target.value)} />
                        </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setROpen(false)}>Close</Button>
                        <Button className="bg-redBase"  
                        onClick={() => handleAddSubmit("relationship")}
                        disabled={submitLoader}
                        >Add Case Relationship Type</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead>Relationship</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPage_Relationship.map((r) => (
                  <TableRow key={r.id} className="text-zinc-700">
                    <TableCell className="font-medium">{r.relationship}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm"
                      onClick={() => {
                        setEditType("relationship");
                        setEditData({
                            id: r.id,
                            relationship: r.relationship
                        });
                        setEditOpen(true);
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" className="ml-2 bg-redBase" onClick={() => handleDelete("relationship", r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        
        <AppPagination 
        item_per_page={5} items={filteredRelationships} searchQuery={searchQuery_Relationship} 
        setPagedItems={setCurrentPage_Relationship} />
      </section>

      <section className="flex flex-col gap-3 bg-white rounded-lg p-4 border shadow-sm">
        <p className="font-bold flex items-center">
            Certificate to File Action Types
            {(isPendingCFA) && (
              <span className="flex items-center justify-center ml-1">
                <Loader2 className="animate-spin h-4 w-4 text-red-600" />
              </span>
            )}
          </p>
          <Dialog open={cfa_open} onOpenChange={setCFAOpen}>
              <DialogTrigger asChild>     
                  <Button className="bg-redBase place-self-end">
                      <Plus className="w-4 h-4 mr-1" /> Add CFA Type
                  </Button>
              </DialogTrigger>
              <DialogContent className={cn('max-w-[100vw] min-w-fit')}>
                  <DialogHeader>
                      <DialogTitle>Add CFA Type</DialogTitle>
                      <DialogDescription>Add a new CFA type. These CFA types will be available for selection in the system configuration.</DialogDescription>
                  </DialogHeader>
                      <div className=" overflow-y-auto max-h-[70vh] min-w-fit p-3">
                          <Input type="text" id="cfa_name" className="w-full" placeholder="CFA Name" value={cfa_name} onChange={(e) => setCFAName(e.target.value)} />
                          <Textarea id="description" className="w-full mt-2" rows={4} placeholder="Description" value={cfa_description} onChange={(e) => setCFA_Description(e.target.value)} />
                      </div>
                  <DialogFooter>
                      <Button variant="outline" onClick={() => setCFAOpen(false)}>Close</Button>
                      <Button className="bg-redBase"  
                        onClick={() => handleAddSubmit("cfa")}
                        disabled={submitLoader}
                      >Add CFA Type</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead>Certificate to File Action Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cfaTypes.map((cfa) => (
                  <TableRow key={cfa.id} className="text-zinc-700">
                    <TableCell className="font-medium">{cfa.cfa}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {cfa.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm"
                      onClick={() => {
                        setEditType("cfa");
                        setEditData({
                            id: cfa.id,
                            cfa: cfa.cfa,
                            description: cfa.description
                        });
                        setEditOpen(true);
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" className="ml-2 bg-redBase" onClick={() => handleDelete("cfa", cfa.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>  
          <DialogContent className={cn('max-w-[100vw] min-w-fit')}>
              <DialogHeader>
                  <DialogTitle>Edit {editType}</DialogTitle>
                  <DialogDescription>Adjust the details of the selected {editType} below.</DialogDescription>
              </DialogHeader>
                  <div className=" overflow-y-auto max-h-[70vh] min-w-fit p-3">
                      <Input type="text" id="" className="w-full" placeholder={editType}

                        value={editType == "case" ? editData.case_name : editType == "settlement" ? editData.settlement_name : editType == "relationship" ? editData.relationship : editData.cfa} 
                        onChange={(e) => 
                        editType == "case" ? setEditData({ ...editData, case_name: e.target.value }) : editType == "settlement" ? setEditData({ ...editData, settlement_name: e.target.value }) : editType == "relationship" ? setEditData({ ...editData, relationship: e.target.value }) : setEditData({ ...editData, cfa: e.target.value })} />
                      
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

                      { (editType == "case" || editType == "settlement" || editType == "cfa") && (
                        <Textarea id="description" className="w-full mt-2" rows={4} placeholder="Description" value={editData?.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                      )}
                  </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
                  <Button className="bg-redBase"  onClick={() => 
                  handleEditSubmit(editType)}
                  disabled={submitLoader}>Edit {editType}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
    
  );
}