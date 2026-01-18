import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Info, FileText } from "lucide-react";
import { useState } from 'react';
import { maskString, formatedBday } from "@/lib/helpers";
import { useUserStore } from "@/store/useUserStore";
import { Loader2 } from "lucide-react";
import { useCaseStore } from "@/store/useCaseStore";
import useAuthenticationStore from "@/store/useAuthenticationStore";

export default function IdentitySync({cases, match_persons}) {
  const { syncUserCases } = useUserStore();
  const { userInfo } = useAuthenticationStore();
  const [selectedCases, setSelectedCases] = useState(cases.map(c => c.id));
  const { fetchUserRelatedCase, fetchCases } = useCaseStore();
  
  const [loading, setLoading] = useState(false);

  const toggleCase = (id) => {
    setSelectedCases(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      await syncUserCases(match_persons, userInfo.email);
      fetchUserRelatedCase();
      fetchCases();
      setLoading(false)
    } catch (error) {
      console.error("Error syncing cases:", error);
    }
  };

  return (
    <div className="relative flex flex-col p-4 gap-4 bg-white border rounded-lg">
      { loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin size-8 text-redBase" />
            </div>
        ) }
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">Is this you?</h1>
        <p className="text-muted-foreground text-sm">
          We found records in our system matching your name.
          Select the cases you would like to sync to your new account.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cases.map((caseItem) => (
          <Card 
            key={caseItem.id} 
            className={`transition-all border ${selectedCases.includes(caseItem.id) ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => toggleCase(caseItem.id)}
          >
            <CardContent className="flex items-start space-x-4" >
              <Checkbox 
                id={caseItem.id}
                checked={selectedCases.includes(caseItem.id)}
                onCheckedChange={() => toggleCase(caseItem.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono font-bold text-sm">{caseItem.id}</span>
                  </div>
                  <Badge variant={caseItem.is_active ? 'default' : 'secondary'}>
                    {caseItem.is_active ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 py-2">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Case Type</p>
                    <p className="text-sm">{caseItem.case_type.case_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Filed Date</p>
                    <p className="text-sm">{formatedBday(caseItem.date_filed)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Parties Involved</p>
                    <p className="text-sm italic text-muted-foreground">
                      {caseItem.complainants.map(p => 
                      (maskString(p.first_name) + " " + maskString(p.last_name))).join(", ") + " vs " + 
                      caseItem.respondents.map(p => 
                      maskString(p.first_name) + " " + maskString(p.last_name)).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Area */}
      <div className="flex justify-center gap-2 my-2">
        <Button 
          className="font-semibold" 
          disabled={selectedCases.length === 0}
          onClick={handleSync}
          size="sm"
        >
          {selectedCases.length > 0 
            ? `Yes, Sync ${selectedCases.length} Record${selectedCases.length > 1 ? 's' : ''}` 
            : "Select records to continue"}
        </Button>
        
        <div className="text-center">
          <Button variant="link" className="text-muted-foreground"
          size="sm">
            No, none of these belong to me
          </Button>
        </div>
      </div>

      {/* Security Note */}
      <Alert variant="outline" className="bg-slate-50 border-none">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-slate-600">
          <strong>Privacy Note:</strong> For security, specific case details are partially masked. You will need to verify your identity via SMS using the contact number associated with this case to gain full access.
        </AlertDescription>
      </Alert>
    </div>
  );
}