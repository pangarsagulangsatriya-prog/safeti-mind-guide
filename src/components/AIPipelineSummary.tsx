import { Bot, Loader2, Clock, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AIPipelineSummaryProps {
  stats: {
    menungguAnalisisAI: number;
    sedangDiprosesAI: number;
    aiSelesai: number;
    aiGagal: number;
  };
}

const AIPipelineSummary = ({ stats }: AIPipelineSummaryProps) => {
  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });
  
  return (
    <div className="bg-card rounded-lg p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Pipeline Summary</h3>
            <p className="text-xs text-muted-foreground">Status antrian analisis AI untuk labeling</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{today}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <span className="text-xs text-info font-medium">Sedang Proses</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.sedangDiprosesAI}</p>
        </div>
        
        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-medium">Selesai</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.aiSelesai}</p>
        </div>
        
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive font-medium">Gagal</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.aiGagal}</p>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4">
        Hanya satu laporan diproses AI pada satu waktu. Laporan lain menunggu dalam antrian.
      </p>
    </div>
  );
};

export default AIPipelineSummary;