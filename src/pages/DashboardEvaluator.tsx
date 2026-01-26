import { LayoutDashboard } from "lucide-react";

const DashboardEvaluator = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-semantic/10 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-semantic" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Evaluator</h1>
            <p className="text-sm text-muted-foreground">
              Ringkasan dan statistik evaluasi laporan
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Dashboard Evaluator Module
          </h2>
          <p className="text-muted-foreground">
            Modul ini menampilkan statistik dan ringkasan hasil evaluasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardEvaluator;
