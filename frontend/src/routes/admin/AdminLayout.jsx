import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import { Header } from "@/components/Header";
import { CheckAuth } from "@/components/CheckAuth";

export function AdminLayout() {
  const { userInfo } = useAuthenticationStore();

  return (
    <>
    <CheckAuth userInfo={userInfo}/>
    <SidebarProvider>
        <AppSidebar />
        <main className="w-full bg-zinc-100/70">
          <Header userInfo={userInfo}/>
          <Outlet/>
        </main>
      </SidebarProvider>
    </>
  )
}