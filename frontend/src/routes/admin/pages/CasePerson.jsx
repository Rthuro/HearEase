import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Mail, Phone, MapPin, Calendar, User, 
  ShieldCheck, ShieldAlert, Gavel, FileText , Loader2, Info,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";
import toast from "react-hot-toast";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useAddressesStore } from "@/store/useAddressStore";
import { useCaseStore } from "@/store/useCaseStore";
import { SendEmailDialog } from "@/components/SendEmailDialog";
import { EditCasePerson } from "@/components/EditCasePerson";
import { nanoid } from 'nanoid'
import { SendSmsDialog } from "@/components/SendSmsDialog";
import { DeleteCaseModal } from "@/components/DeleteCaseModal";

export function CasePerson() {
  const { id } = useParams();
  const {fetchCasePersonById} = useRetrieveUsersStore();
  const { barangays, fetchBarangays } = useAddressesStore();
  const [personData, setPersonData] = useState({});
  const navigate = useNavigate();
  const [refreshLoader, setRefreshLoader] = useState(false);
  const { respondentList, complainantList } = useCaseStore();
  const [loader, setLoader] = useState(false);
  const [caseNumber] = useState(() => 'CASE-' + nanoid(10));
  
    useEffect(() => {
        setLoader(true);

        const loadInitialData = async () => {
            try {
                const data = await fetchCasePersonById(id);
                setPersonData(data);

                if (barangays.length === 0) {
                    await fetchBarangays();
                }
            } catch (error) {
                toast.error("Error fetching data: " + error.message);
            } finally {
                setLoader(false);
            }
        };

        loadInitialData();
    }, [id]);

    const casesOrder = [...(personData?.cases || [])].sort((a, b) => {
      return new Date(b.date_filed) - new Date(a.date_filed);
    });


    const handleRefresh = () => {
        try{
            setRefreshLoader(true);
            fetchCasePersonById(id).then((data) => {
                setPersonData(data);
                toast.success("Data refreshed successfully");
            }).catch((error) => {
                toast.error("Error refreshing data:", error);
            }).finally(() => {
                setRefreshLoader(false);
            });
        } catch (error) {
            toast.error("Error refreshing data:", error);
            setRefreshLoader(false);
        }
    }

  const getAge = (dateString) => {
    if (!dateString) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ChevronLeft />
            </Button>

            <div className="flex items-center gap-2">
                {personData?.email && (
                <SendEmailDialog 
                    recipientEmail={personData?.email} 
                    recipientName={`${personData?.first_name} ${personData?.last_name}`} 
                />
                )}
                {personData?.contact_number && (
                  <SendSmsDialog 
                      recipientNumber={personData?.contact_number} 
                      recipientName={`${personData?.first_name} ${personData?.last_name}`} 
                  />
                )}
                <Button variant="outline" onClick={handleRefresh} disabled={refreshLoader}>
                    <RefreshCw className={refreshLoader ? "animate-spin" : ""} />
                    Refresh
                </Button>
            </div>
            
        </div>

        {loader && (
            <div className="flex items-center justify-center py-3">
                <Loader2 className="animate-spin" size={24} />
                <span className="ml-2 text-zinc-500">Retrieving case person data...</span>
            </div>
        )}
        
        <Card className="overflow-hidden border-zinc-200 shadow-sm ">
          <CardHeader className="pb-0 border-b flex justify-between ">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {personData?.first_name} {personData?.middle_name} {personData?.last_name}
                    </h1>
                    <div className="flex gap-2 mt-1">
                      {personData?.email ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Registered User</Badge>
                      ) : (
                        <Badge variant="secondary">Unregistered / Walk-in</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  
                  <Button variant="outline"
                  onClick={() => {
                      navigate(`/Admin/File-Case/${caseNumber}`);
                      complainantList.push({
                          first_name: personData.first_name,
                          middle_name: personData.middle_name,
                          last_name: personData.last_name,
                          email: personData.email,
                          contact_number: personData.contact_number,
                          birth_date: personData.birth_date,
                          sex: personData.sex,
                      });
                  }}>
                    File Case
                  </Button>
                  <Button className="bg-redBase text-white hover:bg-red-700"
                  onClick={() => {
                      navigate(`/Admin/File-Case/${caseNumber}`);
                      respondentList.push({
                          first_name: personData.first_name,
                          middle_name: personData.middle_name,
                          last_name: personData.last_name,
                          email: personData.email,
                          contact_number: personData.contact_number,
                          birth_date: personData.birth_date,
                          sex: personData.sex,
                      });
                  }}>File Case Against
                  </Button>
                  <EditCasePerson 
                    person_info={personData}
                    refresh={handleRefresh} />
              </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Left Section: Contact Info */}
              <div className="px-6 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  Contact Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-full">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-medium">Email Address</p>
                      <p className="text-sm font-semibold text-zinc-700">{personData?.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-emerald-50 text-emerald-600 rounded-full">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-medium">Phone Number</p>
                      <p className="text-sm font-semibold text-zinc-700">{personData?.contact_number || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-amber-50 text-amber-600 rounded-full">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-medium">Residential Address</p>
                      <p className="text-sm font-semibold text-zinc-700 leading-snug">
                        {personData?.street}, {barangays.find(b => b.name === personData?.barangay)?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Basic Info */}
              <div className="px-6 bg-zinc-50/30 md:border-l border-t md:border-t-0 border-zinc-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
                  Demographics
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-600">Age</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-700 bg-white px-2 py-1 rounded border shadow-sm">
                        {getAge(personData?.birth_date)} years
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-600">Birth Date</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-700">{personData?.birth_date || "-"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-600">Sex</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 capitalize">{personData?.sex || "-"}</span>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* --- RIGHT COLUMN: CASE HISTORY --- */}
        <section className="flex flex-col gap-3 mt-3 bg-white border border-zinc-200 rounded-lg p-6">
          <p> Case History ({personData?.cases?.length})</p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Date Filed</TableHead>
                  <TableHead ></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {casesOrder?.map((c) => (
                  <TableRow key={c?.id}>
                    <TableCell className="font-medium">
                      <Link to={`/Admin/Case/${c?.id}`} className="text-blue-600 hover:underline">
                          {c?.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {c?.complainants?.find(comp => comp.id === personData?.id) ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none">Complainant</Badge>
                      ) : (
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none shadow-none">Respondent</Badge>
                      )}
                    </TableCell>
                    <TableCell>{c?.case_type?.case_name}</TableCell>
                    <TableCell>
                      <CaseStatusDisplay caseStatus={c?.case_status} />
                    </TableCell>
                    <TableCell className="text-center text-gray-500">{new Date(c?.date_filed).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                       <DeleteCaseModal case_id={c.id} />    
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

      </div>
  );
}