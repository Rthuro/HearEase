import Hearease_logo from "@/assets/Hearease_logo_b.svg"
import { Link, Outlet } from "react-router-dom"

export function PublicLayout() {

  return (
    <main className="flex flex-col">
        
        <nav className=" flex justify-between w-full p-4">
            <Link to="/" className="flex items-center gap-2 w-[200px] cursor-pointer">
                <img src={Hearease_logo} alt="Logo" className="h-8" />
                <p className="text-2xl font-medium text-redBase">
                    HearEase
                </p>
            </Link>
            <div className=" w-[200px] justify-end flex">
                <Link to="/Login" className="bg-redBase text-white py-2 px-5 rounded-md flex items-center justify-center mr-4 text-sm">
                    Login
                </Link>
            </div>
            
        </nav>
        <Outlet />
    </main>
  )
}