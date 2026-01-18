import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet, Navigate } from "react-router-dom";
import useAuthenticationStore from "@/store/useAuthenticationStore";
import { Header } from "@/components/Header";
import { CheckAuth } from "@/components/CheckAuth";
import { useCaseStore } from "@/store/useCaseStore";
import useHearingStore from "@/store/useHearingStore";
import { useLuponStore } from "@/store/useLuponStore";
import { useEffect } from "react";

export function AdminLayout() {
  const { userInfo, isAuthenticated } = useAuthenticationStore();
  const { cases, fetchCases} = useCaseStore();
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
          <Header userInfo={userInfo}/>
          <Outlet/>
        </main>
      </SidebarProvider>
    </>
  )
}