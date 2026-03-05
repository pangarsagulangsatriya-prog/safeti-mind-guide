import React, { useState } from 'react';
import { History, RotateCcw, ChevronRight, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BatchRecord } from '@/data/queueMonitorData';

interface BatchHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: BatchRecord[];
  onRetryBatch: (batchId: string, scope: 'failed_only' | 'entire_batch') => void;
  onViewBatchDetail: (batchId: string) => void;
}

const batchStatusBadge = (status: BatchRecord['status']) => {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: 'Selesai', className: 'bg-success/10 text-success border-success/30' },
    partial: { label: 'Sebagian', className: 'bg-warning/10 text-warning border-warning/30' },
    failed: { label: 'Gagal', className: 'bg-destructive/10 text-destructive border-destructive/30' },
    running: { label: 'Berjalan', className: 'bg-info/10 text-info border-info/30' },
  };
  const conf = map[status] || map.completed;
  return <Badge variant="outline" className={conf.className}>{conf.label}</Badge>;
};

const formatBatchTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const BatchHistoryDrawer: React.FC<BatchHistoryDrawerProps> = ({ open, onOpenChange, batches, onRetryBatch, onViewBatchDetail }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Riwayat Batch
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3">
          {batches.map((batch) => {
            const hasFailures = batch.failed > 0 || batch.stuck > 0 || batch.needs_check > 0;
            return (
              <div key={batch.batch_id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{batch.batch_id}</span>
                      {batchStatusBadge(batch.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBatchTime(batch.window_start)} — {formatBatchTime(batch.window_end)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {batch.triggered_by === 'manual' ? '👤 Manual' : '⚙️ System'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{batch.duration}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground">Total: <span className="font-medium text-foreground">{batch.total}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span className="text-xs text-success">{batch.success}</span>
                  </div>
                  {batch.failed > 0 && (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-3 h-3 text-destructive" />
                      <span className="text-xs text-destructive">{batch.failed}</span>
                    </div>
                  )}
                  {batch.needs_check > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-warning" />
                      <span className="text-xs text-warning">{batch.needs_check}</span>
                    </div>
                  )}
                  {batch.stuck > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-destructive" />
                      <span className="text-xs text-destructive">{batch.stuck} stuck</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {hasFailures && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-7"
                        onClick={() => onRetryBatch(batch.batch_id, 'failed_only')}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Ulangi yang Gagal
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs h-7 text-muted-foreground"
                        onClick={() => onViewBatchDetail(batch.batch_id)}
                      >
                        Detail
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BatchHistoryDrawer;
