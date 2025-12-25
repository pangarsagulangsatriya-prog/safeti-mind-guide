import { useState } from "react";
import { X, Users, AlertTriangle, CheckCircle, HelpCircle, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClusterInfo, hazardReports } from "@/data/hazardReports";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from "recharts";
interface ClusterPanelProps {
  cluster: ClusterInfo;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
}

const getStatusColor = (status: ClusterInfo['status']) => {
  switch (status) {
    case 'Duplikat Kuat':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'Duplikat Mungkin':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Bukan Duplikat':
      return 'bg-success/10 text-success border-success/20';
  }
};

const getStatusIcon = (status: ClusterInfo['status']) => {
  switch (status) {
    case 'Duplikat Kuat':
      return <AlertTriangle className="w-4 h-4" />;
    case 'Duplikat Mungkin':
      return <HelpCircle className="w-4 h-4" />;
    case 'Bukan Duplikat':
      return <CheckCircle className="w-4 h-4" />;
  }
};

const componentLabels: Record<string, { label: string; type: string }> = {
  locationRadius: { label: "Location Radius ≤ 1km", type: "Rules (geo)" },
  locationName: { label: "Location Name Exact", type: "Leksikal/Rules" },
  detailLocation: { label: "Detail Location Exact", type: "Leksikal/Rules" },
  locationDescription: { label: "Location Description", type: "Semantik" },
  nonCompliance: { label: "Non-Compliance Exact", type: "Leksikal/Rules" },
  subNonCompliance: { label: "Sub Non-Compliance Exact", type: "Leksikal/Rules" },
  imageContext: { label: "Image Context", type: "Semantik" },
  findingDescription: { label: "Finding Description", type: "Semantik" }
};

const ClusterPanel = ({ cluster, onClose, onSelectReport }: ClusterPanelProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Get reports in this cluster
  const clusterReports = hazardReports.filter(r => r.cluster === cluster.id);
  
  const getScoreColor = (score: number) => {
    if (score >= 0.75) return "text-success";
    if (score >= 0.5) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 0.75) return "bg-success";
    if (score >= 0.5) return "bg-warning";
    return "bg-destructive";
  };

  // Prepare radar chart data
  const radarData = [
    { 
      subject: "Loc. Radius", 
      value: cluster.components.locationRadius * 100, 
      fullMark: 100,
      type: "Geo"
    },
    { 
      subject: "Loc. Name", 
      value: cluster.components.locationName * 100, 
      fullMark: 100,
      type: "Leksikal"
    },
    { 
      subject: "Detail Loc.", 
      value: cluster.components.detailLocation * 100, 
      fullMark: 100,
      type: "Leksikal"
    },
    { 
      subject: "Loc. Desc.", 
      value: cluster.components.locationDescription * 100, 
      fullMark: 100,
      type: "Semantik"
    },
    { 
      subject: "Non-Compl.", 
      value: cluster.components.nonCompliance * 100, 
      fullMark: 100,
      type: "Leksikal"
    },
    { 
      subject: "Sub Non-C.", 
      value: cluster.components.subNonCompliance * 100, 
      fullMark: 100,
      type: "Leksikal"
    },
    { 
      subject: "Image Ctx.", 
      value: cluster.components.imageContext * 100, 
      fullMark: 100,
      type: "Semantik"
    },
    { 
      subject: "Finding", 
      value: cluster.components.findingDescription * 100, 
      fullMark: 100,
      type: "Semantik"
    },
  ];

  // Custom tooltip for radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.subject}</p>
          <p className="text-xs text-muted-foreground">Tipe: {data.type}</p>
          <p className={`text-sm font-bold ${getScoreColor(data.value / 100)}`}>
            Score: {data.value.toFixed(0)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{cluster.id}: {cluster.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(cluster.status)}>
                  {getStatusIcon(cluster.status)}
                  <span className="ml-1">{cluster.status}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {cluster.reportCount} laporan
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Similarity Score */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Skor Kemiripan</span>
              <span className={`text-2xl font-bold ${getScoreColor(cluster.similarityScore)}`}>
                {(cluster.similarityScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(cluster.similarityScore)} transition-all`}
                style={{ width: `${cluster.similarityScore * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{"< 0.50 = Bukan Duplikat"}</span>
              <span>0.50-0.74 = Mungkin</span>
              <span>{"≥ 0.75 = Duplikat Kuat"}</span>
            </div>
          </div>

          {/* Radar Chart Visualization */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Visualisasi Komponen Penilaian</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    tickCount={5}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend for types */}
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <span className="text-xs text-muted-foreground">Rule-Based (Geo)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-info/60" />
                <span className="text-xs text-muted-foreground">Leksikal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="text-xs text-muted-foreground">Semantik</span>
              </div>
            </div>
          </div>

          {/* Component Scores Detail */}
          <div>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">Detail Tabel Komponen</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showDetails && (
              <div className="mt-2 space-y-2">
                {Object.entries(cluster.components).map(([key, value]) => {
                  const info = componentLabels[key];
                  return (
                    <div key={key} className="flex items-center gap-3 p-2 bg-muted/20 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{info.label}</p>
                        <p className="text-xs text-muted-foreground">{info.type}</p>
                      </div>
                      <div className="w-24">
                        <Progress value={value * 100} className="h-2" />
                      </div>
                      <span className={`text-sm font-medium w-12 text-right ${getScoreColor(value)}`}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reports in Cluster with Duplicate Scores */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Laporan dalam Cluster ({clusterReports.length})</h4>
            <div className="space-y-3">
              {clusterReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{report.id}</p>
                          {report.duplicateScores && (
                            <Badge variant="outline" className={`text-xs ${
                              report.duplicateScores.overall >= 0.75 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              report.duplicateScores.overall >= 0.5 ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-success/10 text-success border-success/20'
                            }`}>
                              {(report.duplicateScores.overall * 100).toFixed(0)}% Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{report.deskripsiTemuan}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{report.tanggal}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{report.lokasi}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onSelectReport(report.id)}
                      className="shrink-0"
                    >
                      Lihat Detail
                    </Button>
                  </div>
                  
                  {/* Duplicate Score Breakdown */}
                  {report.duplicateScores && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Breakdown Skor Duplicate:</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-background/50 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Rule-Based</span>
                            <span className={`text-xs font-bold ${getScoreColor(report.duplicateScores.ruleBased)}`}>
                              {(report.duplicateScores.ruleBased * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={report.duplicateScores.ruleBased * 100} className="h-1 mt-1" />
                          <p className="text-[10px] text-muted-foreground mt-1">Kecocokan aturan tetap</p>
                        </div>
                        <div className="bg-background/50 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Geo</span>
                            <span className={`text-xs font-bold ${getScoreColor(report.duplicateScores.geo)}`}>
                              {(report.duplicateScores.geo * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={report.duplicateScores.geo * 100} className="h-1 mt-1" />
                          <p className="text-[10px] text-muted-foreground mt-1">Kedekatan lokasi</p>
                        </div>
                        <div className="bg-background/50 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Lexical</span>
                            <span className={`text-xs font-bold ${getScoreColor(report.duplicateScores.lexical)}`}>
                              {(report.duplicateScores.lexical * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={report.duplicateScores.lexical * 100} className="h-1 mt-1" />
                          <p className="text-[10px] text-muted-foreground mt-1">Kesamaan kata</p>
                        </div>
                        <div className="bg-background/50 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Semantic</span>
                            <span className={`text-xs font-bold ${getScoreColor(report.duplicateScores.semantic)}`}>
                              {(report.duplicateScores.semantic * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={report.duplicateScores.semantic * 100} className="h-1 mt-1" />
                          <p className="text-[10px] text-muted-foreground mt-1">Kesamaan makna</p>
                        </div>
                      </div>
                      
                      {/* Reasoning/Explanation */}
                      <div className="mt-2 p-2 bg-info/5 rounded border border-info/20">
                        <p className="text-xs text-info font-medium mb-1">💡 Alasan Duplicate:</p>
                        <p className="text-xs text-muted-foreground">
                          {report.duplicateScores.overall >= 0.75 
                            ? `Laporan ini memiliki kemiripan tinggi (${(report.duplicateScores.overall * 100).toFixed(0)}%) dengan laporan lain dalam cluster. Kecocokan terkuat pada ${
                                report.duplicateScores.ruleBased >= report.duplicateScores.geo && report.duplicateScores.ruleBased >= report.duplicateScores.lexical && report.duplicateScores.ruleBased >= report.duplicateScores.semantic 
                                ? 'aturan tetap (rule-based)' 
                                : report.duplicateScores.geo >= report.duplicateScores.lexical && report.duplicateScores.geo >= report.duplicateScores.semantic 
                                ? 'lokasi geografis' 
                                : report.duplicateScores.lexical >= report.duplicateScores.semantic 
                                ? 'kesamaan kata' 
                                : 'kesamaan makna'
                              }.`
                            : report.duplicateScores.overall >= 0.5
                            ? `Laporan ini mungkin duplicate (${(report.duplicateScores.overall * 100).toFixed(0)}%). Perlu validasi manual untuk memastikan.`
                            : `Laporan ini memiliki kemiripan rendah (${(report.duplicateScores.overall * 100).toFixed(0)}%). Kemungkinan bukan duplicate.`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {clusterReports.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada laporan dalam cluster ini (data dummy)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button>Review Semua</Button>
        </div>
      </div>
    </div>
  );
};

export default ClusterPanel;