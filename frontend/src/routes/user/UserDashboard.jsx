import { DashboardNotification } from "@/components/DashboardNotification"
import { Greetings } from "@/components/Greetings"
import { TableHearings } from "@/components/TableHearings"
import { Link } from "react-router-dom"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { PageSync } from "@/components/PageSync"
import { Button } from "@/components/ui/button"
import { useCaseStore } from "@/store/useCaseStore"
import { RecentCaseRecords } from "@/components/RecentCaseRecords"
import { useState, useEffect, useActionState, startTransition } from "react"
import useHearingStore from "@/store/useHearingStore"
import { Separator } from "@/components/ui/separator"
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore"
import { Progress } from "@/components/ui/progress"
import AccountVerification from "@/components/AccountVerification"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import IdentitySync from "@/components/IdentitySync"
import { RefreshCw } from "lucide-react"

export function UserDashboard() {
  const { userInfo, userLinkName } = useAuthenticationStore();
  const { cases, fetchUserRelatedCase, relatedCases,testEmail , fetchCases} = useCaseStore();
  const { hearings } = useHearingStore();
  const { userInformation } = useRetrieveUsersStore();

  const [completion, setCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const [res, fetchRelatedCase, loader] = useActionState(fetchUserRelatedCase);
  
  useEffect(() => {
    startTransition(() => {
      fetchRelatedCase();
    });
  }, []);

  const filterHearings = Array.isArray(hearings) 
    ? hearings.filter(h => h.hearing_status === "scheduled") 
    : [];

  const user = userInfo?.role === 'user' ? userLinkName : 'Admin';
  
  useEffect(() => {
    if (!userInformation) return;

    const fieldsToCheck = [
      { key: "birth_date", label: "Birth Date", type: "text" },
      { key: "contact_number", label: "Contact Number", type: "text" },
      { key: "barangay", label: "Barangay", type: "text" },
      { key: "sex", label: "Sex/Gender", type: "text" },
      { key: "is_email_verified", label: "Email Verification", type: "boolean" },
      { key: "is_phone_verified", label: "Phone Verification", type: "boolean" },
      { key: "is_account_verified", label: "Account Verification", type: "boolean" }, 
    ];

    let filledCount = 0;
    const missing = [];

    fieldsToCheck.forEach((field) => {
      const value = userInformation[field.key];

      let isComplete = false;

      if (field.type === "boolean") {
        isComplete = value === true;
      } else {
        isComplete = value && value.toString().trim() !== "";
      }

      if (isComplete) {
        filledCount++;
      } else {
        missing.push(field.label);
      }
    });

    const percentage = Math.round((filledCount / fieldsToCheck.length) * 100);
    
    setCompletion(percentage);
    setMissingFields(missing);

  }, [userInformation]);


  return (
    <div className=" flex flex-col gap-6 p-6">
      <PageSync page="Home" />
      {/* testing */}
      {/* <Button onClick={testEmail} className="bg-redBase w-fit">Test Email</Button> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6" >
      
        <Greetings />

        <div className="flex flex-col gap-3 w-full bg-white rounded-lg border p-6">
          { completion !== 100 && (
            <div className="flex items-center justify-between gap-10">
              <div className="flex flex-col w-full">
                  <p className="text-lg font-semibold text-gray-800">
                      Profile Completion
                  </p>
                  <div className="flex items-center gap-3">
                    <Progress 
                        value={completion} 
                        className="h-2 w-full bg-gray-100" 
                    />
                    <p className={`text-sm w-fit whitespace-nowrap font-medium ${completion === 100 ? "text-green-600" : "text-redBase"}`}>
                      {completion}% complete
                    </p>
                </div>
              </div>

               <Link to={`/${userLinkName}/Settings`}>
                  <Button variant="outline" className="text-sm">Complete profile</Button>
              </Link>
            </div>
            )}

            { userInformation && !userInformation.is_account_verified && (
              <>
                 <Separator />
                  <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                          <p className="text-lg font-medium">Verify your account</p>
                          <p className="text-sm text-zinc-500">Please verify your account to access all features.</p>
                      </div>
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button className="bg-redBase">Verify Now</Button>
                          </DialogTrigger>
                          <DialogContent className="sw-fit">
                              <AccountVerification />     
                          </DialogContent>
                      </Dialog>
                  </div>
              </>
            )}
        </div>
      </div>
      {res?.match_persons?.length > 0 && (
        <IdentitySync cases={res?.cases} match_persons={res?.match_persons} />
      )}

      <div className="flex flex-col gap-4 bg-white border border-zinc-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Upcoming Hearings</h2>
          <Link to={`/${userLinkName}/Hearings`} className="text-redBase text-sm font-medium">
            View all
          </Link>
        </div>
        <TableHearings hearingsList={filterHearings} showPagination={false} navigateTo={user} />
      </div>
      <div className="flex flex-col  gap-4 bg-white border border-zinc-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Case Records</h2>
            <Link to={`/${userLinkName}/CaseRecords`} className="text-redBase text-sm font-medium">
              View all
            </Link>
          </div>
          <RecentCaseRecords cases={cases} user={user} />
      </div>
    </div>
  )
}