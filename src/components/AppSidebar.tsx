import { LayoutDashboard, FileText, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "reports", icon: FileText, label: "Laporan" },
  { id: "settings", icon: Settings, label: "Pengaturan" },
];

const AppSidebar = ({ activeMenu, onMenuChange }: AppSidebarProps) => {
  return (
    <aside className="w-16 bg-card border-r border-border flex flex-col items-center py-4 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-6">
        <Shield className="w-5 h-5 text-primary-foreground" />
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuChange(item.id)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              activeMenu === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
