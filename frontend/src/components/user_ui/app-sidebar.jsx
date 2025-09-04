import { Calendar, House, File, FolderOpen, Settings, ClockFading, Info } from "lucide-react"
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import HearEaseLogo from '@/assets/hearease_logo_s.png'
import { Link } from "react-router-dom";
import usePageStore from "@/store/usePageStore";
 
// Menu items.
const first_row = [
  {
    title: "File New Case",
    url: "#",
    icon: File,
  },
]

const second_row = [
  {
    title: "Home",
    url: "#",
    icon: House,
  },
  {
    title: "Hearings",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Pending",
    url: "#",
    icon: ClockFading,
  },
  {
    title: "My Case Records",
    url: "#",
    icon: FolderOpen,
  }
]


const third_row = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Support",
    url: "#",
    icon: Info,
  },
]



export function AppSidebar() {
  const {currentPage } = usePageStore();

  return (
    <Sidebar>
      <SidebarContent>
    
        <SidebarGroup >
            <SidebarGroupContent>
                 <SidebarMenu className="mt-3">
                    <div className="flex items-center gap-2 mb-8 ml-1">
                        <img src={HearEaseLogo} alt="HearEase Logo" className="w-[28px] " />
                        <p className="text-redBase text-xl ">HearEase</p>
                    </div>
                     
                    {first_row.map((item) =>
                        item.title === "File New Case" ? (
                        <Link
                            key={item.title}
                            to={`/admin/${item.url}`}
                            className="bg-redBase text-white py-2 rounded-md flex items-center justify-center"
                        >
                            <span className="flex items-center gap-2">
                                <item.icon size="16" />
                                <span>{item.title}</span>
                            </span>
                        </Link>
                        ) : (
                        <Link
                            key={item.title}
                            to={`/admin/${item.url}`}
                        >
                            <SidebarMenuItem className={currentPage === item.title ? " text-black" : " text-zinc-700"}>
                            <SidebarMenuButton asChild>
                                <span className="flex items-center gap-2">
                                <item.icon />
                                <span>{item.title}</span>
                                </span>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        </Link>
                        )
                    )}
                    </SidebarMenu>
                </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="-mt-4">
            <SidebarGroupLabel className="text-black">Main</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                  
                {second_row.map((item) => (
                    <SidebarMenuItem key={item.title} className={currentPage === item.title ? " text-black" : " text-zinc-700"}>
                    <SidebarMenuButton asChild>
                        <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel className="text-black">Support Tools</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {third_row.map((item) => (
                    <SidebarMenuItem key={item.title} className={currentPage === item.title ? " text-black" : " text-zinc-700"}>
                    <SidebarMenuButton asChild>
                        <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
        
      </SidebarContent>
    </Sidebar>
  )
}