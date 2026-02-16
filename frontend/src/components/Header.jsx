import { Button } from "@/components/ui/button";
import { Bell, LogOut, User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useAuthenticationStore from "@/store/useAuthenticationStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";


export function Header({userInfo}){
    
  const { logout } = useAuthenticationStore();
  const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/Login");
    };

    return (
        <header className="flex items-center justify-between p-3 gap-2 w-full border-b border-zinc-200 bg-white">
          <SidebarTrigger className="!bg-transparent focus-visible:!border-none  focus-visible:!outline-none  hover:!border-none hover:!outline-none !outline-0 !border-0"/>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2 cursor-pointer  py-1 px-2 ">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>{userInfo?.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <p className="font-medium text-sm">{userInfo?.name}</p>
                    <p className="text-zinc-400 text-xs">{userInfo?.email}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" sideOffset={4} >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut /> 
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
          </div>
        </header>
    )
}