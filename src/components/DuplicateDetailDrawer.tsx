import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin, FileText, Brain, User, Calendar, Building2, 
  CheckCircle2, XCircle, RefreshCw, GitMerge, ChevronDown,
  AlertTriangle, Loader2, ExternalLink, Image, Sparkles,
  Clock, Info, MoreHorizontal, Layers, Scissors
} from "lucide-react";
import { DuplicateReport, DuplicateCluster, DuplicateCandidate } from "@/data/duplicateDetectionData";
import { toast } from "sonner";

interface DuplicateDetailDrawerProps {
  report: DuplicateReport | null;
  isOpen: boolean;
  onClose: () => void;
  clusters: DuplicateCluster[];
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", { 
    day: "2-digit", 
    month: "long",
    year: "numeric",
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-destructive";
  if (score >= 50) return "text-warning";
  return "text-success";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-destructive";
  if (score >= 50) return "bg-warning";
  return "bg-success";
};

const getRecommendationBadge = (recommendation: DuplicateReport['ai_recommendation']) => {
  switch (recommendation) {
    case 'duplicate':
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Duplicate</Badge>;
    case 'potential_duplicate':
      return <Badge className="bg-warning/20 text-warning border-warning/30">Potential Duplicate</Badge>;
    case 'non_duplicate':
      return <Badge className="bg-success/20 text-success border-success/30">Non-Duplicate</Badge>;
  }
};

const DuplicateDetailDrawer = ({ report, isOpen, onClose, clusters }: DuplicateDetailDrawerProps) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'reject' | 'rerun' | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  if (!report) return null;

  const cluster = clusters.find(c => c.cluster_id === report.cluster_id);

  const handleConfirmDuplicate = () => {
    if (selectedCandidates.length === 0 && report.candidates.length > 0) {
      toast.error("Pilih minimal 1 kandidat untuk dikonfirmasi sebagai duplicate");
      return;
    }
    setConfirmAction('confirm');
    setConfirmDialogOpen(true);
  };

  const handleMarkNonDuplicate = () => {
    setConfirmAction('reject');
    setConfirmDialogOpen(true);
  };

  const handleRerun = () => {
    setConfirmAction('rerun');
    setConfirmDialogOpen(true);
  };

  const executeAction = () => {
    if (confirmAction === 'confirm') {
      toast.success("Laporan dikonfirmasi sebagai duplicate");
    } else if (confirmAction === 'reject') {
      toast.success("Laporan ditandai sebagai non-duplicate");
    } else if (confirmAction === 'rerun') {
      toast.success("Analisis ulang dijadwalkan");
    }
    setConfirmDialogOpen(false);
    setNotes("");
    onClose();
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[900px] p-0 bg-card border-border">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                    <span className="font-mono">{report.report_id}</span>
                    {report.status === 'processing' && (
                      <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Sedang Diproses
                      </Badge>
                    )}
                    {report.status === 'error' && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Error
                      </Badge>
                    )}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Duplicate Review Panel
                  </p>
                </div>
                {cluster && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
                    <Layers className="w-3 h-3" />
                    {cluster.cluster_id} • {cluster.member_count} anggota
                  </Badge>
                )}
              </div>
            </SheetHeader>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left: Laporan Utama */}
                <div className="p-4 border-r border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Laporan Utama
                  </h3>

                  {/* Report Info */}
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-foreground">{report.pelapor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-foreground text-xs">{formatTimestamp(report.timestamp)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 mt-0.5" />
                      <div>
                        <Badge variant="outline" className="text-xs mr-2">{report.site}</Badge>
                        <span className="text-foreground">{report.lokasi}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{report.detail_lokasi}</p>
                      </div>
                    </div>

                    {report.latitude && report.longitude && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono">{report.latitude}, {report.longitude}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Map
                        </Button>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ketidaksesuaian</p>
                      <p className="text-sm text-foreground">{report.ketidaksesuaian}</p>
                      <p className="text-xs text-muted-foreground mt-1">{report.sub_ketidaksesuaian}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Quick Action</p>
                      <Badge variant="secondary">{report.quick_action}</Badge>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deskripsi Temuan</p>
                      <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                        {report.deskripsi_temuan}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Keterangan Lokasi</p>
                      <p className="text-sm text-foreground">{report.keterangan_lokasi}</p>
                    </div>

                    {/* Image */}
                    {report.image_urls.length > 0 ? (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Image className="w-3 h-3" /> Foto Laporan
                        </p>
                        <div className="bg-muted/30 rounded-lg aspect-video flex items-center justify-center border border-border">
                          <img 
                            src={report.image_urls[0]} 
                            alt="Report" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/20 border border-dashed border-border rounded-lg p-4 text-center">
                        <Image className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Tidak ada gambar</p>
                      </div>
                    )}
                  </div>

                  {/* Stage Analysis Accordions */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Detail Analisis AI
                    </h4>

                    <Accordion type="multiple" className="space-y-2">
                      {/* Geo Analysis */}
                      <AccordionItem value="geo" className="border border-border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/30">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Geo Analysis</span>
                            <Badge variant="outline" className={`ml-2 text-xs ${
                              report.geo_score >= 80 ? "bg-destructive/15 text-destructive border-destructive/30" :
                              report.geo_score >= 50 ? "bg-warning/15 text-warning border-warning/30" :
                              "bg-success/15 text-success border-success/30"
                            }`}>
                              {report.geo_score}%
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          {report.geo_analysis ? (
                            <div className="space-y-3 text-sm">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-muted/30 p-2 rounded">
                                  <p className="text-muted-foreground">Cluster ID</p>
                                  <p className="font-mono">{report.geo_analysis.geo_cluster_id}</p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded">
                                  <p className="text-muted-foreground">Jarak</p>
                                  <p>{report.geo_analysis.distance_meters ? `${report.geo_analysis.distance_meters}m` : '-'}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant={report.geo_analysis.site_match ? "default" : "secondary"} className="text-xs">
                                  Site {report.geo_analysis.site_match ? "✓" : "✗"}
                                </Badge>
                                <Badge variant={report.geo_analysis.lokasi_match ? "default" : "secondary"} className="text-xs">
                                  Lokasi {report.geo_analysis.lokasi_match ? "✓" : "✗"}
                                </Badge>
                                <Badge variant={report.geo_analysis.detail_lokasi_match ? "default" : "secondary"} className="text-xs">
                                  Detail {report.geo_analysis.detail_lokasi_match ? "✓" : "✗"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                {report.geo_analysis.reason}
                              </p>
                              <Button variant="outline" size="sm" className="w-full text-xs">
                                <RefreshCw className="w-3 h-3 mr-2" />
                                Re-run Geo
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground py-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">Menunggu analisis...</span>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Lexical Analysis */}
                      <AccordionItem value="lexical" className="border border-border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/30">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-warning" />
                            <span className="text-sm font-medium">Lexical Analysis</span>
                            <Badge variant="outline" className={`ml-2 text-xs ${
                              report.lexical_score >= 80 ? "bg-destructive/15 text-destructive border-destructive/30" :
                              report.lexical_score >= 50 ? "bg-warning/15 text-warning border-warning/30" :
                              "bg-success/15 text-success border-success/30"
                            }`}>
                              {report.lexical_score}%
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          {report.lexical_analysis ? (
                            <div className="space-y-3 text-sm">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-muted/30 p-2 rounded">
                                  <p className="text-muted-foreground">Overlap Deskripsi</p>
                                  <p>{report.lexical_analysis.deskripsi_overlap_pct}%</p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded">
                                  <p className="text-muted-foreground">Matched Phrases</p>
                                  <p>{report.lexical_analysis.matched_phrases.length}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Frasa yang cocok:</p>
                                <div className="flex flex-wrap gap-1">
                                  {report.lexical_analysis.matched_phrases.map((phrase, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{phrase}</Badge>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                {report.lexical_analysis.reason}
                              </p>
                              <Button variant="outline" size="sm" className="w-full text-xs">
                                <RefreshCw className="w-3 h-3 mr-2" />
                                Re-run Lexical
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground py-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">Menunggu analisis...</span>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Semantic Analysis */}
                      <AccordionItem value="semantic" className="border border-border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-info" />
                            <span className="text-sm font-medium">Semantic Analysis</span>
                            <Badge variant="outline" className={`ml-2 text-xs ${
                              report.semantic_score >= 80 ? "bg-destructive/15 text-destructive border-destructive/30" :
                              report.semantic_score >= 50 ? "bg-warning/15 text-warning border-warning/30" :
                              "bg-success/15 text-success border-success/30"
                            }`}>
                              {report.semantic_score}%
                            </Badge>
                            {report.semantic_analysis?.status === 'processing' && (
                              <Loader2 className="w-3 h-3 animate-spin text-info" />
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          {report.semantic_analysis ? (
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant={report.semantic_analysis.visual_context_match ? "default" : "secondary"} className="text-xs">
                                  Visual Context {report.semantic_analysis.visual_context_match ? "✓" : "✗"}
                                </Badge>
                                <Badge variant={report.semantic_analysis.has_image ? "default" : "outline"} className="text-xs">
                                  {report.semantic_analysis.has_image ? "Ada Gambar" : "Tanpa Gambar"}
                                </Badge>
                              </div>
                              {report.semantic_analysis.key_visual_signals.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Visual Signals:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {report.semantic_analysis.key_visual_signals.map((signal, i) => (
                                      <Badge key={i} variant="outline" className="text-xs bg-info/10 text-info border-info/30">
                                        {signal}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {report.semantic_analysis.vlm_objects_detected.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">VLM Objects:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {report.semantic_analysis.vlm_objects_detected.map((obj, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">{obj}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                {report.semantic_analysis.reason}
                              </p>
                              <Button variant="outline" size="sm" className="w-full text-xs">
                                <RefreshCw className="w-3 h-3 mr-2" />
                                Re-run Semantic
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground py-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">Menunggu analisis...</span>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>

                {/* Right: Kemungkinan Duplikat */}
                <div className="p-4 bg-muted/10">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-warning" />
                    Kemungkinan Duplikat
                    {report.candidates.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{report.candidates.length}</Badge>
                    )}
                  </h3>

                  {/* Cluster Info */}
                  {cluster && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Cluster ID</p>
                          <p className="font-mono text-sm font-medium text-primary">{cluster.cluster_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Anggota</p>
                          <p className="text-sm font-medium">{cluster.member_count} laporan</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Representative: <span className="font-mono">{cluster.representative_report_id}</span>
                      </p>
                    </div>
                  )}

                  {/* Candidates List */}
                  {report.candidates.length > 0 ? (
                    <div className="space-y-3">
                      {report.candidates.map((candidate) => (
                        <CandidateCard 
                          key={candidate.report_id} 
                          candidate={candidate}
                          isSelected={selectedCandidates.includes(candidate.report_id)}
                          onToggle={() => toggleCandidate(candidate.report_id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/20 border border-dashed border-border rounded-lg p-6 text-center">
                      <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Tidak ditemukan kandidat duplicate
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Laporan ini kemungkinan unik
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Footer - Decision Section */}
            <div className="border-t border-border p-4 bg-card">
              {/* AI Label */}
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>AI adalah saran — keputusan akhir ada pada evaluator</span>
              </div>

              {/* Scores & Recommendation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Final Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreBg(report.duplicate_score)}`}
                          style={{ width: `${report.duplicate_score}%` }}
                        />
                      </div>
                      <span className={`text-lg font-bold ${getScoreColor(report.duplicate_score)}`}>
                        {report.duplicate_score}%
                      </span>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rekomendasi AI</p>
                    {getRecommendationBadge(report.ai_recommendation)}
                  </div>
                </div>

                {/* Explanation */}
                <div className="flex-1 ml-6">
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {report.ai_explanation.slice(0, 2).map((exp, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-primary">•</span>
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleConfirmDuplicate}
                  className="flex-1 gap-2"
                  disabled={report.status === 'error'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Duplicate
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleMarkNonDuplicate}
                  className="flex-1 gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Tandai Non-Duplicate
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <MoreHorizontal className="w-4 h-4" />
                      Kelola Cluster
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem className="gap-2">
                      <GitMerge className="w-4 h-4" />
                      Merge Clusters
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Scissors className="w-4 h-4" />
                      Split Cluster
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Layers className="w-4 h-4" />
                      Ubah Representative
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="secondary" onClick={handleRerun} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Jalankan Ulang
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'confirm' && "Konfirmasi Duplicate"}
              {confirmAction === 'reject' && "Tandai Non-Duplicate"}
              {confirmAction === 'rerun' && "Jalankan Ulang Analisis"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'confirm' && "Laporan ini akan digabungkan ke dalam cluster yang sama dengan kandidat yang dipilih."}
              {confirmAction === 'reject' && "Laporan ini akan ditandai sebagai unik dan dikeluarkan dari cluster saat ini."}
              {confirmAction === 'rerun' && "Analisis Geo → Lexical → Semantic akan dijalankan ulang. Skor dan cluster mungkin berubah."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <label className="text-sm font-medium">Catatan (opsional)</label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan untuk audit log..."
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              {confirmAction === 'confirm' && "Konfirmasi"}
              {confirmAction === 'reject' && "Tandai"}
              {confirmAction === 'rerun' && "Jalankan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Candidate Card Component
const CandidateCard = ({ 
  candidate, 
  isSelected, 
  onToggle 
}: { 
  candidate: DuplicateCandidate; 
  isSelected: boolean; 
  onToggle: () => void;
}) => {
  return (
    <div 
      onClick={onToggle}
      className={`border rounded-lg p-3 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 bg-card'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-mono text-xs font-medium">{candidate.report_id}</p>
          <p className="text-xs text-muted-foreground">{candidate.pelapor}</p>
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            candidate.overall_score >= 80 
              ? "bg-destructive/15 text-destructive border-destructive/30" 
              : candidate.overall_score >= 50 
              ? "bg-warning/15 text-warning border-warning/30" 
              : "bg-success/15 text-success border-success/30"
          }`}
        >
          {candidate.overall_score}%
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-2 text-xs">
        <Badge variant="secondary" className="text-xs">{candidate.site}</Badge>
        <span className="text-muted-foreground">{candidate.lokasi}</span>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {candidate.deskripsi_temuan}
      </p>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          <span className={getScoreColor(candidate.geo_score)}>{candidate.geo_score}%</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-warning" />
          <span className={getScoreColor(candidate.lexical_score)}>{candidate.lexical_score}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3 text-info" />
          <span className={getScoreColor(candidate.semantic_score)}>{candidate.semantic_score}%</span>
        </div>
      </div>

      {isSelected && (
        <div className="mt-2 pt-2 border-t border-primary/20">
          <div className="flex items-center gap-1 text-primary text-xs">
            <CheckCircle2 className="w-3 h-3" />
            Dipilih untuk konfirmasi
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicateDetailDrawer;
