import { ClipboardCheck } from "lucide-react";

const FormChecker = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-lexical/10 flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-lexical" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Form Checker</h1>
            <p className="text-sm text-muted-foreground">
              Validasi kelengkapan dan konsistensi form laporan
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Form Checker Module
          </h2>
          <p className="text-muted-foreground">
            Modul ini akan memeriksa kelengkapan form dan validasi data laporan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormChecker;
