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


export function Authentication(){
    const navigate = useNavigate();
    const [ passErr, setPassErr ] = useState(false);
    const { login, userRole, userLinkName, isAuthenticated, getLocalInfo } = useAuthenticationStore();
    const [showPassword, setShowPassword] = useState(false);
    const [ passType, setPassType ] = useState("password");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("authData");
        const data = stored ? JSON.parse(stored) : null;
        console.log(data);
        if(data?.isAuthenticated){
            navigate(data?.userRole === "admin" ? "/Admin" : `/${data?.userLinkName}`);
        }
    }, [navigate]);

    const togglePasswordVisibility = () => {

        setShowPassword(!showPassword);
        setPassType(showPassword ? "password" : "text");
        
    }

    const checkInputs = async (e) => {
        e.preventDefault();

        const res = await loginUser(email, password);
        if(res.role == "admin"){
            navigate("/Admin");
        } else if(res.role == "user"){
            navigate(`/u/@${res.email.split("@")[0]}`);
        }
        
    }

    return (
        <form onSubmit={checkInputs} className="flex flex-col items-center justify-center gap-10  w-screen">
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
            <div className="flex flex-col justify-center items-center gap-3 w-[320px]">
                <div className="flex items-center relative w-full">
                    <img src={Mail} alt="email icon" className="absolute ml-3"/>
                    <Input
                        type="email"
                        className="pl-10 pr-3"
                        placeholder="Enter your email..."
                        autoComplete="email"
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
                
                { passErr && <p className="text-red-600 -mt-1 ml-1 text-sm self-start">Incorrect password</p>}
            </div>
            <button type="submit" className="w-[320px] bg-redBase text-white py-2 px-5 rounded-md text-center cursor-pointer"  >
                Sign In
            </button>
            <p type="button" className="text-zinc-600" >
                Don't have an account?
                <Link to="/SignUp" className="text-redBase font-medium ml-1">
                    Sign Up
                </Link>
            </p>
        </form>
    )
}