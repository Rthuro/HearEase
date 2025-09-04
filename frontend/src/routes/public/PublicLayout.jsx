import Hearease_logo from "@/assets/Hearease_logo_b.svg"
import { Link, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button";

export function PublicLayout() {

    const navlink = [
        {
            title: "Home",
            link: "/"
        },
        {
            title: "Services",
            link: "/Services"
        },
        {
            title: "About Us",
            link: "/About"
        },
        {
            title: "Contact Us",
            link: "/Contact"
        }
    ]

  return (
    <main className="flex flex-col  w-lvw ">
        <nav className=" flex justify-between w-full p-4 mb-10">
            <div className="flex items-center gap-2 w-[200px]">
                <img src={Hearease_logo} alt="Logo" className="h-8" />
                <p className="text-2xl font-medium text-redBase">
                    HearEase
                </p>
            </div>
            <div className="flex items-center justify-between">
                {navlink.map((item, index) => (
                    <Link key={index} to={`${item.link}`} className="hover:text-zinc-600 w-[110px]">
                        {item.title}
                    </Link>
                ))}
            </div>
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