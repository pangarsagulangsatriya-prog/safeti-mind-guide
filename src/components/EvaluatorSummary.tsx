import { FileText, Clock, Loader2, CheckCircle, RotateCcw } from "lucide-react";

interface EvaluatorSummaryProps {
  stats: {
    totalLaporan: number;
    siapDievaluasi: number;
    dalamEvaluasi: number;
    selesai: number;
    perluReviewUlang: number;
  };
}

const EvaluatorSummary = ({ stats }: EvaluatorSummaryProps) => {
  return (
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
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
  );
};

export default EvaluatorSummary;
