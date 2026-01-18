import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/store/useUserStore";
import { Loader2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";

export default function NotificationSettings() {
    const [ displayLoading, setDisplayLoading ] = useState(true);
    const [ loading, setLoading ] = useState(false);
    const { notificationSettings, fetchNotificationSettings, patchNotificationSettings } = useUserStore();

    const [settings, setSettings] = useState(notificationSettings || {
        allow_email: true,
        allow_sms: true,
    });

    useEffect(() => {
        setDisplayLoading(true);
        if(!notificationSettings) {
            fetchNotificationSettings();
        }
        setDisplayLoading(false);        
    }, [notificationSettings]);

    // Handle Toggle
    const toggleSetting = async (key) => {
        const newValue = !notificationSettings[key];
        
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            setLoading(true);
            await patchNotificationSettings({ [key]: newValue });
            setLoading(false);

        } catch (error) {
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    return ( 
        <div className="relative flex-1 flex flex-col gap-4 px-6 py-6">

        { displayLoading ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin size-6 text-redBase" />
            </div>
        ) : (null)}

        { loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin size-8 text-redBase" />
            </div>
        ) }
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-medium">Notifications</h2>
                <p className=" text-zinc-500">Manage your notification preferences</p>
            </div>
        <Card className="py-3 rounded-sm gap-2 mb-3">
            <CardContent className="px-0">
                <div id="contact" className="flex flex-col gap-3">
                    <div className="flex justify-between px-3">
                        <Label htmlFor="email-notif"
                        className="flex items-center gap-2">Email Notifications</Label>
                        <Switch 
                            id="email-notif" 
                            checked={settings.allow_email}
                            onCheckedChange={() => toggleSetting('allow_email')}
                        />
                    </div>
                    <Separator />
                    <div className="flex justify-between px-3">
                        <Label htmlFor="sms-notif" className="flex items-center gap-2">SMS Notifications</Label>
                        <Switch 
                            id="sms-notif" 
                            checked={settings.allow_sms}
                            onCheckedChange={() => toggleSetting('allow_sms')}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
        </div>
    );
}