import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type SlotStatus = 'upcoming' | 'running' | 'done' | 'missed';

export interface ScheduleSlot {
  time: string;
  status: SlotStatus;
  batchId?: string;
  // Stats for done batches
  fetched_count?: number;
  success?: number;
  failed?: number;
}

interface BatchScheduleBarProps {
  slots: ScheduleSlot[];
  onSlotClick: (slot: ScheduleSlot) => void;
  activeSlot?: string;
}

const slotIcons: Record<SlotStatus, React.ReactNode> = {
  running: <Loader2 className="w-3 h-3 animate-spin" />,
  done: <CheckCircle2 className="w-3 h-3" />,
  upcoming: <Clock className="w-3 h-3" />,
  missed: <AlertTriangle className="w-3 h-3" />,
};

const slotStyles: Record<SlotStatus, string> = {
  running: 'bg-primary text-primary-foreground border-primary shadow-sm',
  done: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  upcoming: 'bg-muted text-muted-foreground border-border',
  missed: 'bg-warning/10 text-warning border-warning/30',
};

function getNextBatchCountdown(slots: ScheduleSlot[]): string | null {
  const now = new Date();
  const wibOffset = 7 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const wibMinutes = utcMinutes + wibOffset;
  const wibSeconds = now.getUTCSeconds();

  for (const slot of slots) {
    if (slot.status !== 'upcoming') continue;
    const [h, m] = slot.time.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    let diff = (slotMinutes * 60) - (wibMinutes * 60 + wibSeconds);
    if (diff < 0) diff += 24 * 3600;
    if (diff > 0) {
      const hrs = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
  return null;
}

const BatchScheduleBar: React.FC<BatchScheduleBarProps> = ({ slots, onSlotClick, activeSlot }) => {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setCountdown(getNextBatchCountdown(slots));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [slots]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jadwal Batch (WIB):</span>
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          {slots.map(slot => {
            const chip = (
              <button
                key={slot.time}
                onClick={() => onSlotClick(slot)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                  slotStyles[slot.status],
                  activeSlot === slot.time && 'ring-2 ring-primary/40'
                )}
              >
                {slotIcons[slot.status]}
                {slot.time}
              </button>
            );

            if (slot.status === 'done' && slot.fetched_count != null) {
              return (
                <Tooltip key={slot.time}>
                  <TooltipTrigger asChild>{chip}</TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <div className="space-y-0.5">
                      <div>Total Fetch: <span className="font-semibold">{slot.fetched_count}</span></div>
                      <div>Sukses: <span className="font-semibold text-emerald-500">{slot.success ?? 0}</span></div>
                      <div>Gagal: <span className="font-semibold text-destructive">{slot.failed ?? 0}</span></div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return chip;
          })}
        </TooltipProvider>
      </div>
      {countdown && (
        <span className="ml-auto text-sm text-muted-foreground">
          Batch berikutnya: <span className="font-mono font-medium text-foreground">{countdown}</span>
        </span>
      )}
    </div>
  );
};

export default BatchScheduleBar;
