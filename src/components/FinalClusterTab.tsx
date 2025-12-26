import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, GitMerge, GitBranch, Star, 
  Clock, User, ArrowRight, AlertTriangle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { DuplicateReport, DuplicateCluster, AuditLogEntry } from '@/data/duplicateDetectionData';
import { cn, formatDate } from '@/lib/utils';

interface FinalClusterTabProps {
  reports: DuplicateReport[];
  clusters: DuplicateCluster[];
  auditLog: AuditLogEntry[];
  onConfirmDuplicate: (reportId: string, notes: string) => void;
  onMarkNonDuplicate: (reportId: string, notes: string) => void;
  onMergeCluster: (clusterId: string, targetClusterId: string) => void;
  onSplitCluster: (clusterId: string, reportIds: string[]) => void;
  onChangeRepresentative: (clusterId: string, newRepId: string) => void;
}

const getDecisionColor = (status: string) => {
  switch (status) {
    case 'confirmed_duplicate':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    case 'potential_duplicate':
      return 'bg-warning/10 text-warning border-warning/30';
    case 'non_duplicate':
      return 'bg-success/10 text-success border-success/30';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const getDecisionLabel = (status: string) => {
  switch (status) {
    case 'confirmed_duplicate':
      return 'Confirmed Duplicate';
    case 'potential_duplicate':
      return 'Potential Duplicate';
    case 'non_duplicate':
      return 'Non-Duplicate';
    default:
      return 'Pending';
  }
};

const FinalClusterTab: React.FC<FinalClusterTabProps> = ({ 
  reports, 
  clusters, 
  auditLog,
  onConfirmDuplicate,
  onMarkNonDuplicate,
  onMergeCluster,
  onSplitCluster,
  onChangeRepresentative
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'confirm' | 'non_duplicate';
    reportId: string;
  }>({ open: false, type: 'confirm', reportId: '' });
  const [notes, setNotes] = useState('');

  const handleAction = () => {
    if (confirmDialog.type === 'confirm') {
      onConfirmDuplicate(confirmDialog.reportId, notes);
    } else {
      onMarkNonDuplicate(confirmDialog.reportId, notes);
    }
    setConfirmDialog({ open: false, type: 'confirm', reportId: '' });
    setNotes('');
  };

  if (reports.length === 0 && clusters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Belum ada duplicate cluster yang dikonfirmasi
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Laporan akan muncul di sini setelah melewati semua tahap analisis (Geo → Lexical → Semantic).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Final Duplicate Cluster</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Semua analisis selesai. Kelola cluster duplicate dan buat keputusan akhir.
            </p>
          </div>
        </div>
      </div>

      {/* Clusters */}
      {clusters.map((cluster) => {
        const clusterReports = reports.filter(r => r.cluster_id === cluster.cluster_id);
        const representative = reports.find(r => r.report_id === cluster.representative_report_id);

        return (
          <Card key={cluster.cluster_id} className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <GitMerge className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Cluster: {cluster.cluster_id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {cluster.member_report_ids.length} laporan
                    </p>
                  </div>
                </div>
                
                <Badge className={cn("font-medium", getDecisionColor(cluster.decision_status))}>
                  {getDecisionLabel(cluster.decision_status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {cluster.final_score}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4 text-geo" />
                    <span className="text-lg font-semibold text-geo">{cluster.geo_score}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Geo</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4 text-lexical" />
                    <span className="text-lg font-semibold text-lexical">{cluster.lexical_score}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Lexical</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4 text-semantic" />
                    <span className="text-lg font-semibold text-semantic">{cluster.semantic_score}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Semantic</div>
                </div>
              </div>

              {/* Representative Report */}
              {representative && (
                <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Representative Report</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-medium">{representative.report_id}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {representative.site} • {representative.lokasi}
                      </p>
                    </div>
                    <Badge variant="outline">{representative.reporter}</Badge>
                  </div>
                </div>
              )}

              {/* Member Reports */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Member Reports</span>
                <div className="space-y-2">
                  {cluster.member_report_ids.filter(id => id !== cluster.representative_report_id).map(reportId => {
                    const memberReport = reports.find(r => r.report_id === reportId);
                    return (
                      <div 
                        key={reportId}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm">{reportId}</span>
                          {memberReport && (
                            <span className="text-sm text-muted-foreground">
                              {memberReport.site} • {memberReport.lokasi}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onChangeRepresentative(cluster.cluster_id, reportId)}
                          className="text-xs"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set as Rep
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cluster Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <GitBranch className="w-3.5 h-3.5 mr-1.5" />
                        Manage Cluster
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {}}>
                        <GitMerge className="w-4 h-4 mr-2" />
                        Merge with Another Cluster
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <GitBranch className="w-4 h-4 mr-2" />
                        Split Cluster
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDialog({ 
                      open: true, 
                      type: 'non_duplicate', 
                      reportId: cluster.cluster_id 
                    })}
                    className="text-success border-success/30 hover:bg-success/10"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Mark Non-Duplicate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setConfirmDialog({ 
                      open: true, 
                      type: 'confirm', 
                      reportId: cluster.cluster_id 
                    })}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Confirm Duplicate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* AI Recommendation Label */}
      <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <span className="text-sm text-warning">
          <span className="font-medium">Saran AI</span> - Keputusan akhir tetap di tangan evaluator
        </span>
      </div>

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLog.slice(0, 5).map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium">{entry.user}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span>{entry.action}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {entry.before_status} → {entry.after_status}
                    </Badge>
                    <span className="text-xs">{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'confirm' ? 'Konfirmasi Duplicate' : 'Tandai Non-Duplicate'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'confirm' 
                ? 'Anda akan mengonfirmasi bahwa laporan dalam cluster ini adalah duplicate.'
                : 'Anda akan menandai cluster ini sebagai non-duplicate dan memisahkan laporan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan (opsional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan untuk audit log..."
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              className={confirmDialog.type === 'confirm' ? 'bg-destructive hover:bg-destructive/90' : 'bg-success hover:bg-success/90'}
            >
              {confirmDialog.type === 'confirm' ? 'Konfirmasi' : 'Tandai Non-Duplicate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FinalClusterTab;
