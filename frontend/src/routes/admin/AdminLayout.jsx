import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom";
import usePageStore from "@/store/usePageStore";

export function AdminLayout() {
  const { currentPage } = usePageStore();

  return (
   <SidebarProvider>
      <AppSidebar />
      <main>
        <header className="flex items-center py-3">
          <SidebarTrigger className="!bg-transparent focus-visible:!border-none  focus-visible:!outline-none  hover:!border-none hover:!outline-none !outline-0 !border-0"/>
          <p>{currentPage}</p>
        </header>
        <Outlet/>
      </main>
    </SidebarProvider>
  )
}