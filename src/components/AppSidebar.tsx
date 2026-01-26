import { ClipboardCheck, LayoutDashboard, Activity, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Form Checker", url: "/form-checker", icon: ClipboardCheck },
  { title: "Dashboard Evaluator", url: "/dashboard", icon: LayoutDashboard },
  { title: "Monitoring", url: "/", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        {/* Logo / Brand + Trigger */}
        <div className="px-3 mb-4 flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-2'}`}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-primary rounded-sm" />
            </div>
            {!collapsed && (
              <span className="font-bold text-foreground">SafetiMind</span>
            )}
          </div>
          {!collapsed && (
            <SidebarTrigger className="ml-auto">
              <ChevronRight className="w-4 h-4" />
            </SidebarTrigger>
          )}
        </div>

        {/* Toggle when collapsed */}
        {collapsed && (
          <div className="px-3 mb-4 flex justify-center">
            <SidebarTrigger>
              <ChevronRight className="w-4 h-4" />
            </SidebarTrigger>
          </div>
        )}

        {/* User Avatar */}
        <div className="px-3 mb-6">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
              RA
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Reviewer</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
