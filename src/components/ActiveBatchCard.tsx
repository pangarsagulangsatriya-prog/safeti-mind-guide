import React, { useState, useEffect } from 'react';
import { Loader2, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ActiveBatchInfo {
  batch_id: string;
  slot_time: string;
  start_at: string; // ISO
  elapsed_seconds: number;
  eta_seconds: number | null;
  fetched_count: number;
}

interface ActiveBatchCardProps {
  batch: ActiveBatchInfo | null;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const ActiveBatchCard: React.FC<ActiveBatchCardProps> = ({ batch }) => {
  const [elapsed, setElapsed] = useState(batch?.elapsed_seconds ?? 0);

  useEffect(() => {
    if (!batch) return;
    setElapsed(batch.elapsed_seconds);
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [batch]);

  if (!batch) return null;

  return (
    <div className="mb-4 flex items-center gap-4 flex-wrap px-4 py-3 rounded-lg border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-sm font-semibold text-foreground">Batch Aktif</span>
        <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">{batch.batch_id}</Badge>
        <span className="text-xs text-muted-foreground">(slot: {batch.slot_time} WIB)</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Mulai: <span className="font-medium text-foreground">{formatTime(batch.start_at)}</span>
        </span>
        <span>
          Elapsed: <span className="font-mono font-medium text-foreground">{formatElapsed(elapsed)}</span>
        </span>
        {batch.eta_seconds != null && (
          <span>
            ETA: <span className="font-mono font-medium text-foreground">{formatElapsed(batch.eta_seconds)}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          Fetched: <span className="font-medium text-foreground">{batch.fetched_count} hazard</span>
        </span>
      </div>
    </div>
  );
};

export default ActiveBatchCard;
