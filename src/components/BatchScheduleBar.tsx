import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SlotStatus = 'upcoming' | 'running' | 'done' | 'missed';

export interface ScheduleSlot {
  time: string; // e.g. "07:00"
  status: SlotStatus;
  batchId?: string;
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
  done: 'bg-success/10 text-success border-success/30',
  upcoming: 'bg-muted text-muted-foreground border-border',
  missed: 'bg-warning/10 text-warning border-warning/30',
};

function getNextBatchCountdown(slots: ScheduleSlot[]): string | null {
  const now = new Date();
  // Use WIB (UTC+7)
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

function getRunningSlot(slots: ScheduleSlot[]): ScheduleSlot | null {
  return slots.find(s => s.status === 'running') || null;
}

const BatchScheduleBar: React.FC<BatchScheduleBarProps> = ({ slots, onSlotClick, activeSlot }) => {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setCountdown(getNextBatchCountdown(slots));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [slots]);

  const running = getRunningSlot(slots);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jadwal Batch (WIB):</span>
      <div className="flex items-center gap-1.5">
        {slots.map(slot => (
          <button
            key={slot.time}
            onClick={() => onSlotClick(slot)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
              slotStyles[slot.status],
              activeSlot === slot.time && 'ring-2 ring-primary/40'
            )}
          >
            {slotIcons[slot.status]}
            {slot.time}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
        {running && (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Sedang berjalan: <span className="font-medium text-foreground">{running.time} batch</span></span>
          </span>
        )}
        {countdown && (
          <span>Batch berikutnya: <span className="font-mono font-medium text-foreground">{countdown}</span></span>
        )}
      </div>
    </div>
  );
};

export default BatchScheduleBar;
