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
  active?: boolean;
}

const statusConfig = {
  menunggu: {
    label: 'Menunggu',
    subtitle: 'Menunggu',
    tooltip: 'Laporan sudah masuk antrian dan menunggu eksekusi tahap berikutnya.',
    icon: Clock,
    filterValue: 'menunggu',
  },
  diproses: {
    label: 'Diproses',
    subtitle: 'Diproses',
    tooltip: 'Laporan sedang diproses oleh AI engine pada tahap ini.',
    icon: Loader2,
    filterValue: 'diproses',
  },
  berhasil: {
    label: 'Berhasil',
    subtitle: 'Berhasil',
    tooltip: 'Pemrosesan selesai dan hasil siap masuk tahap berikutnya / siap dievaluasi.',
    icon: CheckCircle2,
    filterValue: 'sukses',
  },
  gagal: {
    label: 'Gagal',
    subtitle: 'Gagal',
    tooltip: 'Proses gagal. Silakan cek log atau lakukan tindakan perbaikan.',
    icon: AlertCircle,
    filterValue: 'gagal',
  },
};

const StatusCard: React.FC<StatusCardProps> = ({ status, count, onClick, active }) => {
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
              active
                ? 'border-foreground/20 bg-foreground/5 shadow-sm'
                : 'border-border bg-card hover:shadow-sm hover:bg-muted/50'
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
    total: number;
    menunggu: number;
    diproses: number;
    berhasil: number;
    gagal: number;
  };
  onStatusClick?: (status: string) => void;
  activeFilter?: string;
}

const PipelineStatusCards: React.FC<PipelineStatusCardsProps> = ({ stats, onStatusClick, activeFilter }) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onStatusClick?.('all')}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer',
                activeFilter === 'all' || !activeFilter
                  ? 'border-foreground/20 bg-foreground/5 shadow-sm'
                  : 'border-border bg-card hover:shadow-sm hover:bg-muted/50'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground">#</span>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px]">
            <p className="text-xs font-medium mb-0.5">Total</p>
            <p className="text-xs text-muted-foreground">Jumlah semua item pada filter aktif.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <StatusCard status="menunggu" count={stats.menunggu} onClick={() => onStatusClick?.(statusConfig.menunggu.filterValue)} active={activeFilter === statusConfig.menunggu.filterValue} />
      <StatusCard status="diproses" count={stats.diproses} onClick={() => onStatusClick?.(statusConfig.diproses.filterValue)} active={activeFilter === statusConfig.diproses.filterValue} />
      <StatusCard status="berhasil" count={stats.berhasil} onClick={() => onStatusClick?.(statusConfig.berhasil.filterValue)} active={activeFilter === statusConfig.berhasil.filterValue} />
      <StatusCard status="gagal" count={stats.gagal} onClick={() => onStatusClick?.(statusConfig.gagal.filterValue)} active={activeFilter === statusConfig.gagal.filterValue} />
    </div>
  );
};

export default PipelineStatusCards;
