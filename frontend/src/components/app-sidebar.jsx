import { Calendar, House, ChartNoAxesColumnDecreasing, UserRound, FilePen, File, FolderOpen, Settings, LogOut, FolderSearch, Folder } from "lucide-react"
 
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
    title: "Dashboard",
    url: "#",
    icon: House,
  },
  {
    title: "Search Case",
    url: "#",
    icon: FolderSearch,
  },
  {
    title: "File New Case",
    url: "#",
    icon: File,
  }
]

const second_row = [
    {
    title: "Hearings",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Case Records",
    url: "#",
    icon: FolderOpen,
  }
]

const third_row = [
    {
    title: "Generate Documents",
    url: "#",
    icon: FilePen,
  },
  {
    title: "Lupon Management",
    url: "#",
    icon: UserRound,
  },
  {
    title: "Reports",
    url: "#",
    icon: ChartNoAxesColumnDecreasing,
  },

]

const fourth_row = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Log out",
    url: "#",
    icon: LogOut,
  },
]


export function AppSidebar() {
  const {currentPage } = usePageStore();

  return (
    <Sidebar>
      <SidebarContent>
    
        <SidebarGroup >
            <SidebarGroupContent>
                 <SidebarMenu  className="gap-2">
                    <div className="flex items-center gap-2">
                        <img src={HearEaseLogo} alt="HearEase Logo" className="w-[28px] my-2 ml-1" />
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
                        ) : item.title === "Search Case" ? (
                        <Link
                            key={item.title}
                            to={`/admin/${item.url}`}
                            className="border border-redBase/10 text-redBase bg-red-50 py-2 rounded-md flex items-center justify-center "
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
        
        <SidebarGroup>
            <SidebarGroupLabel className="text-black">Case Management</SidebarGroupLabel>
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

        <SidebarGroup>
            <SidebarGroupLabel className="text-black">System Settings</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {fourth_row.map((item) => (
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