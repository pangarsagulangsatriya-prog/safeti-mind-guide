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
  running: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  done: <CheckCircle2 className="w-3.5 h-3.5" />,
  upcoming: <Clock className="w-3.5 h-3.5" />,
  missed: <AlertTriangle className="w-3.5 h-3.5" />,
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

  const runningSlot = slots.find(s => s.status === 'running');

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Jadwal Batch</span>
        <span className="text-[10px] text-muted-foreground/60 font-medium">(WIB)</span>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={200}>
          {slots.map((slot, idx) => {
            const isActive = activeSlot === slot.time;
            const isDone = slot.status === 'done';
            const isRunning = slot.status === 'running';
            const isUpcoming = slot.status === 'upcoming';
            const isMissed = slot.status === 'missed';

            const chipClasses = cn(
              'relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer',
              isDone && !isActive && 'bg-emerald-500/8 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/15 hover:border-emerald-500/40 dark:text-emerald-400 dark:border-emerald-400/25',
              isRunning && !isActive && 'bg-blue-500/8 text-blue-600 border-blue-500/25 hover:bg-blue-500/15 hover:border-blue-500/40 dark:text-blue-400 dark:border-blue-400/25 shadow-sm shadow-blue-500/10',
              isUpcoming && !isActive && 'bg-muted/60 text-muted-foreground/60 border-border/60 hover:bg-muted hover:text-muted-foreground hover:border-border',
              isMissed && !isActive && 'bg-amber-500/8 text-amber-600 border-amber-500/25 hover:bg-amber-500/15 dark:text-amber-400',
              isActive && isDone && 'bg-emerald-500/20 text-emerald-700 border-emerald-500/50 ring-2 ring-emerald-500/30 ring-offset-1 ring-offset-background shadow-sm dark:text-emerald-300',
              isActive && isRunning && 'bg-blue-500/20 text-blue-700 border-blue-500/50 ring-2 ring-blue-500/30 ring-offset-1 ring-offset-background shadow-sm dark:text-blue-300',
              isActive && isUpcoming && 'bg-muted text-foreground border-foreground/20 ring-2 ring-foreground/20 ring-offset-1 ring-offset-background',
              isActive && isMissed && 'bg-amber-500/20 text-amber-700 border-amber-500/50 ring-2 ring-amber-500/30 ring-offset-1 ring-offset-background',
            );

            const chip = (
              <button
                key={slot.time}
                onClick={() => onSlotClick(slot)}
                className={chipClasses}
              >
                {isRunning && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                  </span>
                )}
                {slotIcons[slot.status]}
                <span className="tabular-nums">{slot.time}</span>
              </button>
            );

            if (isDone && slot.fetched_count != null) {
              return (
                <Tooltip key={slot.time}>
                  <TooltipTrigger asChild>{chip}</TooltipTrigger>
                  <TooltipContent side="bottom" align="center" className="px-3 py-2.5">
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-foreground mb-1.5">Batch {slot.time} WIB — Selesai</div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Total Fetch</span>
                        <span className="font-semibold tabular-nums">{slot.fetched_count}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Berhasil</span>
                        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{slot.success ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Gagal</span>
                        <span className="font-semibold tabular-nums text-destructive">{slot.failed ?? 0}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            if (isRunning) {
              return (
                <Tooltip key={slot.time}>
                  <TooltipTrigger asChild>{chip}</TooltipTrigger>
                  <TooltipContent side="bottom" align="center" className="px-3 py-2">
                    <div className="text-xs font-medium">Batch sedang berjalan...</div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            if (isUpcoming) {
              return (
                <Tooltip key={slot.time}>
                  <TooltipTrigger asChild>{chip}</TooltipTrigger>
                  <TooltipContent side="bottom" align="center" className="px-3 py-2">
                    <div className="text-xs text-muted-foreground">Belum dieksekusi</div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return chip;
          })}
        </TooltipProvider>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-border/60" />

      {/* Countdown / Running info */}
      <div className="flex items-center gap-3 ml-auto">
        {runningSlot && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-muted-foreground">Batch</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{runningSlot.time}</span>
            <span className="text-muted-foreground">sedang berjalan</span>
          </div>
        )}
        {countdown && (
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-muted-foreground">Berikutnya</span>
            <span className="font-mono font-semibold text-foreground tabular-nums bg-muted/60 px-1.5 py-0.5 rounded">{countdown}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchScheduleBar;
