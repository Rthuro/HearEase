import { Label } from "@/components/ui/label";
import { PageSync } from "@/components/PageSync";
import { userInfo } from "@/store/useLogin";
import { useEffect, useState } from "react";
import { User2, Bell, LockKeyhole, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLuponStore } from "@/store/useLuponStore";

export function Settings(){
    const [user, setUser] = useState(null);
    const [ account, switchAccount ] = useState(true);
    const [ notifications, switchNotifications ] = useState(false);
    const { members } = useLuponStore();

    const stored = localStorage.getItem("authData");
    const data = JSON.parse(stored);
    const userRole = data.userRole;

    useEffect(() => {
        if (userRole !== "admin") {
            const fetchUser = async () => {
            const data = await userInfo();
            if (data) setUser(data);
            };

            fetchUser();
        } 
    }, []);

    const lupon = members.find(member => member.id === data?.id);
    




    return (
        <div className="flex bg-white h-full">
            <PageSync page="Profile" />
            
            <div className="flex flex-col gap-3 h-full border-r px-6 py-6">
                <button onClick={() => {
                    switchAccount(true)
                    switchNotifications(false)
                }} className="flex items-center gap-2">
                    <User2 className="size-4" />
                    Account Information
                </button>
                <button onClick={() => {
                    switchNotifications(true)
                    switchAccount(false)
                    }}
                    className="flex items-center gap-2">
                    <Bell className="size-4" />
                    Notifications
                </button>

            </div>

            { account && (
                <div className="flex-1 flex flex-col gap-6 py-6">
                    <div className="flex flex-col gap-4 px-6">
                        <h2 className="text-lg font-medium">Account Informaton</h2>
                        <div className="flex flex-col gap-2">
                            <Label>Email</Label>
                            {user?.email || ''}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Phone</Label>
                            {user?.contact_number || ''}
                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 px-6">
                        <button className="flex items-center gap-2 ">
                            <LockKeyhole className="size-4" />
                            Change Password
                        </button>
                        <button className="flex items-center gap-2 text-red-600 hover:underline">
                            <LogOut className="size-4" />
                            Logout  
                        </button>
                    </div>
                </div>
            )}

            
        </div>
    )
}