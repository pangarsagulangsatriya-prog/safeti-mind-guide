import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'Menunggu Review' | 'Dalam Proses' | 'Selesai';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    'Menunggu Review': 'bg-warning/10 text-warning border-warning/20',
    'Dalam Proses': 'bg-info/10 text-info border-info/20',
    'Selesai': 'bg-success/10 text-success border-success/20',
  };

  return (
    <span className={cn(
      "px-2.5 py-1 text-xs font-medium rounded-full border",
      styles[status]
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
