import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanQrCode } from "lucide-react";
export function CaseStatus() {
    return (
        <div>
            <div className="flex flex-col gap-2 max-w-[500px] mx-auto">
                <p className="font-medium text-2xl text-redBase">Enter Case Number</p>
                <div className="flex items-center gap-2">
                    <Input type="text" placeholder="Case Number" />
                    <Button className="!bg-redBase text-white cursor-pointer">Check Status</Button>
                </div>
                {/* <p className=" text-center my-3 text-lg text-zinc-600">or</p>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                        <ScanQrCode className="text-redBase" />
                        <p className="text-lg">Scan case number QR code</p>
                    </div>
                    <Button className="!bg-redBase text-white cursor-pointer">Scan QR Code</Button>
                </div> */}
            </div>
        </div>
    );
}


