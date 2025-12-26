import React from 'react';
import { MapPin, Navigation, ArrowRight, X, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DuplicateReport } from '@/data/duplicateDetectionData';
import { cn } from '@/lib/utils';

interface GeoTabProps {
  reports: DuplicateReport[];
  onAdvanceToLexical: (reportId: string) => void;
  onExcludeFromCluster: (reportId: string) => void;
}

// Group reports by geo_cluster_id
const groupByCluster = (reports: DuplicateReport[]) => {
  const clusters: Record<string, DuplicateReport[]> = {};
  reports.forEach(report => {
    const clusterId = report.geo_analysis?.geo_cluster_id || 'unclustered';
    if (!clusters[clusterId]) {
      clusters[clusterId] = [];
    }
    clusters[clusterId].push(report);
  });
  return clusters;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-geo bg-geo/10 border-geo/30';
  if (score >= 50) return 'text-warning bg-warning/10 border-warning/30';
  return 'text-success bg-success/10 border-success/30';
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-geo';
  if (score >= 50) return 'bg-warning';
  return 'bg-success';
};

const GeoTab: React.FC<GeoTabProps> = ({ reports, onAdvanceToLexical, onExcludeFromCluster }) => {
  const clusters = groupByCluster(reports);

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-geo/10 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-geo" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tidak ada laporan di tahap Geo
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Laporan akan muncul di sini setelah analisis lokasi dimulai dari Queue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-geo/5 border border-geo/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-geo/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-geo" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Analisis Geo (Lokasi Fisik)</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Mengelompokkan laporan berdasarkan kedekatan lokasi fisik. Data yang ditampilkan: Site, Lokasi, Koordinat, Jarak.
            </p>
          </div>
        </div>
      </div>

      {/* Clusters */}
      {Object.entries(clusters).map(([clusterId, clusterReports]) => {
        const avgScore = clusterReports.reduce((sum, r) => sum + (r.geo_analysis?.geo_score || 0), 0) / clusterReports.length;
        const minDistance = Math.min(...clusterReports.map(r => r.geo_analysis?.distance_to_cluster_center || 0));
        const maxDistance = Math.max(...clusterReports.map(r => r.geo_analysis?.distance_to_cluster_center || 0));

        return (
          <Card key={clusterId} className="border-geo/20 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-geo/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-geo" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Geo Cluster: {clusterId}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {clusterReports.length} laporan • Jarak: {minDistance}–{maxDistance}m
                    </p>
                  </div>
                </div>
                <Badge className={cn("font-mono", getScoreColor(avgScore))}>
                  Geo Score: {avgScore.toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {clusterReports.map((report) => (
                <div 
                  key={report.report_id}
                  className="bg-muted/30 rounded-lg p-4 border border-border/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Report ID & Basic Info */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {report.report_id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {report.reporter}
                        </span>
                      </div>

                      {/* Location Details - GEO FOCUSED */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Site</span>
                          <p className="text-sm font-medium">{report.site}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Lokasi</span>
                          <p className="text-sm font-medium">{report.lokasi}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Detail Lokasi</span>
                          <p className="text-sm">{report.detail_lokasi}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Koordinat</span>
                          <p className="text-sm font-mono">
                            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {/* Geo Score & Reason */}
                      {report.geo_analysis && (
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Geo Similarity</span>
                                <span className={cn("text-sm font-medium", 
                                  report.geo_analysis.geo_score >= 80 ? "text-geo" : 
                                  report.geo_analysis.geo_score >= 50 ? "text-warning" : "text-success"
                                )}>
                                  {report.geo_analysis.geo_score}%
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full transition-all", getProgressColor(report.geo_analysis.geo_score))}
                                  style={{ width: `${report.geo_analysis.geo_score}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Navigation className="w-3.5 h-3.5" />
                              {report.geo_analysis.distance_to_cluster_center}m
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                            <span className="text-geo font-medium">Alasan: </span>
                            {report.geo_analysis.geo_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => onAdvanceToLexical(report.report_id)}
                        className="bg-lexical hover:bg-lexical/90 text-white"
                      >
                        <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                        Lanjut Lexical
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onExcludeFromCluster(report.report_id)}
                        className="text-muted-foreground"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Exclude
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GeoTab;
