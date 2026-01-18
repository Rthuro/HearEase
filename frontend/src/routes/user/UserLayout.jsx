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
import { useRetrieveUsersStore } from "@/store/useRetrieveUsersStore";
export function UserLayout() {
  const { userInfo, isAuthenticated } = useAuthenticationStore();
  const { fetchCases} = useCaseStore();
  const { fetchHearings } = useHearingStore();
  const { fetchMembers } = useLuponStore();
  const { fetchUser } = useRetrieveUsersStore();
  
   useEffect(() => {
      if (isAuthenticated) {
        fetchCases();
        fetchHearings();
        fetchMembers();
        fetchUser(userInfo?.email);

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