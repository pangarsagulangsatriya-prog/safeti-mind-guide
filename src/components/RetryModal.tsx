import React from 'react';
import { AlertTriangle, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueueItem, QueueItemStatus, statusDisplayConfig } from '@/data/queueMonitorData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RetryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: QueueItem[];
  onRetry: (itemIds: string[]) => void;
}

const StatusBadge = ({ status }: { status: QueueItemStatus }) => {
  const conf = statusDisplayConfig[status];
  if (!conf) return null;
  return (
    <Badge variant="outline" className={`${conf.bgColor} ${conf.color} ${conf.borderColor} font-normal text-[11px] gap-1`}>
      {status === 'gagal' && <AlertCircle className="w-3 h-3" />}
      {conf.label}
    </Badge>
  );
};

const RetryModal: React.FC<RetryModalProps> = ({ open, onOpenChange, items, onRetry }) => {
  const eligible = items.filter(i => i.status === 'gagal');
  const skipped = items.filter(i => i.status !== 'gagal');
  const isSingle = items.length === 1;
  const item = isSingle ? items[0] : null;

  const handleSubmit = () => {
    onRetry(eligible.map(i => i.id));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Ulangi Proses
          </DialogTitle>
          <DialogDescription>
            {isSingle
              ? '1 laporan akan diproses ulang'
              : `${items.length} laporan akan diproses ulang`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Single item card */}
          {isSingle && item && (
            <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2.5">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground text-xs">ID</span>
                <span className="font-mono font-semibold text-xs">{item.id}</span>
                <span className="text-muted-foreground text-xs">Waktu</span>
                <span className="text-xs">{item.timestamp}</span>
                <span className="text-muted-foreground text-xs">Pelapor</span>
                <span className="text-xs font-medium">{item.pelapor}</span>
                <span className="text-muted-foreground text-xs">Site / Lokasi</span>
                <span className="text-xs">{item.site} • {item.lokasi}</span>
                <span className="text-muted-foreground text-xs">Perusahaan</span>
                <span className="text-xs">{item.perusahaan}</span>
                <span className="text-muted-foreground text-xs">Status</span>
                <div><StatusBadge status={item.status} /></div>
              </div>
              {item.last_error_message && (
                <div className="flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/10">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                  <p className="text-[11px] text-destructive/80 line-clamp-2">{item.last_error_message}</p>
                </div>
              )}
            </div>
          )}

          {/* Multiple items table */}
          {!isSingle && (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                  Gagal: {eligible.length}
                </Badge>
                {skipped.length > 0 && (
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                    Di-skip: {skipped.length}
                  </Badge>
                )}
              </div>
              <ScrollArea className="max-h-[240px] rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground py-2 px-3 bg-muted/50">ID</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground py-2 px-3 bg-muted/50">Waktu</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground py-2 px-3 bg-muted/50">Site</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground py-2 px-3 bg-muted/50">Lokasi</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground py-2 px-3 bg-muted/50">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(i => (
                      <TableRow key={i.id} className={i.status !== 'gagal' ? 'opacity-40' : ''}>
                        <TableCell className="py-2 px-3 text-xs font-mono font-semibold">{i.id}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">{i.timestamp}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-muted-foreground">{i.site}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-muted-foreground truncate max-w-[120px]">{i.lokasi}</TableCell>
                        <TableCell className="py-2 px-3"><StatusBadge status={i.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}

          {/* Skipped warning */}
          {skipped.length > 0 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                {skipped.length} item tidak eligible (status: {[...new Set(skipped.map(s => s.status))].join(', ')}) dan akan di-skip.
              </p>
            </div>
          )}

          {/* Cost warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-foreground/80">
                Tindakan ini akan memproses ulang laporan dan dapat menambah biaya pemrosesan (LLM/compute).
              </p>
              <p className="text-[11px] text-muted-foreground">
                Gunakan retry hanya jika diperlukan.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={eligible.length === 0}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Ulangi Proses{eligible.length > 1 ? ` (${eligible.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetryModal;
