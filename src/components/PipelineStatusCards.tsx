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
  status: 'menunggu' | 'diproses' | 'berhasil' | 'gagal';
  count: number;
  onClick?: () => void;
}

const statusConfig = {
  menunggu: {
    label: 'Menunggu',
    subtitle: 'Belum masuk proses',
    tooltip: 'Laporan sudah masuk antrian dan menunggu eksekusi tahap berikutnya.',
    icon: Clock,
    filterValue: 'menunggu',
  },
  diproses: {
    label: 'Diproses',
    subtitle: 'Sedang berjalan',
    tooltip: 'Laporan sedang diproses oleh AI engine pada tahap ini.',
    icon: Loader2,
    filterValue: 'diproses',
  },
  berhasil: {
    label: 'Berhasil',
    subtitle: 'Siap dievaluasi',
    tooltip: 'Pemrosesan selesai dan hasil siap masuk tahap berikutnya / siap dievaluasi.',
    icon: CheckCircle2,
    filterValue: 'sukses',
  },
  gagal: {
    label: 'Gagal',
    subtitle: 'Butuh pengecekan',
    tooltip: 'Proses gagal. Silakan cek log atau lakukan tindakan perbaikan.',
    icon: AlertCircle,
    filterValue: 'gagal',
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
              'flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card transition-all cursor-pointer',
              'hover:shadow-sm hover:bg-muted/50'
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Icon className={cn('w-4 h-4 text-muted-foreground', status === 'diproses' && 'animate-spin')} />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground">{config.subtitle}</div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-xs font-medium mb-0.5">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface PipelineStatusCardsProps {
  stats: {
    menunggu: number;
    diproses: number;
    berhasil: number;
    gagal: number;
  };
  onStatusClick?: (status: string) => void;
}

const PipelineStatusCards: React.FC<PipelineStatusCardsProps> = ({ stats, onStatusClick }) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <StatusCard status="menunggu" count={stats.menunggu} onClick={() => onStatusClick?.(statusConfig.menunggu.filterValue)} />
      <StatusCard status="diproses" count={stats.diproses} onClick={() => onStatusClick?.(statusConfig.diproses.filterValue)} />
      <StatusCard status="berhasil" count={stats.berhasil} onClick={() => onStatusClick?.(statusConfig.berhasil.filterValue)} />
      <StatusCard status="gagal" count={stats.gagal} onClick={() => onStatusClick?.(statusConfig.gagal.filterValue)} />
    </div>
  );
};

export default PipelineStatusCards;
