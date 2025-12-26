import React from 'react';
import { Type, ArrowRight, X, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DuplicateReport } from '@/data/duplicateDetectionData';
import { cn } from '@/lib/utils';

interface LexicalTabProps {
  reports: DuplicateReport[];
  onAdvanceToSemantic: (reportId: string) => void;
  onMarkNotSimilar: (reportId: string) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-lexical bg-lexical/10 border-lexical/30';
  if (score >= 50) return 'text-warning bg-warning/10 border-warning/30';
  return 'text-success bg-success/10 border-success/30';
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-lexical';
  if (score >= 50) return 'bg-warning';
  return 'bg-success';
};

// Highlight matched phrases in text
const highlightText = (text: string, phrases: string[]) => {
  if (!phrases || phrases.length === 0) return text;
  
  let result = text;
  phrases.forEach(phrase => {
    const regex = new RegExp(`(${phrase})`, 'gi');
    result = result.replace(regex, '|||$1|||');
  });
  
  const parts = result.split('|||');
  return parts.map((part, index) => {
    const isHighlight = phrases.some(p => p.toLowerCase() === part.toLowerCase());
    if (isHighlight) {
      return (
        <span key={index} className="bg-lexical/20 text-lexical px-1 rounded font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
};

const LexicalTab: React.FC<LexicalTabProps> = ({ reports, onAdvanceToSemantic, onMarkNotSimilar }) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-lexical/10 flex items-center justify-center mb-4">
          <Type className="w-8 h-8 text-lexical" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tidak ada laporan di tahap Lexical
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Laporan akan muncul di sini setelah lolos analisis Geo dan dilanjutkan ke Lexical.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-lexical/5 border border-lexical/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-lexical/10 flex items-center justify-center flex-shrink-0">
            <Type className="w-4 h-4 text-lexical" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Analisis Lexical (Kemiripan Teks)</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Memeriksa kemiripan literal kata dan frasa. Data: Ketidaksesuaian, Sub-Ketidaksesuaian, Quick Action, Deskripsi Temuan.
            </p>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.report_id} className="border-lexical/20 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-lexical/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-lexical" />
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
                
                {/* Geo Context (Read-only) */}
                {report.geo_analysis && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-geo border-geo/30 bg-geo/5">
                      Geo: {report.geo_analysis.geo_score}%
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {report.geo_analysis.geo_cluster_id}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lexical Content - PRIMARY */}
              {report.lexical_analysis && (
                <>
                  {/* Categories */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Ketidaksesuaian</span>
                      <p className="text-sm font-medium">{report.lexical_analysis.ketidaksesuaian}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Sub-Ketidaksesuaian</span>
                      <p className="text-sm font-medium">{report.lexical_analysis.sub_ketidaksesuaian}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Quick Action</span>
                      <p className="text-sm font-medium">{report.lexical_analysis.quick_action}</p>
                    </div>
                  </div>

                  {/* Description with Highlights */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Deskripsi Temuan</span>
                    <p className="text-sm leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/50">
                      {highlightText(report.lexical_analysis.deskripsi_temuan, report.lexical_analysis.matched_phrases)}
                    </p>
                  </div>

                  {/* Matched Phrases */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      Matched Phrases
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.lexical_analysis.matched_phrases.map((phrase, index) => (
                        <Badge 
                          key={index} 
                          className="bg-lexical/10 text-lexical border-lexical/30 font-normal"
                        >
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Lexical Score */}
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Lexical Similarity Score</span>
                      <span className={cn("text-lg font-bold", 
                        report.lexical_analysis.lexical_score >= 80 ? "text-lexical" : 
                        report.lexical_analysis.lexical_score >= 50 ? "text-warning" : "text-success"
                      )}>
                        {report.lexical_analysis.lexical_score}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", getProgressColor(report.lexical_analysis.lexical_score))}
                        style={{ width: `${report.lexical_analysis.lexical_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                      <span className="text-lexical font-medium">Alasan: </span>
                      {report.lexical_analysis.lexical_reason}
                    </p>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkNotSimilar(report.report_id)}
                  className="text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Tidak Mirip Secara Teks
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAdvanceToSemantic(report.report_id)}
                  className="bg-semantic hover:bg-semantic/90 text-white"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                  Lanjut Semantic
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LexicalTab;
