import { Calendar, House, ChartNoAxesColumnDecreasing, UserRound, FilePen, File, FolderOpen, Settings,  FolderSearch, CalendarDays } from "lucide-react"
 
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
    title: "Search Case",
    url: "Search-Case",
    icon: FolderSearch,
  },
  {
    title: "File New Case",
    url: "File-Case",
    icon: File,
  }
]

const second_row = [
  {
    title: "Dashboard",
    url: "#",
    icon: House,
  },
    {
    title: "Hearings",
    url: "Hearings",
    icon: Calendar,
  },
  {
    title: "Calendar",
    url: "Calendar",
    icon: CalendarDays,
  },
  {
    title: "Case Records",
    url: "CaseRecords",
    icon: FolderOpen,
  }
]

const third_row = [
    {
    title: "Generate Documents",
    url: "Generate-Documents",
    icon: FilePen,
  },
  {
    title: "Lupon Management",
    url: "Lupon-Management",
    icon: UserRound,
  },
  {
    title: "Reports",
    url: "Reports",
    icon: ChartNoAxesColumnDecreasing,
  },
  {
    title: "Settings",
    url: "Settings",
    icon: Settings,
  }

]


export function AppSidebar() {
  const {currentPage } = usePageStore();

  return (
    <Sidebar>
      <SidebarContent>
    
        <SidebarGroup >
            <SidebarGroupContent>
                 <SidebarMenu  className="gap-2">
                    <div className="flex items-center gap-2 mb-4">
                        <img src={HearEaseLogo} alt="HearEase Logo" className="w-[28px] my-2 ml-1" />
                        <p className="text-redBase text-xl ">HearEase</p>
                    </div>
                     
                    {first_row.map((item) =>
                        item.title === "File New Case" ? (
                        <Link
                            key={item.title}
                            to={`/Admin/${item.url}`}
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
                            to={`/Admin/${item.url}`}
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
                            to={`/Admin/${item.url}`}
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
            <SidebarGroupLabel className="text-black">General</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {second_row.map((item) => (
                    <SidebarMenuItem key={item.title} className={currentPage.includes(item.title) ? " text-black" : " text-zinc-700"}>
                    <SidebarMenuButton asChild>
                        <Link key={item.title} to={`/Admin/${item.url}`}>
                        <item.icon />
                        <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel className="text-black">Others</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {third_row.map((item) => (
                    <SidebarMenuItem key={item.title} className={currentPage === item.title ? " text-black" : " text-zinc-700"}>
                    <SidebarMenuButton asChild>
                        <Link key={item.title} to={`/Admin/${item.url}`}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
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