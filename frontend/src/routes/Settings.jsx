import { Label } from "@/components/ui/label";
import { PageSync } from "@/components/PageSync";
import { userInfo } from "@/store/useLogin";
import { useEffect, useState } from "react";
import { User2, Bell, LockKeyhole, LogOut, Calendar, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLuponStore } from "@/store/useLuponStore";
import { useGoogleCalendarStore } from "@/store/useGoogleCalendarStore";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export function Settings() {
    const [user, setUser] = useState(null);
    const [account, switchAccount] = useState(true);
    const [notifications, switchNotifications] = useState(false);
    const [integrations, switchIntegrations] = useState(false);
    const { members } = useLuponStore();
    const [searchParams] = useSearchParams();

    const {
        connected,
        connectedUser,
        loading,
        syncing,
        lastUpdated,
        checkStatus,
        connectGoogleCalendar,
        disconnect,
        syncAll
    } = useGoogleCalendarStore();

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

        // Check Google Calendar status
        checkStatus();

        // Handle OAuth callback params
        const googleConnected = searchParams.get('google_connected');
        const googleError = searchParams.get('google_error');

        if (googleConnected === 'true') {
            toast.success('Google Calendar connected successfully!');
            switchIntegrations(true);
            switchAccount(false);
            checkStatus();
        }
        if (googleError) {
            toast.error(`Google Calendar error: ${googleError}`);
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
                    switchIntegrations(false)
                }} className={`flex items-center gap-2 ${account ? 'text-redBase font-medium' : ''}`}>
                    <User2 className="size-4" />
                    Account Information
                </button>
                <button onClick={() => {
                    switchNotifications(true)
                    switchAccount(false)
                    switchIntegrations(false)
                }}
                    className={`flex items-center gap-2 ${notifications ? 'text-redBase font-medium' : ''}`}>
                    <Bell className="size-4" />
                    Notifications
                </button>
                {userRole === "admin" && (
                    <button onClick={() => {
                        switchIntegrations(true)
                        switchAccount(false)
                        switchNotifications(false)
                    }}
                        className={`flex items-center gap-2 ${integrations ? 'text-redBase font-medium' : ''}`}>
                        <Calendar className="size-4" />
                        Integrations
                    </button>
                )}

            </div>

            {account && (
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

            {integrations && userRole === "admin" && (
                <div className="flex-1 flex flex-col gap-6 py-6 px-6">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-medium">Integrations</h2>

                        {/* Google Calendar Section */}
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="size-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Google Calendar</h3>
                                        <p className="text-sm text-gray-500">
                                            Sync hearings to Google Calendar
                                        </p>
                                    </div>
                                </div>

                                {loading ? (
                                    <Loader2 className="size-5 animate-spin text-gray-400" />
                                ) : connected ? (
                                    <span className="flex items-center gap-1 text-green-600 text-sm">
                                        <Check className="size-4" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                                        <X className="size-4" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            {connected && (
                                <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
                                    <p><strong>Connected as:</strong> {connectedUser}</p>
                                    {lastUpdated && (
                                        <p className="text-gray-500">
                                            Last synced: {new Date(lastUpdated).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                {connected ? (
                                    <>
                                        <Button
                                            onClick={syncAll}
                                            disabled={syncing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {syncing ? (
                                                <>
                                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                                    Syncing...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="size-4 mr-2" />
                                                    Sync All Hearings
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={disconnect}
                                            disabled={loading}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            Disconnect
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={connectGoogleCalendar}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {loading ? (
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                        ) : (
                                            <Calendar className="size-4 mr-2" />
                                        )}
                                        Connect Google Calendar
                                    </Button>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-400">
                            When connected, all hearing schedules will automatically sync to a dedicated
                            "HearEase Hearings" calendar in Google Calendar.
                        </p>
                    </div>
                </div>
            )}


        </div>
    )
}
