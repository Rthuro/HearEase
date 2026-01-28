import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/store/useUserStore";

export default function PhoneVerification({user, setUser, handleUpdate, handleReset, formatTime, contactNumber, setContactNumber}) {
    const [phoneVerification, setPhoneVerification] = useState(false);
    const [phoneCode, setPhoneCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const { fetchUser, sendOTP, verifyOTP } = useUserStore();

    const contactHasChanges = 
        contactNumber !== (user?.contact_number || "");
    
    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
    
        if (timeLeft === 0) return;

        const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const handleSendCode = async () => {
        if (!user?.contact_number) {
            toast.error("No contact number found.");
            return;
        }

        setLoading(true);
        
        let phoneNumber = user.contact_number;
        if (phoneNumber.startsWith("0")) {
            phoneNumber = "+63" + phoneNumber.substring(1);
        }
        
        setPhoneVerification(true);
        await sendOTP(phoneNumber, "phone");
        setTimeLeft(600); 
        setLoading(false);

    };

    const handleVerifyPhoneOTP = async (code) => {
        if (code.length !== 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        };

        setVerifyLoading(true);
        await verifyOTP(code, "phone");
        fetchUser().then((data) => setUser(data));
        setVerifyLoading(false);
        setPhoneVerification(false);
        setPhoneCode("");
    };

    return (
        <div className="flex flex-col gap-2">
        <Card className="py-3 rounded-sm gap-2 mb-3">
            <CardContent className="px-0">
                <div id="contact" className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2 px-3">
                        <Label htmlFor="contact_number" className="flex items-center gap-2">
                            Contact Number
                            {user?.contact_number && (
                                user?.is_phone_verified ? (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        Verified
                                    </span>
                                ) : (
                                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        Unverified
                                    </span>
                                )
                            )}
                        </Label>
                            
                        <Input
                            id="contact_number"
                            type="text"
                            placeholder="09XXXXXXXXX"
                            value={contactNumber}
                            maxLength={11}
                            onChange={(e) => setContactNumber(e.target.value)}
                        />
                    </div>
                    <Separator />
                    <div className="flex gap-2 items-end justify-end px-3">
                            {!phoneVerification && !user?.is_phone_verified && (
                                <Button onClick={handleSendCode} disabled={loading} size="sm" className="bg-redBase text-white">
                                    {loading ? "Sending..." : "Verify Phone Number"}
                                </Button>
                            )}

                            {contactHasChanges ? (
                                <>
                                    <Button onClick={() => handleUpdate("contact")} size="sm" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin size-5" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                     <Button variant="outline" size="sm" onClick={() => handleReset("contact")}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    {user?.contact_number ? "Change" : "Add Number"}
                                </Button>
                            )}
                        </div>
                    
                </div>
            </CardContent>
        </Card>

        {phoneVerification && (
            <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-fit flex flex-col gap-1">
                    <p className="font-medium text-lg">Verification Code</p>
                    <p className="text-sm text-zinc-600">
                        Verification code has been sent to <b>{user?.contact_number}</b>. 
                        Please enter the code below to verify your phone number.
                    </p>
                </div>
                <Card className="py-3 rounded-sm gap-2 mb-3">
                    <CardContent className="px-0">
                        <div id="contact" className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-2 px-3">
                                <Label htmlFor="phoneCode" className="flex items-center gap-2 mt-2">
                                    Phone Verification Code
                                </Label>
                                    
                                <Input
                                    id="phoneCode"
                                    type="text"
                                    placeholder="123456"
                                    value={phoneCode}
                                    maxLength={6}
                                    className="tracking-widest font-mono text-center font-bold"
                                    onChange={(e) => setPhoneCode(e.target.value)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between px-3">
                                <p className="text-zinc-600 text-sm text-center">
                                    Didn't receive a code?{" "}
                                    
                                    {timeLeft > 0 ? (
                                        <span className="text-zinc-400 cursor-not-allowed font-medium">
                                            Resend in {formatTime(timeLeft)}
                                        </span>
                                    ) : (
                                        <button 
                                            className="text-redBase underline font-medium hover:text-red-700 transition-colors" 
                                            onClick={handleSendCode}
                                            disabled={loading}
                                        >
                                            {loading ? "Sending..." : "Resend Code"}
                                        </button>
                                    )}
                                </p>
                                <div className="flex gap-3">
                                    <Button 
                                        size="sm" 
                                        className="bg-redBase hover:bg-red-700 text-white self-end"
                                        onClick={() => handleVerifyPhoneOTP(phoneCode)}
                                        disabled={verifyLoading || phoneCode.length < 6}
                                    >
                                        {verifyLoading ? "Verifying..." : "Confirm"}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setPhoneVerification(false)}
                                        disabled={verifyLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
        </div>
    );
}