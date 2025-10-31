import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PageSync } from "@/components/PageSync";
import { CaseStatusDisplay } from "@/components/CaseStatusDisplay";
import { userInfo } from "@/store/useLogin";
import { useEffect, useState } from "react";

export function Profile(){
    const [user, setUser] = useState(null);

    useEffect(() => {
    const fetchUser = async () => {
      const data = await userInfo();
      if (data) setUser(data);
    };

    fetchUser();
  }, []);

    const formatedBday = (dateString) => {
        if(!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    console.log(user);

    const personalInfo = [
            {
            section: "Personal Information",
            details: [
                {
                    label: "Full Name",
                    value: `${user?.first_name} ${user?.middle_name ? user?.middle_name + ' ' : ''}${user?.last_name}`
                },
                {
                    label: "Gender",
                    value: user?.sex || '-'
                },
                {
                    label: "Birth Date",
                    value: formatedBday(user?.birth_date)
                },
                {
                    label: "Contact",
                    value: user?.contact_number || '-'
                },
                {  
                    label: "Address",
                    value: `${user?.street}, ${user?.barangay}${user?.additional_info ? ', ' + user?.additional_info : ''}`
                },
            ]
        },
    ]
    return (
        <div className="flex flex-col gap-4 p-6 bg-white">
            <PageSync page="Profile" />
        {personalInfo.map((section) => (
                        <div key={section.section} className="flex flex-col gap-4">
                            <h2 className="text-lg font-medium">{section.section}</h2>
                            <div className="grid grid-cols-4 gap-4">
                                {section.details.map((detail) => (
                                    <div key={detail.label} 
                                    className={`flex flex-col gap-1 
                                    ${detail.label === 'Description' ? 'col-span-2' : ''}
                                    ${detail.label === 'Documents' ? 'col-span-4' : ''}`}>
                                        <Label className={cn("text-zinc-600 font-normal text-xs")}>
                                            {detail.label}
                                        </Label>
                                        {detail.label === 'Status'? <CaseStatusDisplay caseStatus={detail.value} /> : 
                                            <p>{detail.value}</p> }
                                    </div>
                                ))}
                            </div>
        
        
                        </div>
        ))}
        </div>
    )
}