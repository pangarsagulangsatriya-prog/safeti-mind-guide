import React from 'react';
import { X, RotateCcw, AlertCircle, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QueueItem, AttemptRecord, statusDisplayConfig } from '@/data/queueMonitorData';

interface ErrorDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: QueueItem | null;
  attempts: AttemptRecord[];
  onRetry: (itemId: string) => void;
}

const resultIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-success" />,
  failed: <XCircle className="w-4 h-4 text-destructive" />,
  timeout: <Clock className="w-4 h-4 text-warning" />,
  error: <AlertCircle className="w-4 h-4 text-destructive" />,
};

const ErrorDetailsDrawer: React.FC<ErrorDetailsDrawerProps> = ({ open, onOpenChange, item, attempts, onRetry }) => {
  if (!item) return null;

  const statusConf = statusDisplayConfig[item.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Detail Error — #{item.id}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Item info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Report ID</p>
              <p className="font-mono font-semibold text-foreground">{item.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Batch ID</p>
              <p className="font-mono text-foreground">{item.batch_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge variant="outline" className={`${statusConf.bgColor} ${statusConf.color} ${statusConf.borderColor} mt-0.5`}>
                {statusConf.label}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Percobaan</p>
              <p className="font-medium text-foreground">{item.attempt_count}x</p>
            </div>
          </div>

          {/* Current error */}
          {item.last_error_message && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-medium text-destructive">{item.last_error_code}</span>
              </div>
              <p className="text-sm text-foreground">{item.last_error_message}</p>
            </div>
          )}

          <Separator />

          {/* Attempt History */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Riwayat Percobaan</h3>
            <div className="space-y-3">
              {attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada riwayat percobaan.</p>
              ) : (
                attempts.map((attempt) => (
                  <div key={attempt.attempt_number} className="relative pl-6 pb-3 border-l-2 border-border last:border-l-0">
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-0.5">
                      {resultIcons[attempt.result] || <div className="w-4 h-4 rounded-full bg-muted" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">
                          Percobaan #{attempt.attempt_number}
                        </span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                          attempt.result === 'success' ? 'bg-success/10 text-success border-success/30'
                          : attempt.result === 'timeout' ? 'bg-warning/10 text-warning border-warning/30'
                          : 'bg-destructive/10 text-destructive border-destructive/30'
                        }`}>
                          {attempt.result}
                        </Badge>
                        {attempt.duration && (
                          <span className="text-[10px] text-muted-foreground">{attempt.duration}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(attempt.timestamp).toLocaleString('id-ID')}
                      </p>
                      {attempt.processing_stage && (
                        <p className="text-xs text-muted-foreground">
                          Stage: <span className="text-foreground">{attempt.processing_stage}</span>
                        </p>
                      )}
                      {attempt.error_message && (
                        <p className="text-xs text-destructive/80 mt-1">{attempt.error_message}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {statusConf.retryEligible && (
              <Button size="sm" onClick={() => onRetry(item.id)} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Ulangi dari step yang disarankan
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download Logs
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ErrorDetailsDrawer;
