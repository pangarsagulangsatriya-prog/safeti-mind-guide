import React from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  status: 'menunggu' | 'diproses' | 'selesai' | 'gagal';
  count: number;
  onClick?: () => void;
}

const statusConfig = {
  menunggu: {
    label: 'Menunggu',
    subtitle: 'Belum masuk proses',
    tooltip: 'Laporan sudah masuk antrian dan menunggu eksekusi tahap berikutnya.',
    icon: Clock,
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
    iconBg: 'bg-warning/20',
  },
  diproses: {
    label: 'Diproses',
    subtitle: 'Sedang berjalan',
    tooltip: 'Laporan sedang diproses oleh AI engine pada tahap ini.',
    icon: Loader2,
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    textColor: 'text-info',
    iconBg: 'bg-info/20',
  },
  selesai: {
    label: 'Selesai',
    subtitle: 'Siap dievaluasi',
    tooltip: 'Pemrosesan selesai dan hasil siap masuk tahap berikutnya / siap dievaluasi.',
    icon: CheckCircle2,
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success',
    iconBg: 'bg-success/20',
  },
  gagal: {
    label: 'Butuh Pengecekan',
    subtitle: 'Gagal / Stuck / Error',
    tooltip: 'Proses gagal, tersangkut, atau butuh pengecekan. Silakan retry atau cek log.',
    icon: AlertCircle,
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    textColor: 'text-destructive',
    iconBg: 'bg-destructive/20',
  },
};

const StatusCard: React.FC<StatusCardProps> = ({ status, count, onClick }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer',
              'hover:shadow-sm hover:scale-[1.02]',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.iconBg)}>
              <Icon className={cn('w-4 h-4', config.textColor, status === 'diproses' && 'animate-spin')} />
            </div>
            <div className="text-left">
              <div className={cn('text-xl font-bold', config.textColor)}>{count}</div>
              <div className="text-xs text-muted-foreground">{config.subtitle}</div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface PipelineStatusCardsProps {
  stats: {
    menunggu: number;
    diproses: number;
    selesai: number;
    gagal: number;
  };
  onStatusClick?: (status: string) => void;
}

const PipelineStatusCards: React.FC<PipelineStatusCardsProps> = ({ stats, onStatusClick }) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <StatusCard status="menunggu" count={stats.menunggu} onClick={() => onStatusClick?.('menunggu')} />
      <StatusCard status="diproses" count={stats.diproses} onClick={() => onStatusClick?.('diproses')} />
      <StatusCard status="selesai" count={stats.selesai} onClick={() => onStatusClick?.('selesai')} />
      <StatusCard status="gagal" count={stats.gagal} onClick={() => onStatusClick?.('gagal')} />
    </div>
  );
};

export default PipelineStatusCards;
