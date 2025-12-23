import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/user_ui/app-sidebar"
import useAuthenticationStore from "@/store/useAuthenticationStore";
import { Header } from "@/components/Header";
import { CheckAuth } from "@/components/CheckAuth";
import { useCaseStore } from "@/store/useCaseStore";
import useHearingStore from "@/store/useHearingStore";
import { useLuponStore } from "@/store/useLuponStore";
import { useEffect } from "react";

export function UserLayout() {
  const { userInfo, isAuthenticated } = useAuthenticationStore();
  const { fetchCases} = useCaseStore();
  const { fetchHearings } = useHearingStore();
  const { fetchMembers } = useLuponStore();

   useEffect(() => {
      if (isAuthenticated) {
        fetchCases();
        fetchHearings();
        fetchMembers();
      }
    }, [isAuthenticated, fetchCases, fetchHearings, fetchMembers]);

    if (!isAuthenticated) {
      return <Navigate to="/Login" replace />;
    }

  

  return (
    <>
      <CheckAuth userInfo={userInfo}/>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full bg-zinc-100/70">
          {/* <header className="flex items-center justify-between p-3 gap-2 w-full border-b border-zinc-200 bg-white">
            <SidebarTrigger className="!bg-transparent focus-visible:!border-none  focus-visible:!outline-none  hover:!border-none hover:!outline-none !outline-0 !border-0"/>
            <div className="flex items-center gap-1">
              <Button variant="outline" >
                <Bell size="16" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-2 cursor-pointer  py-1 px-2 ">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>{userInfo?.name.charAt(0)}</AvatarFallback>
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
                  <DropdownMenuItem>
                    <User2 /> 
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut /> 
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
            </div>
          </header> */}
          <Header userInfo={userInfo}/>
          <Outlet/>
        </main>
      </SidebarProvider>
    </>
  )
}