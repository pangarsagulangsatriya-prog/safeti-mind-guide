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
  MapPin, FileText, Brain, User, Calendar, Building2, 
  CheckCircle2, XCircle, RefreshCw, ChevronDown,
  AlertTriangle, Loader2, ExternalLink, Image, Sparkles,
  Clock, Layers
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

const CandidateCard = ({ candidate, isSelected, onToggle }: { 
  candidate: DuplicateCandidate; 
  isSelected: boolean;
  onToggle: () => void;
}) => (
  <div 
    className={`border rounded-lg p-3 cursor-pointer transition-all ${
      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="font-mono text-xs font-medium text-primary">{candidate.report_id}</span>
      <div className="flex gap-1">
        <Badge variant="outline" className="text-[10px] px-1">{candidate.geo_score}%</Badge>
        <Badge variant="outline" className="text-[10px] px-1">{candidate.lexical_score}%</Badge>
        <Badge variant="outline" className="text-[10px] px-1">{candidate.semantic_score}%</Badge>
      </div>
    </div>
    <p className="text-xs text-muted-foreground">{candidate.reporter}</p>
    <p className="text-xs mt-1 line-clamp-2">{candidate.deskripsi_temuan}</p>
  </div>
);

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
                    {report.processing_status === 'processing' && (
                      <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Sedang Diproses
                      </Badge>
                    )}
                    {report.processing_status === 'error' && (
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
                        <span className="text-foreground">{report.reporter}</span>
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
                                  <p>{report.geo_analysis.distance_to_cluster_center ? `${report.geo_analysis.distance_to_cluster_center}m` : '-'}</p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                {report.geo_analysis.geo_reason}
                              </p>
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
                              <div className="flex flex-wrap gap-1">
                                {report.lexical_analysis.matched_phrases.map((phrase, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{phrase}</Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                {report.lexical_analysis.lexical_reason}
                              </p>
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
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          {report.semantic_analysis ? (
                            <div className="space-y-3 text-sm">
                              <div className="flex flex-wrap gap-1">
                                {report.semantic_analysis.detected_objects.map((obj, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{obj}</Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                {report.semantic_analysis.semantic_reason}
                              </p>
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
                      <p className="text-sm text-muted-foreground">Tidak ada kandidat duplicate</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">AI Recommendation:</span>
                  {getRecommendationBadge(report.ai_recommendation)}
                </div>
                <span className={`text-lg font-bold ${getScoreColor(report.duplicate_score)}`}>
                  {report.duplicate_score}%
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConfirmDuplicate} className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Konfirmasi Duplicate
                </Button>
                <Button variant="outline" onClick={handleMarkNonDuplicate}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Non-Duplicate
                </Button>
                <Button variant="ghost" onClick={handleRerun}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'confirm' && "Konfirmasi Duplicate"}
              {confirmAction === 'reject' && "Tandai Non-Duplicate"}
              {confirmAction === 'rerun' && "Jalankan Ulang Analisis"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'confirm' && "Laporan akan ditandai sebagai duplicate."}
              {confirmAction === 'reject' && "Laporan akan dipisahkan dari cluster."}
              {confirmAction === 'rerun' && "Analisis AI akan dijalankan ulang."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea 
            placeholder="Catatan (opsional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>Konfirmasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DuplicateDetailDrawer;
