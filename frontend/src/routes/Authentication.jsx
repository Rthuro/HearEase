import Hearease_logo from "@/assets/Hearease_logo_b.svg"
import Mail from "@/assets/custom_icons/mail.svg"
import Lock from "@/assets/custom_icons/https.svg"
import { Input } from "@/components/ui/input"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { loginUser } from "@/store/useLogin"
import { Eye, EyeClosed } from "lucide-react"
import { useEffect } from "react"
import { toast } from "react-hot-toast";
import { Separator } from "@/components/ui/separator"
import { auth, googleProvider } from "../firebase"; 
import { signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function Authentication(){
    const navigate = useNavigate();
    const { userRole, userLinkName, isAuthenticated, googleLogin } = useAuthenticationStore();
    const [showPassword, setShowPassword] = useState(false);
    const [ passType, setPassType ] = useState("password");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            if (userRole === 'admin') {
                navigate('/Admin');
            } else {
                navigate(`/${userLinkName}`);
            }
        }
    }, [isAuthenticated, userRole, navigate]);

    const togglePasswordVisibility = () => {

        setShowPassword(!showPassword);
        setPassType(showPassword ? "password" : "text");
        
    }

    const checkInputs = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await loginUser(email, password);
            if(res.role == "admin"){
                navigate("/Admin");
            } else if(res.role == "user"){
                navigate(`/u/@${res.email.split("@")[0]}`);
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Incorrect email or password");
        } finally {
            setLoading(false);
        }
        
        
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            const token = await user.getIdToken();

            const response = await googleLogin(token)

            if (response) {

                toast.success(`Welcome back, ${response.first_name}!`);
                
                if (response.role === 'admin') {
                    navigate('/Admin/dashboard');
                } else {
                    navigate(`/u/@${response.email.split("@")[0]}`);
                }
            }
        } catch (error) {
            console.error("Login Error:", error);

            if (error.code === 'auth/popup-closed-by-user') {
                toast.warning("Login cancelled");
            } else {
                toast.error("Failed to login with Google");
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={checkInputs} className="flex flex-col items-center justify-center gap-4 w-[320px] mx-auto mb-10">
            <div className="flex items-center gap-2">
                <img src={Hearease_logo} alt="HearEase Logo" />
                <p className=" font-medium text-redBase text-4xl">HearEase</p>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                <p className="text-xl text-center">
                    Sign in to continue
                </p>
                <p className="text-lg text-center text-zinc-600"> Please enter your details to sign in. {userLinkName}</p>
            </div>
            <div className="flex flex-col justify-center items-center gap-3 w-full">
                <div className="flex items-center relative w-full">
                    <img src={Mail} alt="email icon" className="absolute ml-3"/>
                    <Input
                        type="email"
                        placeholder="m@example.com"
                        className="pl-10 pr-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center relative w-full">
                    <img src={Lock} alt="lock icon" className="absolute ml-3"/>
                    <Input
                        type={passType}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password..."
                        className="pl-10 pr-3"
                        autoComplete="current-password"
                        required
                    />
                    { showPassword ?
                        <Eye className="absolute right-3 cursor-pointer text-redBase" onClick={togglePasswordVisibility} />
                        :
                        <EyeClosed className="absolute right-3 cursor-pointer text-redBase" onClick={togglePasswordVisibility} />
                    }
                </div> 
                
            </div>

            <div className="flex flex-col gap-3 w-full">
               
                 <button type="submit" className=" bg-redBase text-white py-2 px-5 rounded-md text-center cursor-pointer"  >
                     {loading ? <Loader2 className="animate-spin mx-auto" /> : ("Sign In")}
                </button>

                <div className="flex items-center">
                    <Separator className="shrink" />
                    <span className=" px-2 text-muted-foreground text-xs uppercase text-center">
                        or
                    </span>
                    <Separator className="shrink" />
                </div>
                <Button variant="outline" type="button"
                    onClick={handleGoogleLogin}>
                    {googleLoading ? (
                        <Loader2 className="animate-spin mx-auto" />
                    ) : (
                        <>
                            Continue with Google
                        </>
                    )}
                </Button>
            </div>
           
            <p type="button" className="text-zinc-600" >
                Don't have an account?
                <Link to="/SignUp" className="text-redBase font-medium ml-1">
                    Sign Up
                </Link>
            </p>
        </form>
    )
}