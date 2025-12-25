import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconColor?: string;
  iconBgColor?: string;
}

const StatCard = ({ icon: Icon, label, value, iconColor = "text-primary", iconBgColor = "bg-primary/10" }: StatCardProps) => {
  return (
    <div className="bg-card rounded-lg p-4 card-shadow flex items-center gap-4 animate-fade-in">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBgColor)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
