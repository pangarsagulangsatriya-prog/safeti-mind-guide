import { Bot, Loader2, Clock, FileText, CheckCircle, AlertTriangle, RotateCcw, AlertCircle } from "lucide-react";

interface DashboardSummaryCardsProps {
  stats: {
    menungguAnalisisAI: number;
    sedangDiprosesAI: number;
    aiGagal: number;
    totalLaporan: number;
    siapDievaluasi: number;
    dalamEvaluasi: number;
    selesai: number;
    perluReviewUlang: number;
    painPoints: number;
  };
}

const DashboardSummaryCards = ({ stats }: DashboardSummaryCardsProps) => {
  return (
    <div className="space-y-6">
      {/* AI Pipeline Summary */}
      <div className="bg-card rounded-lg p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Pipeline Summary</h3>
            <p className="text-xs text-muted-foreground">Status antrian analisis AI</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-xs text-warning font-medium">Menunggu AI</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.menungguAnalisisAI}</p>
          </div>
          
          <div className="bg-info/5 border border-info/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 text-info animate-spin" />
              <span className="text-xs text-info font-medium">Sedang Diproses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.sedangDiprosesAI}</p>
          </div>
          
          {stats.aiGagal > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-xs text-destructive font-medium">AI Gagal</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{stats.aiGagal}</p>
            </div>
          )}
        </div>
      </div>

      {/* Evaluator Workflow Summary */}
      <div className="bg-card rounded-lg p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <FileText className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Evaluator Workflow Summary</h3>
            <p className="text-xs text-muted-foreground">Laporan siap untuk evaluasi manual</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Total Laporan</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalLaporan.toLocaleString()}</p>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">Siap Dievaluasi</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.siapDievaluasi.toLocaleString()}</p>
          </div>
          
          <div className="bg-info/5 border border-info/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 text-info" />
              <span className="text-xs text-info font-medium">Dalam Evaluasi</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.dalamEvaluasi}</p>
          </div>
          
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs text-success font-medium">Selesai</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.selesai}</p>
          </div>
          
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive font-medium">Pain Points</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{stats.painPoints}</p>
          </div>
        </div>

        {stats.perluReviewUlang > 0 && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning">
              {stats.perluReviewUlang} laporan memerlukan review ulang
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSummaryCards;