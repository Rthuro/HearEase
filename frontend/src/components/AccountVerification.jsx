import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, Loader2, Camera, Upload, AlertCircle, User, FileText, RotateCcw, CreditCard, ArrowLeft } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import toast from "react-hot-toast";

// List of valid Philippine Government IDs
const VALID_ID_TYPES = [
  { value: "passport", label: "Philippine Passport", hasBack: false },
  { value: "philsys", label: "Philippine National ID (PhilSys ID / PhilID)", hasBack: true },
  { value: "drivers_license", label: "Driver's License (LTO)", hasBack: true },
  { value: "umid", label: "UMID Card (SSS/GSIS)", hasBack: true },
  { value: "prc", label: "PRC ID (Professional Regulation Commission)", hasBack: true },
  { value: "voters_id", label: "Voter's ID (COMELEC)", hasBack: true },
  { value: "seamans_book", label: "Seaman's Book (SIRB)", hasBack: false },
  { value: "owwa", label: "OWWA / OFW ID", hasBack: true },
  { value: "pwd", label: "PWD ID (Person with Disability)", hasBack: true },
];

export default function AccountVerification() {
  const { verifyIdentity, updateVerificationStatus, fetchUser } = useUserStore();

  const webcamRef = useRef(null);

  // Step management
  const [step, setStep] = useState("select_id"); // "select_id" | "upload_images" | "result"
  const [selectedIdType, setSelectedIdType] = useState(null);

  // Image states - now with front and back
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [userFile, setUserFile] = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBackPreview, setIdBackPreview] = useState(null);
  const [userPreview, setUserPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraMode, setCameraMode] = useState("id_front"); // "id_front" | "id_back" | "selfie"
  const [user, setUser] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUser();
        setUser(userData);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  // Get selected ID info
  const selectedIdInfo = VALID_ID_TYPES.find(id => id.value === selectedIdType);

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

  const createPreview = (file) => {
    if (typeof file === "string") {
      return file; // Already a base64 string
    }
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Camera capture functions
  const captureIdFront = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setIdFrontFile(screenshot);
      setIdFrontPreview(screenshot);
      if (selectedIdInfo?.hasBack) {
        setCameraMode("id_back");
        toast.success("ID front captured! Now capture the back.");
      } else {
        setCameraMode("selfie");
        toast.success("ID captured! Now take a selfie.");
      }
    }
  };

  const captureIdBack = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setIdBackFile(screenshot);
      setIdBackPreview(screenshot);
      setCameraMode("selfie");
      toast.success("ID back captured! Now take a selfie.");
    }
  };

  const captureUser = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setUserFile(screenshot);
      setUserPreview(screenshot);
      toast.success("Selfie captured!");
    }
  };

  // File upload handlers
  const handleIdFrontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFrontFile(file);
      setIdFrontPreview(createPreview(file));
    }
  };

  const handleIdBackUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdBackFile(file);
      setIdBackPreview(createPreview(file));
    }
  };

  const handleUserUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserFile(file);
      setUserPreview(createPreview(file));
    }
  };

  const handleIdTypeSelect = (value) => {
    setSelectedIdType(value);
    // Reset all images when ID type changes
    setIdFrontFile(null);
    setIdBackFile(null);
    setUserFile(null);
    setIdFrontPreview(null);
    setIdBackPreview(null);
    setUserPreview(null);
    setResult(null);
    setCameraMode("id_front");
  };

  const handleProceedToUpload = () => {
    if (!selectedIdType) {
      toast.error("Please select an ID type first");
      return;
    }
    setStep("upload_images");
  };

  const handleBackToSelect = () => {
    setStep("select_id");
    setSelectedIdType(null);
    setIdFrontFile(null);
    setIdBackFile(null);
    setUserFile(null);
    setIdFrontPreview(null);
    setIdBackPreview(null);
    setUserPreview(null);
    setResult(null);
    setCameraMode("id_front");
  };

  const resetAll = () => {
    setIdFrontFile(null);
    setIdBackFile(null);
    setUserFile(null);
    setIdFrontPreview(null);
    setIdBackPreview(null);
    setUserPreview(null);
    setResult(null);
    setCameraMode("id_front");
  };

  const handleVerify = async () => {
    // Check if ID front is provided
    if (!idFrontFile) {
      toast.error("Please capture or upload the front of your ID");
      return;
    }

    // Check if ID back is required and provided
    if (selectedIdInfo?.hasBack && !idBackFile) {
      toast.error("Please capture or upload the back of your ID");
      return;
    }

    if (!userFile) {
      toast.error("Please capture or upload a selfie");
      return;
    }

    if (!user?.first_name || !user?.last_name) {
      toast.error("Please update your profile with your name before verifying");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      // Process ID front image
      let idFrontToUpload = idFrontFile;
      if (typeof idFrontFile === "string") {
        idFrontToUpload = base64ToFile(idFrontFile, "id_front.jpg");
      }

      // Process ID back image (if applicable)
      let idBackToUpload = null;
      if (selectedIdInfo?.hasBack && idBackFile) {
        idBackToUpload = typeof idBackFile === "string"
          ? base64ToFile(idBackFile, "id_back.jpg")
          : idBackFile;
      }

      // Process selfie
      let userToUpload = userFile;
      if (typeof userFile === "string") {
        userToUpload = base64ToFile(userFile, "selfie.jpg");
      }

      if (!idFrontToUpload || !userToUpload) {
        toast.error("Failed to process images. Please try again.");
        return;
      }

      formData.append("id_image", idFrontToUpload);
      if (idBackToUpload) {
        formData.append("id_back_image", idBackToUpload);
      }
      formData.append("user_image", userToUpload);
      formData.append("id_type", selectedIdType);
      formData.append("first_name", user?.first_name || "");
      formData.append("last_name", user?.last_name || "");
      formData.append("middle_name", user?.middle_name || "");

      const data = await verifyIdentity(formData);

      // Handle errors
      if (data?.error && !data?.success) {
        setResult(data);
        if (data.statusCode === 422) {
          toast.error(data.error || "Verification failed");
        } else {
          toast.error(data.error || "Verification failed. Please try again.");
        }
        return;
      }

      // Handle success
      if (data?.success) {
        setResult(data);
        setStep("result");

        if (data.verified) {
          toast.success("Identity verified successfully!");

          // Update user verification status in database
          try {
            const stored = localStorage.getItem("authData");
            const authData = stored ? JSON.parse(stored) : null;
            const userId = authData?.userInfo?.id;

            console.log("Updating verification status for user ID:", userId);

            if (userId) {
              const updateResult = await updateVerificationStatus(userId, true);
              console.log("Verification status update result:", updateResult);

              // Also update localStorage to reflect verified status
              if (authData) {
                authData.userInfo.is_identity_verified = true;
                authData.userInfo.identity_verified_at = new Date().toISOString();
                localStorage.setItem("authData", JSON.stringify(authData));
                console.log("Updated localStorage with verified status");
              }

              // Refresh user data to ensure UI reflects the change
              const refreshedUser = await fetchUser();
              if (refreshedUser) {
                setUser(refreshedUser);
                console.log("Refreshed user data:", refreshedUser);
              }

              toast.success("Your account is now verified!");
            } else {
              console.error("User ID not found in localStorage");
              toast.error("Could not save verification status - please try logging in again");
            }
          } catch (err) {
            console.error("Failed to update verification status:", err);
            toast.error("Verification successful but status update failed. Please refresh the page.");
          }
        } else if (!data.face_verified || data.similarity < 0.5) {
          toast.error(`Face match too low (${(data.similarity * 100).toFixed(1)}%). Try with better lighting.`);
        } else {
          toast.error("Verification failed. Please try again.");
        }
      }

    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Something went wrong. Please try again.");
      setResult({
        success: false,
        error: "Connection Error",
        details: "Could not connect to the server. Please check your internet connection."
      });
    } finally {
      setLoading(false);
    }
  };

  // Get video constraints based on camera mode
  const videoConstraints = {
    facingMode: cameraMode === "selfie" ? "user" : { ideal: "environment" }
  };

  // Check if ready to verify
  const isReadyToVerify = idFrontFile && userFile && (!selectedIdInfo?.hasBack || idBackFile);

  return (
    <Card className="w-full max-w-2xl border-none shadow-none p-0">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Identity Verification</CardTitle>
        {user && (
          <p className="text-center text-sm text-gray-500">
            Verifying: <span className="font-medium">{user.first_name} {user.middle_name || ""} {user.last_name}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Step 1: Select ID Type */}
        {step === "select_id" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="text-lg font-medium">Select Your Valid ID</h3>
              <p className="text-sm text-gray-500">
                Choose a government-issued valid ID for verification
              </p>
            </div>

            <div className="space-y-3">
              <Label>Government Valid ID Type</Label>
              <Select value={selectedIdType} onValueChange={handleIdTypeSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your valid ID type..." />
                </SelectTrigger>
                <SelectContent>
                  {VALID_ID_TYPES.map((id) => (
                    <SelectItem key={id.value} value={id.value}>
                      {id.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIdType && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedIdInfo?.label}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedIdInfo?.hasBack
                    ? "📸 You will need to provide the FRONT and BACK of your ID, plus a selfie photo."
                    : "📸 You will need to provide the FRONT of your ID (no back needed for this ID type), plus a selfie photo."}
                </p>
              </div>
            )}

            <Button
              onClick={handleProceedToUpload}
              className="w-full bg-redBase hover:bg-red-700"
              disabled={!selectedIdType}
            >
              Continue to Upload Images
            </Button>

            <div className="text-xs text-gray-400 text-center">
              <p>⚠️ Only government-issued valid IDs are accepted.</p>
              <p>Student IDs, company IDs, and other non-government IDs are not valid.</p>
            </div>
          </div>
        )}

        {/* Step 2: Upload Images */}
        {step === "upload_images" && (
          <>
            <Button
              variant="ghost"
              onClick={handleBackToSelect}
              className="mb-2 -mt-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Change ID Type
            </Button>

            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm font-medium">{selectedIdInfo?.label}</p>
              <p className="text-xs text-gray-500">
                {selectedIdInfo?.hasBack ? "Front + Back + Selfie required" : "Front + Selfie required"}
              </p>
            </div>

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
                <div className="text-center text-sm text-gray-600 mb-2">
                  {cameraMode === "id_front" ? (
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Position the FRONT of your ID in the frame
                    </span>
                  ) : cameraMode === "id_back" ? (
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Position the BACK of your ID in the frame
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" /> Take a clear selfie
                    </span>
                  )}
                </div>
                <div className="overflow-hidden rounded-xl border bg-black aspect-video flex items-center justify-center">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full"
                    videoConstraints={videoConstraints}
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  {cameraMode === "id_front" && (
                    <Button onClick={captureIdFront} className="bg-redBase hover:bg-red-700">
                      <Camera className="w-4 h-4 mr-2" /> Capture ID Front
                    </Button>
                  )}
                  {cameraMode === "id_back" && (
                    <Button onClick={captureIdBack} className="bg-redBase hover:bg-red-700">
                      <Camera className="w-4 h-4 mr-2" /> Capture ID Back
                    </Button>
                  )}
                  {cameraMode === "selfie" && (
                    <Button onClick={captureUser} className="bg-redBase hover:bg-red-700">
                      <Camera className="w-4 h-4 mr-2" /> Capture Selfie
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                {/* ID Front Upload */}
                <div className="space-y-2">
                  <Label>Upload ID Front Image</Label>
                  <Input type="file" accept="image/*" onChange={handleIdFrontUpload} />
                </div>

                {/* ID Back Upload (if applicable) */}
                {selectedIdInfo?.hasBack && (
                  <div className="space-y-2">
                    <Label>Upload ID Back Image</Label>
                    <Input type="file" accept="image/*" onChange={handleIdBackUpload} />
                  </div>
                )}

                {/* Selfie Upload */}
                <div className="space-y-2">
                  <Label>Upload Selfie Image</Label>
                  <Input type="file" accept="image/*" onChange={handleUserUpload} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview Section */}
            <div className={`grid gap-4 ${selectedIdInfo?.hasBack ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {/* ID Front Preview */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">ID FRONT</p>
                <div className="border rounded-lg overflow-hidden aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  {idFrontPreview ? (
                    <img src={idFrontPreview} alt="ID Front" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <p className={`text-xs mt-1 ${idFrontFile ? "text-green-600" : "text-red-500"}`}>
                  {idFrontFile ? "✓ Loaded" : "✗ Empty"}
                </p>
              </div>

              {/* ID Back Preview (if applicable) */}
              {selectedIdInfo?.hasBack && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">ID BACK</p>
                  <div className="border rounded-lg overflow-hidden aspect-[4/3] bg-gray-100 flex items-center justify-center">
                    {idBackPreview ? (
                      <img src={idBackPreview} alt="ID Back" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${idBackFile ? "text-green-600" : "text-red-500"}`}>
                    {idBackFile ? "✓ Loaded" : "✗ Empty"}
                  </p>
                </div>
              )}

              {/* Selfie Preview */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">SELFIE</p>
                <div className="border rounded-lg overflow-hidden aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  {userPreview ? (
                    <img src={userPreview} alt="Selfie" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <p className={`text-xs mt-1 ${userFile ? "text-green-600" : "text-red-500"}`}>
                  {userFile ? "✓ Loaded" : "✗ Empty"}
                </p>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={loading || !isReadyToVerify}
              className="w-full bg-redBase hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Run Identity Check"
              )}
            </Button>

            {(idFrontFile || idBackFile || userFile) && (
              <Button variant="outline" onClick={resetAll} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" /> Reset All Images
              </Button>
            )}
          </>
        )}

        {/* Error Result */}
        {result && result.error && (
          <div className="p-6 rounded-xl border bg-red-50 border-red-200 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">{result.error}</h3>
            </div>
            {result.details && (
              <p className="text-sm text-red-700">{result.details}</p>
            )}

            {/* Display quality issues */}
            {result.issues && result.issues.length > 0 && (
              <div className="text-sm bg-white p-3 rounded border space-y-1">
                <p className="font-medium text-gray-700">Issues Found:</p>
                <ul className="list-disc list-inside text-red-600 space-y-1">
                  {result.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display tips for better photos */}
            {result.tips && (
              <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
                <p className="font-medium text-blue-800">📸 Tips for Better Photos:</p>
                {result.tips.id_card && (
                  <div>
                    <p className="text-blue-700 font-medium">ID Card:</p>
                    <ul className="list-disc list-inside text-blue-600 text-xs">
                      {result.tips.id_card.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.tips.selfie && (
                  <div>
                    <p className="text-blue-700 font-medium">Selfie:</p>
                    <ul className="list-disc list-inside text-blue-600 text-xs">
                      {result.tips.selfie.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Handle tips as array (for OCR failure) */}
                {Array.isArray(result.tips) && (
                  <ul className="list-disc list-inside text-blue-600 text-xs">
                    {result.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {result.tip && (
              <p className="text-sm text-red-600 bg-red-100 p-2 rounded">💡 {result.tip}</p>
            )}

            {/* Display match scores for name mismatch errors */}
            {result.scores && (
              <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                <p className="font-medium mb-1">Match Scores:</p>
                <p>First Name: <span className={result.scores.first_name >= 60 ? "text-green-600" : "text-red-600"}>{result.scores.first_name}%</span></p>
                <p>Last Name: <span className={result.scores.last_name >= 60 ? "text-green-600" : "text-red-600"}>{result.scores.last_name}%</span></p>
                {result.scores.middle_name !== null && (
                  <p>Middle Name: <span className={result.scores.middle_name >= 60 ? "text-green-600" : "text-red-600"}>{result.scores.middle_name}%</span></p>
                )}
              </div>
            )}

            {result.provided_name && (
              <div className="text-xs text-gray-500">
                Checking for: {result.provided_name.first_name} {result.provided_name.middle_name || ""} {result.provided_name.last_name}
              </div>
            )}

            <Button onClick={resetAll} variant="outline" className="w-full mt-4">
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        )}

        {/* Success Result */}
        {result && result.success && (
          <div className={`p-6 rounded-xl border flex flex-col items-center gap-3 ${result.verified ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
            }`}>
            {result.verified ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <h3 className="text-xl font-bold text-green-800">Identity Verified!</h3>
                <p className="text-sm text-green-700">Your identity has been successfully verified.</p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-amber-600" />
                <h3 className="text-xl font-bold text-amber-800">Verification Incomplete</h3>
                <p className="text-sm text-amber-700">Your face doesn't match the ID photo well enough.</p>
              </>
            )}

            {result.extracted_data && (
              <div className="w-full mt-4 p-4 bg-white rounded-lg border">
                <p className="text-sm font-medium mb-2 text-gray-700">Information Extracted:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {result.extracted_data.name && (
                    <>
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{result.extracted_data.name}</span>
                    </>
                  )}

                  {result.extracted_data.address && (
                    <>
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium text-xs">{result.extracted_data.address}</span>
                    </>
                  )}

                  {result.extracted_data.birthdate && (
                    <>
                      <span className="text-gray-500">Birthdate:</span>
                      <span className="font-medium">{result.extracted_data.birthdate}</span>
                    </>
                  )}

                  {result.extracted_data.sex && (
                    <>
                      <span className="text-gray-500">Sex:</span>
                      <span className="font-medium">{result.extracted_data.sex}</span>
                    </>
                  )}

                  {result.extracted_data.id_number && (
                    <>
                      <span className="text-gray-500">ID Number:</span>
                      <span className="font-medium">{result.extracted_data.id_number}</span>
                    </>
                  )}

                  {result.extracted_data.nationality && (
                    <>
                      <span className="text-gray-500">Nationality:</span>
                      <span className="font-medium">{result.extracted_data.nationality}</span>
                    </>
                  )}

                  {result.extracted_data.civil_status && (
                    <>
                      <span className="text-gray-500">Civil Status:</span>
                      <span className="font-medium">{result.extracted_data.civil_status}</span>
                    </>
                  )}

                  <span className="text-gray-500">Face Match:</span>
                  <span className={`font-bold ${result.similarity >= 0.5 ? "text-green-600" : "text-red-600"}`}>
                    {(result.similarity * 100).toFixed(1)}%
                  </span>

                  <span className="text-gray-500">Name Match:</span>
                  <span className={`font-bold ${result.name_match_score >= 60 ? "text-green-600" : "text-red-600"}`}>
                    {result.name_match_score?.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}