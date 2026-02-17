import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useUserStore } from "@/store/useUserStore";
import { Loader2 } from "lucide-react";
import { useCaseStore } from "@/store/useCaseStore";
import useAuthenticationStore from "@/store/useAuthenticationStore";

export default function IdentitySync({cases, match_persons}) {
  const { syncUserCases, showSync,setShowSync, loading } = useUserStore();
  const { userInfo } = useAuthenticationStore();
  const [selected, setSelected] = useState(match_persons.map(c => c.id));
  const { fetchUserRelatedCase, fetchCases } = useCaseStore();

  const toggleCase = (id) => {
    setSelected(prev => 
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

  const involvedCases = (p) => {
    return cases?.filter(c => 
    c.complainants?.some(comp => comp.id === p.id) || 
    c.respondents?.some(resp => resp.id === p.id)
  ) || [];
  }


  return (
    <div className={`relative flex flex-col p-4 gap-4 bg-white border rounded-lg ${showSync ? '' : 'hidden'}`}>
      { loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin size-8 text-redBase" />
            </div>
        ) }
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">Is this you?</h1>
        <p className="text-muted-foreground text-sm">
          We found records in our system matching your name.
          Select the records you would like to sync to your new account.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {match_persons.map((person) => (
          <Card 
            key={person.id} 
            className={`transition-all border py-3 w-fit ${selected.includes(person.id) ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => toggleCase(person.id)}
          >
            <CardContent className="flex items-start space-x-4" >
              <Checkbox 
                id={person.id}
                checked={selected.includes(person.id)}
                onCheckedChange={() => toggleCase(person.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">                
                <div className="grid grid-cols-2 gap-y-1">
                  <p className=" font-semibold">{person.first_name + " " + person.last_name}</p>
                  <div className="col-span-2">
                    <p className="text-xs uppercase text-muted-foreground font-semibold">Cases Involved ({involvedCases(person)?.length || 0})</p>
                    <p className="text-sm italic text-muted-foreground">
                      {involvedCases(person).map(c => c.id).join(", ")}
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
          disabled={selected.length === 0}
          onClick={handleSync}
          size="sm"
        >
          {selected.length > 0 
            ? `Yes, Sync ${selected.length} Record${selected.length > 1 ? 's' : ''}` 
            : "Select records to continue"}
        </Button>
        
        <div className="text-center">
          <Button variant="link" className="text-muted-foreground"
          size="sm" onClick={() => setShowSync(false)}>
            No, none of these belong to me
          </Button>
        </div>
      </div>
    </div>
  );
}