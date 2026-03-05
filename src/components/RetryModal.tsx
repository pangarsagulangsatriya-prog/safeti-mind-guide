import React, { useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QueueItemStatus, retryReasonOptions, retryStepScopeOptions } from '@/data/queueMonitorData';

interface RetryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<{ id: string; status: QueueItemStatus }>;
  mode: 'items' | 'batch';
  batchId?: string;
  onRetry: (config: RetryConfig) => void;
}

export interface RetryConfig {
  mode: 'items' | 'batch';
  item_ids: string[];
  batch_id?: string;
  retry_scope: string;
  step_scope: string;
  max_attempts: number;
  reason_code: string;
  reason_note: string;
}

const RetryModal: React.FC<RetryModalProps> = ({ open, onOpenChange, items, mode, batchId, onRetry }) => {
  const [retryScope, setRetryScope] = useState('failed_only');
  const [stepScope, setStepScope] = useState('clustering_scoring');
  const [reasonCode, setReasonCode] = useState('');
  const [reasonNote, setReasonNote] = useState('');

  const eligibleStatuses: QueueItemStatus[] = ['gagal'];
  const eligible = items.filter(i => eligibleStatuses.includes(i.status));
  const skipped = items.filter(i => !eligibleStatuses.includes(i.status));

  const failedCount = items.filter(i => i.status === 'gagal').length;

  const handleSubmit = () => {
    if (!reasonCode) return;
    onRetry({
      mode,
      item_ids: eligible.map(i => i.id),
      batch_id: batchId,
      retry_scope: retryScope,
      step_scope: stepScope,
      max_attempts: 1,
      reason_code: reasonCode,
      reason_note: reasonNote,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Ulangi Proses
          </DialogTitle>
          <DialogDescription>
            {mode === 'batch'
              ? `Retry items dari batch ${batchId}`
              : `${items.length} item dipilih`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-sm font-medium text-foreground">Ringkasan</p>
            <div className="flex flex-wrap gap-2">
              {failedCount > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                  Gagal: {failedCount}
                </Badge>
              )}
              {skipped.length > 0 && (
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                  Di-skip: {skipped.length}
                </Badge>
              )}
            </div>
            {skipped.length > 0 && (
              <div className="flex items-start gap-2 mt-2 p-2 rounded bg-warning/5 border border-warning/20">
                <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {skipped.length} item tidak eligible untuk retry (status: {[...new Set(skipped.map(s => s.status))].join(', ')}) dan akan di-skip.
                </p>
              </div>
            )}
          </div>

          {/* Retry Scope */}
          <div className="space-y-1.5">
            <Label className="text-sm">Retry Mode</Label>
            <Select value={retryScope} onValueChange={setRetryScope}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="failed_only">Retry yang gagal saja</SelectItem>
                <SelectItem value="stuck_only">Retry yang tersangkut saja</SelectItem>
                <SelectItem value="failed_and_stuck">Retry gagal + tersangkut</SelectItem>
                {mode === 'batch' && (
                  <SelectItem value="entire_batch">Jalankan ulang seluruh batch</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {retryScope === 'entire_batch' && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">
                Menjalankan ulang seluruh batch akan memproses ulang semua item termasuk yang sudah sukses. Pastikan Anda yakin.
              </p>
            </div>
          )}

          {/* Step Scope */}
          <div className="space-y-1.5">
            <Label className="text-sm">Scope Langkah</Label>
            <Select value={stepScope} onValueChange={setStepScope}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {retryStepScopeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-sm">Alasan <span className="text-destructive">*</span></Label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger><SelectValue placeholder="Pilih alasan..." /></SelectTrigger>
              <SelectContent>
                {retryReasonOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Catatan (opsional)</Label>
            <Textarea
              placeholder="Tambahkan catatan..."
              value={reasonNote}
              onChange={e => setReasonNote(e.target.value)}
              className="h-16 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={!reasonCode || eligible.length === 0}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Ulangi Proses ({eligible.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetryModal;
