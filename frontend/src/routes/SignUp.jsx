import { Input } from "@/components/ui/input"
import Mail from "@/assets/custom_icons/mail.svg"
import Lock from "@/assets/custom_icons/https.svg"
import { Eye, EyeClosed } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSignUpStore } from "@/store/useSignUpStore"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import { checkSignUpEmail } from "@/store/useSignUpStore"
import { Link, useNavigate } from "react-router-dom"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { auth, googleProvider } from "@/firebase"
import { signInWithPopup } from "firebase/auth"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

export function SignUp() {
    const navigate = useNavigate();
    const { formData, setFormData, registerUser } = useSignUpStore();
    const { userLinkName, isAuthenticated, userRole, googleSignUp } = useAuthenticationStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passType, setPassType] = useState("password");
    const [confirmPassType, setConfirmPassType] = useState("password");
    const [confirmPassword, setConfirmPassword] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        setPassType(showPassword ? "password" : "text");
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
        setConfirmPassType(showConfirmPassword ? "password" : "text");
    }

    useEffect(() => {
        if (isAuthenticated) {
            if (userRole === 'admin') {
                navigate('/Admin/dashboard');
            } else {
                navigate(`/${userLinkName}`);
            }
        }
    }, [isAuthenticated, userRole, navigate]);

    const checkInputs = async (e) => {
        e.preventDefault();

        if (formData.email === "" || formData.first_name === "" || formData.last_name === "") {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (formData.password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const res = await checkSignUpEmail(formData.email);

        if (!res) {
            return;
        }

        // Await the async registerUser function
        const registerSuccess = await registerUser();

        if (registerSuccess) {
            // Get fresh userLinkName from store after login is complete
            const freshUserLinkName = useAuthenticationStore.getState().userLinkName;
            if (freshUserLinkName) {
                navigate(`/${freshUserLinkName}`);
            } else {
                // Fallback to login if userLinkName is not set
                navigate('/Login');
            }
        }

    }



    const handleGoogleSignUp = async () => {
        try {

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const token = await user.getIdToken();

            const response = await googleSignUp(token);

            if (response) {
                toast.success(`Welcome, ${response.first_name}!`);
                navigate(`/${useAuthenticationStore.getState().userLinkName}`);
            }

        } catch (error) {
            console.error("Google Auth Error:", error);
            toast.error("Failed to sign up with Google");
        }
    };


    return (
        <div className=" w-[320px] mx-auto pb-12">
            <Card className={cn("border-none shadow-none p-0")}>
                <CardHeader className="justify-center text-center">
                    <CardTitle className="text-2xl text-redBase">Get started</CardTitle>
                    <CardDescription>
                        Create a new account
                    </CardDescription>
                </CardHeader>
                <CardContent className={cn("p-0")}>
                    <form onSubmit={checkInputs}>
                        <FieldGroup >
                            <FieldGroup>
                                <Field>
                                    <Button variant="outline" type="button"
                                        onClick={handleGoogleSignUp}>
                                        Continue with Google
                                    </Button>
                                    <div className="flex items-center">
                                        <Separator className="shrink" />
                                        <span className=" px-2 text-muted-foreground text-xs uppercase text-center">
                                            or
                                        </span>
                                        <Separator className="shrink" />
                                    </div>

                                    <FieldLabel htmlFor="first_name">
                                        First Name
                                        <span className="text-redBase">*</span>
                                    </FieldLabel>
                                    <Input id="first_name" type="text" placeholder="John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData('first_name', e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="last_name">
                                        Last Name
                                        <span className="text-redBase">*</span>
                                    </FieldLabel>
                                    <Input id="last_name" type="text" placeholder="Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData('last_name', e.target.value)} required />
                                </Field>
                                <FieldDescription>
                                    Please use your real name as it appears on your ID.
                                </FieldDescription>
                            </FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">
                                    Email
                                    <span className="text-redBase">*</span>
                                </FieldLabel>

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={formData.email} onChange={(e) => setFormData('email', e.target.value)}
                                    required
                                />
                            </Field>
                            <Field >
                                <FieldLabel htmlFor="password">
                                    Password
                                    <span className="text-redBase">*</span>
                                </FieldLabel>
                                <div className="relative">
                                    <Input id="password"
                                        type={passType}
                                        value={formData.password}
                                        onChange={(e) => setFormData('password', e.target.value)} required />
                                    {showPassword ?
                                        <Eye className="absolute top-2 right-3 cursor-pointer text-redBase" onClick={togglePasswordVisibility} />
                                        :
                                        <EyeClosed className="absolute top-2 right-3 cursor-pointer text-redBase" onClick={togglePasswordVisibility} />
                                    }
                                </div>


                                <FieldDescription>
                                    Must be at least 8 characters long.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm-password">
                                    Confirm Password
                                    <span className="text-redBase">*</span>
                                </FieldLabel>
                                <div className="relative ">
                                    <Input id="confirm-password" type={confirmPassType}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required />
                                    {showConfirmPassword ?
                                        <Eye className="absolute top-2 right-3 cursor-pointer text-redBase" onClick={toggleConfirmPasswordVisibility} />
                                        :
                                        <EyeClosed className="absolute top-2 right-3 cursor-pointer text-redBase" onClick={toggleConfirmPasswordVisibility} />
                                    }
                                </div>

                                <FieldDescription>Please confirm your password.</FieldDescription>
                            </Field>
                            <FieldGroup>
                                <Field>
                                    <Button type="submit" className="bg-redBase">Create Account</Button>
                                    <FieldDescription className="px-6 text-center">
                                        Already have an account?
                                        <Link to="/Login" className="text-redBase font-medium ml-1 no-underline border-none">
                                            Sign In
                                        </Link>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

        </div>
    )
} 