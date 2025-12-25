import { AlertTriangle, Shield, BookOpen, TrendingUp, Copy, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HazardReport, reportClusters } from "@/data/hazardReports";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface PriorityAnalyticsProps {
  reports: HazardReport[];
  onFilterByLabel: (label: 'TBC' | 'PSPP' | 'GR') => void;
  onShowDuplicates: () => void;
  onShowNonDuplicates: () => void;
}

const PriorityAnalytics = ({ reports, onFilterByLabel, onShowDuplicates, onShowNonDuplicates }: PriorityAnalyticsProps) => {
  // Calculate label statistics
  const labelStats = {
    TBC: reports.filter(r => r.labels?.includes('TBC')).length,
    PSPP: reports.filter(r => r.labels?.includes('PSPP')).length,
    GR: reports.filter(r => r.labels?.includes('GR')).length,
  };

  // Calculate duplicate statistics
  const duplicateStats = {
    strongDuplicate: reportClusters.filter(c => c.status === 'Duplikat Kuat').reduce((acc, c) => acc + c.reportCount, 0),
    possibleDuplicate: reportClusters.filter(c => c.status === 'Duplikat Mungkin').reduce((acc, c) => acc + c.reportCount, 0),
    unique: reports.filter(r => !r.cluster).length,
  };

  const totalReports = reports.length;
  const duplicateRate = ((duplicateStats.strongDuplicate + duplicateStats.possibleDuplicate) / totalReports * 100).toFixed(1);

  // Priority reports: has TBC/PSPP/GR label AND is not in a "Duplikat Kuat" cluster
  const strongDuplicateClusters = reportClusters
    .filter(c => c.status === 'Duplikat Kuat')
    .map(c => c.id);

  const priorityReports = reports.filter(r => {
    const hasLabel = r.labels && r.labels.length > 0;
    const isStrongDuplicate = r.cluster && strongDuplicateClusters.includes(r.cluster);
    return hasLabel && !isStrongDuplicate;
  });

  const pendingPriorityReports = priorityReports.filter(r => r.evaluationStatus === 'BELUM_DIEVALUASI');

  // Pie chart data for labels
  const labelPieData = [
    { name: 'TBC', value: labelStats.TBC, color: 'hsl(38 92% 50%)' },
    { name: 'PSPP', value: labelStats.PSPP, color: 'hsl(199 89% 48%)' },
    { name: 'GR', value: labelStats.GR, color: 'hsl(142 76% 36%)' },
  ];

  // Bar chart data for duplicate analysis
  const duplicateBarData = [
    { name: 'Duplikat Kuat', count: duplicateStats.strongDuplicate, color: 'hsl(0 84% 60%)' },
    { name: 'Duplikat Mungkin', count: duplicateStats.possibleDuplicate, color: 'hsl(38 92% 50%)' },
    { name: 'Unik', count: duplicateStats.unique, color: 'hsl(142 76% 36%)' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{payload[0].value} laporan</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Priority Queue Alert */}
      <div className="bg-gradient-to-r from-warning/10 via-info/10 to-success/10 rounded-lg p-4 border border-warning/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Antrian Prioritas</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-2xl font-bold text-foreground">{pendingPriorityReports.length}</span> laporan dengan label TBC/PSPP/GR menunggu review (bukan duplikat kuat)
            </p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={onShowNonDuplicates}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Lihat Antrian Prioritas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Label Analytics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => onFilterByLabel('TBC')}
          className="bg-card rounded-lg p-4 card-shadow hover:shadow-md transition-all border-l-4 border-warning text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium text-warning">TBC</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{labelStats.TBC}</p>
          <p className="text-xs text-muted-foreground">To be Concern Hazard</p>
        </button>

        <button 
          onClick={() => onFilterByLabel('PSPP')}
          className="bg-card rounded-lg p-4 card-shadow hover:shadow-md transition-all border-l-4 border-info text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-info" />
            <span className="text-xs font-medium text-info">PSPP</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{labelStats.PSPP}</p>
          <p className="text-xs text-muted-foreground">Sanksi Pelanggaran</p>
        </button>

        <button 
          onClick={() => onFilterByLabel('GR')}
          className="bg-card rounded-lg p-4 card-shadow hover:shadow-md transition-all border-l-4 border-success text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-success">GR</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{labelStats.GR}</p>
          <p className="text-xs text-muted-foreground">Safety Golden Rules</p>
        </button>
      </div>

      {/* Duplicate Rate Monitor */}
      <div className="bg-card rounded-lg p-4 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Duplicate Rate Monitor</h3>
          </div>
          <Badge variant="outline" className={Number(duplicateRate) > 50 ? 'border-destructive text-destructive' : 'border-success text-success'}>
            {duplicateRate}% Duplicate
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duplicate Distribution */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Distribusi Duplikasi</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={duplicateBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {duplicateBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <button 
              onClick={onShowDuplicates}
              className="w-full flex items-center justify-between p-2 bg-destructive/5 rounded-lg hover:bg-destructive/10 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-sm text-foreground">Duplikat Kuat</span>
              </div>
              <span className="text-sm font-bold text-destructive">{duplicateStats.strongDuplicate}</span>
            </button>

            <div className="flex items-center justify-between p-2 bg-warning/5 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm text-foreground">Duplikat Mungkin</span>
              </div>
              <span className="text-sm font-bold text-warning">{duplicateStats.possibleDuplicate}</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-success/5 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm text-foreground">Laporan Unik</span>
              </div>
              <span className="text-sm font-bold text-success">{duplicateStats.unique}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Overview */}
      <div className="bg-card rounded-lg p-4 card-shadow">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Top Cluster Issues</h3>
        </div>
        <div className="space-y-2">
          {reportClusters.slice(0, 3).map((cluster) => (
            <div key={cluster.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{cluster.id}</span>
                  <Badge 
                    variant="outline" 
                    className={
                      cluster.status === 'Duplikat Kuat' 
                        ? 'border-destructive/50 text-destructive text-xs' 
                        : cluster.status === 'Duplikat Mungkin'
                        ? 'border-warning/50 text-warning text-xs'
                        : 'border-success/50 text-success text-xs'
                    }
                  >
                    {cluster.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{cluster.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{cluster.reportCount}</p>
                <p className="text-xs text-muted-foreground">laporan</p>
              </div>
              <div className="w-16">
                <Progress value={cluster.similarityScore * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground text-center mt-0.5">{(cluster.similarityScore * 100).toFixed(0)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriorityAnalytics;
