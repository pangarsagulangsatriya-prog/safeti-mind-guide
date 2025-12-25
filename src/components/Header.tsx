import { LogOut, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = ({ title = "SafetyIntelligence", subtitle }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">{title}</span>
            {subtitle && (
              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                {subtitle}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">AI-Powered Safety Analysis & Evaluation</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
            12
          </span>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">Officer</p>
            <p className="text-xs text-muted-foreground">username@berau.co.id</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-primary gap-2">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log Out</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
