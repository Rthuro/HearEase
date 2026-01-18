import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2, Camera, Upload } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import toast from "react-hot-toast";

export default function AccountVerification() {
  const { verifyIdentity } = useUserStore();

  const webcamRef = useRef(null);
  const [idFile, setIdFile] = useState(null);
  const [userFile, setUserFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const base64ToFile = (base64String, filename) => {
      try {
          const arr = base64String.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
      } catch (e) {
          console.error("Base64 conversion failed", e);
          return null;
      }
  };

  const captureId = () => {
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) setIdFile(screenshot);
  };

  const captureUser = () => {
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) setUserFile(screenshot);
  };
    
  const handleVerify = async () => {
    if (!idFile || !userFile) {
        toast.error("Please provide both ID and Selfie");
        return;
    }
    setLoading(true);
    setResult(null);
    
    const formData = new FormData();

    // Process ID Image
    if (typeof idFile === "string") {
      
      formData.append("id_image", base64ToFile(idFile, "id_card.jpg"));
    } else if (idFile) {

      formData.append("id_image", idFile);
    }

    
    if (typeof userFile === "string") {
      formData.append("user_image", base64ToFile(userFile, "selfie.jpg"));
    } else if (userFile) {
      formData.append("user_image", userFile);
    }

    formData.append("first_name", "Romelyn");
    formData.append("last_name", "Dangaran");
     console.log("Submitting verification with form data:", formData.get("id_image"), formData.get("user_image"));

    try {
        
        const data = await verifyIdentity(formData);
        const threshold = 0.5;

        const adjustedData = {
            ...data,
            verified: data.verified && data.similarity >= threshold,
            similarity: data.similarity 
        };

        console.log("Verification data:", adjustedData);
        setResult(adjustedData);

        if (adjustedData.verified) {
            toast.success("Identity Verified!");
        } else if (data.similarity < threshold && data.similarity > 0) {
            toast.error(`Match too low (${(data.similarity * 100).toFixed(1)}%). Please try again with better lighting.`);
        } else {
            toast.error("Identity could not be verified.");
        }

    } catch (error) {
      toast.error("Something went wrong with the server connection.");
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-2xl border-none shadow-none p-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Identity Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">
                <Camera className="w-4 h-4 mr-2" /> Camera Scan
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" /> Upload Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-4">
              <div className="overflow-hidden rounded-xl border bg-black aspect-video flex items-center justify-center">
                <Webcam 
                  ref={webcamRef} 
                  screenshotFormat="image/jpeg" 
                  className="w-full"
                  videoConstraints={{ facingMode: "user" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={captureId}>Capture ID Card</Button>
                <Button variant="outline" onClick={captureUser}>Capture Selfie</Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id-upload">Upload ID Card Image</Label>
                <Input 
                  id="id-upload" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setIdFile(e.target.files[0])} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="face-upload">Upload Selfie Image</Label>
                <Input 
                  id="face-upload" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setUserFile(e.target.files[0])} 
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-around p-4 bg-slate-100 border rounded-lg">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase">ID Card</span>
              <span className="text-sm font-medium">{idFile ? "✅ Loaded" : "❌ Empty"}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase">Selfie</span>
              <span className="text-sm font-medium">{userFile ? "✅ Loaded" : "❌ Empty"}</span>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            size="sm"
            onClick={handleVerify} 
            disabled={!idFile || !userFile || loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Processing Images...
              </>
            ) : (
              "Run Identity Check"
            )}
          </Button>

          {loading && (<p className="text-center text-sm text-gray-500">This may take a moment. Please wait...</p>
          )}

          {result && (
            <div className={`p-6 rounded-xl border flex flex-col items-center gap-2 ${
              result?.verified ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}>
              {result?.verified ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                  <h3 className="text-xl font-bold text-green-800">Verified Successfully</h3>
                  <p className="text-sm text-green-700">The person in the selfie matches the ID card.</p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-red-600" />
                  <h3 className="text-xl font-bold text-red-800">Verification Failed</h3>
                  <p className="text-sm text-red-700">Faces do not appear to be the same person.</p>
                </>
              )}
              {result?.similarity && (
                <div className="grid grid-cols-2 text-sm border-t pt-4 border-slate-200">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="font-bold">{(result?.similarity * 100).toFixed(1)}%</span>
                    <span className="text-slate-500">Name:</span>
                    <span className="font-bold uppercase">{result?.extracted_data.given_names} {result?.extracted_data.last_name}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
  );
}