import Hearease_logo from "@/assets/Hearease_logo_b.svg"
import Mail from "@/assets/custom_icons/mail.svg"
import Lock from "@/assets/custom_icons/https.svg"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { userData } from "@/test/user_data"
import { toast } from "react-hot-toast"
import { useState } from "react"

export function Authentication(){
    const navigate = useNavigate();
    const [ passErr, setPassErr ] = useState(false);


    const checkInputs = (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;


        if(email.toLowerCase() == "admin@example.com"){
            navigate("/Admin");
        }else{
            const checkUser  = userData.find(user => user.email === email);

            if(!checkUser){
                toast.error("User not found");
            }else{
                if(checkUser.password !== password){
                    setPassErr(true);
                }else{
                    navigate("/Home");
                }
            }
        }
    }

    return (
        <form onSubmit={checkInputs} className="flex flex-col items-center justify-center gap-10  w-screen">
            <div className="flex items-center gap-2">
                <img src={Hearease_logo} alt="HearEase Logo" />
                <p className=" font-medium text-redBase text-4xl">HearEase</p>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                <p className="text-xl text-center">Sign in to continue</p>
                <p className="text-lg text-center text-zinc-600">Please enter your details to sign in.</p>
            </div>
            <div className="flex flex-col justify-center items-center gap-3 w-[320px]">
                <div className="flex items-center relative w-full">
                    <img src={Mail} alt="email icon" className="absolute ml-3"/>
                    <Input type="email" id="email" placeholder="Enter your email..." className="pl-10" autoComplete="email" />
                </div>
                <div className="flex items-center relative w-full">
                    <img src={Lock} alt="lock icon" className="absolute ml-3"/>
                    <Input type="password" id="password" placeholder="Enter your password..." className="pl-10" autoComplete="current-password" />
                </div>
                { passErr && <p className="text-red-600 -mt-1 ml-1 text-sm self-start">Incorrect password</p>}
            </div>
            <button type="submit" className="w-[320px] bg-redBase text-white py-2 px-5 rounded-md text-center cursor-pointer" >Sign In</button>
            <p className="text-zinc-600">Don't have an account? <a href="#" className="text-redBase font-medium">Sign up</a></p>
        </form>
    )
}