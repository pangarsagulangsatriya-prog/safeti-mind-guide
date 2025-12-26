import React from 'react';
import { Brain, ArrowRight, X, Eye, Sparkles, CheckCircle, XCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DuplicateReport } from '@/data/duplicateDetectionData';
import { cn } from '@/lib/utils';

interface SemanticTabProps {
  reports: DuplicateReport[];
  onSendToFinal: (reportId: string) => void;
  onMarkNotSameEvent: (reportId: string) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-semantic bg-semantic/10 border-semantic/30';
  if (score >= 50) return 'text-warning bg-warning/10 border-warning/30';
  return 'text-success bg-success/10 border-success/30';
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-semantic';
  if (score >= 50) return 'bg-warning';
  return 'bg-success';
};

const SemanticTab: React.FC<SemanticTabProps> = ({ reports, onSendToFinal, onMarkNotSameEvent }) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-semantic/10 flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-semantic" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tidak ada laporan di tahap Semantic
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Laporan akan muncul di sini setelah lolos analisis Lexical dan dilanjutkan ke Semantic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-semantic/5 border border-semantic/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-semantic/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-semantic" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Analisis Semantic (Makna & Gambar)</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Menilai apakah laporan menggambarkan KEJADIAN YANG SAMA berdasarkan konteks visual dan makna.
            </p>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.report_id} className="border-semantic/20 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-semantic/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-semantic" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold font-mono">
                      {report.report_id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {report.reporter} • {report.site}
                    </p>
                  </div>
                </div>
                
                {/* Context Scores (Read-only) */}
                <div className="flex items-center gap-2">
                  {report.geo_analysis && (
                    <Badge variant="outline" className="text-geo border-geo/30 bg-geo/5">
                      Geo: {report.geo_analysis.geo_score}%
                    </Badge>
                  )}
                  {report.lexical_analysis && (
                    <Badge variant="outline" className="text-lexical border-lexical/30 bg-lexical/5">
                      Lexical: {report.lexical_analysis.lexical_score}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Semantic Content - PRIMARY */}
              {report.semantic_analysis && (
                <>
                  {/* Image Viewer */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <ImageIcon className="w-3 h-3" />
                      Gambar (VLM Inspection)
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {report.semantic_analysis.image_urls.length > 0 ? (
                        report.semantic_analysis.image_urls.map((url, index) => (
                          <div 
                            key={index}
                            className="aspect-video bg-muted rounded-lg overflow-hidden border border-border/50"
                          >
                            <img 
                              src={url} 
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 bg-muted/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
                          Tidak ada gambar. Semantic hanya berdasarkan teks.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Context Match */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    {report.semantic_analysis.visual_context_match ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-semantic" />
                        <div>
                          <span className="text-sm font-medium text-semantic">Visual Context Match: TRUE</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Gambar menunjukkan konteks visual yang sama
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Visual Context Match: FALSE</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Konteks visual berbeda atau tidak tersedia
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Detected Objects & Scene */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Detected Objects & Conditions
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.semantic_analysis.detected_objects.map((obj, index) => (
                          <Badge 
                            key={index} 
                            className="bg-semantic/10 text-semantic border-semantic/30 font-normal"
                          >
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Scene Context</span>
                      <p className="text-sm bg-muted/30 rounded px-2 py-1.5">
                        {report.semantic_analysis.scene_context}
                      </p>
                    </div>
                  </div>

                  {/* Hazard Type */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Hazard Type</span>
                    <p className="text-sm font-medium text-semantic">
                      {report.semantic_analysis.hazard_type}
                    </p>
                  </div>

                  {/* Semantic Score */}
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Semantic Similarity Score</span>
                      <span className={cn("text-lg font-bold", 
                        report.semantic_analysis.semantic_score >= 80 ? "text-semantic" : 
                        report.semantic_analysis.semantic_score >= 50 ? "text-warning" : "text-success"
                      )}>
                        {report.semantic_analysis.semantic_score}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", getProgressColor(report.semantic_analysis.semantic_score))}
                        style={{ width: `${report.semantic_analysis.semantic_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                      <span className="text-semantic font-medium">Alasan: </span>
                      {report.semantic_analysis.semantic_reason}
                    </p>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkNotSameEvent(report.report_id)}
                  className="text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Bukan Kejadian Sama
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSendToFinal(report.report_id)}
                  className="bg-destructive hover:bg-destructive/90 text-white"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                  Kirim ke Final
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SemanticTab;
