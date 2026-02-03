import Hearease_logo from "@/assets/Hearease_logo_b.svg"
import { Link, Outlet } from "react-router-dom"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function PublicLayout() {

    const navlink = [
        {
            title: "Home",
            link: ""
        },
        {
            title: "Services",
            link: "Services"
        },
        {
            title: "About Us",
            link: "About"
        },
        {
            title: "Contact Us",
            link: "Contact"
        }
    ]

  return (
    <main className="flex flex-col ">
        <nav className=" flex justify-between w-full p-4 mb-10">
            <div className="flex items-center gap-2 w-[200px]">
                <img src={Hearease_logo} alt="Logo" className="h-8" />
                <p className="text-2xl font-medium text-redBase">
                    HearEase
                </p>
            </div>
            <div className=" items-center justify-between hidden md:flex">
                {navlink.map((item, index) => (
                    <Link key={index} to={`/${item.link}`} className="hover:text-zinc-600 w-[110px]">
                        {item.title}
                    </Link>
                ))}
            </div> 
            <div className=" w-[200px] justify-end hidden md:flex">
                <Link to="/Login" className="bg-redBase text-white py-2 px-5 rounded-md flex items-center justify-center mr-4 text-sm">
                    Login
                </Link>
            </div>
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px]">
                        <SheetHeader className="text-left">
                            <SheetTitle className="flex items-center gap-2">
                                <img src={Hearease_logo} alt="Logo" className="h-6" />
                                <span className="text-redBase">HearEase</span>
                            </SheetTitle>
                            <SheetDescription></SheetDescription>
                        </SheetHeader>
                        
                        <div className="flex flex-col gap-4 px-3">
                            {navlink.map((item, index) => (
                                <Link 
                                    key={index} 
                                    to={`/${item.link}`} 
                                    className="text-lg font-medium hover:text-redBase transition-colors pb-2"
                                >
                                    {item.title}
                                </Link>
                            ))}
                            <Link 
                                to="/Login" 
                                className="mt-4 bg-redBase text-white py-3 px-5 rounded-md text-center font-medium"
                            >
                                Login
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
        <Outlet />
    </main>
  )
}