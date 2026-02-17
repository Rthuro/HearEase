import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Mail, Phone, MapPin, Calendar, User, 
  ShieldCheck, ShieldAlert, Gavel, FileText , Loader2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function CasePerson() {
  const { id } = useParams();
  const {fetchCasePersonById} = useRetrieveUsersStore();
  const { barangays, fetchBarangays } = useAddressesStore();
  const [personData, setPersonData] = useState({});
  const navigate = useNavigate();
  const [refreshLoader, setRefreshLoader] = useState(false);
  const { respondentList, complainantList } = useCaseStore();
  const [loader, setLoader] = useState(false);
  
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

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {barangays.find(b => b.id.toString() === personData?.barangay)?.name || "N/A"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
            { personData?.cases?.length > 0 && (
              <EditCasePerson 
              person_info={personData}
              refresh={handleRefresh} />
            )}
            <Button variant="outline"
            onClick={() => {
                navigate(`/Admin/File-Case/`);
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
                navigate(`/Admin/File-Case/`);
                respondentList.push({
                    first_name: personData.first_name,
                    middle_name: personData.middle_name,
                    last_name: personData.last_name,
                    email: personData.email,
                    contact_number: personData.contact_number,
                    birth_date: personData.birth_date,
                    sex: personData.sex,
                });
            }}>File Case Against</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN: PERSONAL DETAILS --- */}
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email Address</p>
                  <p className="font-medium">{personData?.email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-md">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone Number</p>
                  <p className="font-medium">{personData?.contact_number || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-md">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Address</p>
                  <p className="font-medium">{personData?.street}, {barangays.find(b => b.id.toString() === personData?.barangay)?.name || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Age</span>
                <span className="font-medium">{getAge(personData?.birth_date)} years old</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Birth Date</span>
                <span className="font-medium">{personData?.birth_date || "-"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Sex</span>
                <span className="font-medium">{personData?.sex || "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: CASE HISTORY --- */}
        <div className="md:col-span-2">
          <Tabs defaultValue="cases" className="w-full">
            <TabsList className="w-full justify-start bg-transparent p-0 border-b rounded-none h-auto">
              <TabsTrigger 
                value="cases" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-redBase data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                Case History ({personData?.cases?.length})
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="data-[state=active]:border-b-2 data-[state=active]:border-redBase data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                Notes & Remarks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Date Filed</TableHead>
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
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10 bg-gray-50 text-gray-600">
                                {c?.case_status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-500">{new Date(c?.date_filed).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
                <div className="p-4 text-gray-500 text-center border rounded-lg bg-gray-50">
                    No additional notes for this person.
                </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}