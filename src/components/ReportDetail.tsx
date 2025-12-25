import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, ZoomIn, Clock, CheckCircle2, AlertCircle, RotateCcw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HazardReport, similarReports, EvaluationStatus } from "@/data/hazardReports";
import AIKnowledgeCard from "./AIKnowledgeCard";

const labelConfig = {
  TBC: { bg: "bg-warning", text: "text-warning-foreground", fullName: "TBC - To be Concern Hazard" },
  PSPP: { bg: "bg-info", text: "text-info-foreground", fullName: "PSPP - Peraturan Sanksi Pelanggaran Prosedur" },
  GR: { bg: "bg-success", text: "text-success-foreground", fullName: "GR - Safety Golden Rules" }
};

const getEvaluationStatusDisplay = (status: EvaluationStatus) => {
  switch (status) {
    case "BELUM_DIEVALUASI":
      return { icon: Clock, label: "Belum Dievaluasi", color: "text-muted-foreground", bg: "bg-muted" };
    case "DALAM_EVALUASI":
      return { icon: AlertCircle, label: "Dalam Evaluasi", color: "text-info", bg: "bg-info/10" };
    case "SELESAI":
      return { icon: CheckCircle2, label: "Selesai", color: "text-success", bg: "bg-success/10" };
    case "PERLU_REVIEW_ULANG":
      return { icon: RotateCcw, label: "Perlu Review Ulang", color: "text-warning", bg: "bg-warning/10" };
    default:
      return { icon: Clock, label: "Unknown", color: "text-muted-foreground", bg: "bg-muted" };
  }
};

interface ReportDetailProps {
  report: HazardReport;
  onBack: () => void;
  currentIndex: number;
  totalReports: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const ReportDetail = ({ report, onBack, currentIndex, totalReports, onNavigate }: ReportDetailProps) => {
  const evalStatus = report.evaluationStatus ? getEvaluationStatusDisplay(report.evaluationStatus) : null;
  const EvalIcon = evalStatus?.icon || Clock;

  return (
    <div className="animate-fade-in p-6 overflow-y-auto h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Evaluator Dashboard
        </button>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-foreground">Detail Laporan</span>
      </div>

      {/* Report ID, Labels and Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">ID: {report.id}</h1>
          {report.labels && report.labels.length > 0 && (
            <div className="flex items-center gap-2">
              {report.labels.map((label) => {
                const config = labelConfig[label];
                return (
                  <span 
                    key={label}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
          {report.confidenceScore && (
            <Badge variant="outline" className="text-xs">
              Confidence: {report.confidenceScore}%
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{currentIndex} of {totalReports}</span>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8"
              onClick={() => onNavigate('prev')}
              disabled={currentIndex === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8"
              onClick={() => onNavigate('next')}
              disabled={currentIndex === totalReports}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Report Info & Location */}
        <div className="space-y-4">
          {/* Evaluation Status Card - NEW */}
          <div className="bg-card rounded-lg p-5 card-shadow border-l-4 border-primary">
            <h3 className="font-semibold text-foreground mb-4">Status Evaluasi</h3>
            <div className="space-y-3">
              {evalStatus && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${evalStatus.bg}`}>
                  <EvalIcon className={`w-5 h-5 ${evalStatus.color}`} />
                  <div>
                    <p className={`font-medium ${evalStatus.color}`}>{evalStatus.label}</p>
                    {report.evaluatorName && (
                      <div className="flex items-center gap-1 mt-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Evaluator: {report.evaluatorName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {report.slaDueDate && (
                <div className="text-sm">
                  <span className="text-muted-foreground">SLA Due: </span>
                  <span className={`font-medium ${
                    report.slaStatus === 'merah' ? 'text-destructive' :
                    report.slaStatus === 'kuning' ? 'text-warning' : 'text-success'
                  }`}>
                    {report.slaDueDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg p-5 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Informasi Laporan</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">ID Laporan</p>
                <p className="text-sm font-medium text-foreground">{report.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tanggal pembuatan</p>
                <p className="text-sm font-medium text-foreground">{report.tanggalPembuatan}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pelapor</p>
                <p className="text-sm font-medium text-foreground">{report.pelapor}</p>
                <p className="text-xs text-muted-foreground">- {report.rolePelapor}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-5 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Informasi Lokasi</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Site</p>
                <p className="text-sm font-medium text-foreground">{report.site}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lokasi</p>
                <p className="text-sm font-medium text-foreground">{report.lokasi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Detail Lokasi</p>
                <p className="text-sm font-medium text-foreground">{report.detailLokasi}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - AI Output & Evidence */}
        <div className="space-y-4">
          {/* AI Output Section - NEW */}
          <div className="bg-card rounded-lg p-5 card-shadow border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">AI Output (Final)</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Label Hazard</p>
                <div className="flex flex-wrap gap-1">
                  {report.labels?.map((label) => {
                    const config = labelConfig[label];
                    return (
                      <span 
                        key={label}
                        className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}
                      >
                        {config.fullName}
                      </span>
                    );
                  })}
                </div>
              </div>
              {report.confidenceScore && (
                <div>
                  <p className="text-xs text-muted-foreground">Confidence Score</p>
                  <p className={`text-lg font-bold ${
                    report.confidenceScore >= 90 ? 'text-success' :
                    report.confidenceScore >= 80 ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {report.confidenceScore}%
                  </p>
                </div>
              )}
              {report.clusterSuggestion && (
                <div>
                  <p className="text-xs text-muted-foreground">Cluster Suggestion</p>
                  <p className="text-sm font-medium text-primary">{report.clusterSuggestion}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg p-5 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Deskripsi Objek</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Ketidaksesuaian</p>
                <p className="text-sm font-medium text-foreground">{report.jenisHazard}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sub ketidaksesuaian</p>
                <p className="text-sm font-medium text-foreground">{report.subJenisHazard}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground">Quick Action</p>
              <p className="text-sm font-medium text-foreground">{report.quickAction}</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Deskripsi Temuan</h4>
              <p className="text-sm text-muted-foreground">{report.deskripsiTemuan}</p>
            </div>
          </div>

          <div className="bg-card rounded-lg p-5 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Bukti temuan</h3>
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop" 
                alt="Bukti temuan" 
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-3 right-3 w-8 h-8 bg-card/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Similar Reports & Control */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Laporan Serupa</h3>
                <p className="text-xs text-muted-foreground">(7 hari terakhir)</p>
              </div>
              <button className="text-xs text-primary flex items-center gap-1">
                Thinking Process
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>2 laporan serupa</span>
            </div>

            <div className="space-y-3">
              {similarReports.map((similar) => (
                <div key={similar.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{similar.id}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                      {similar.similarity}% similar
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{similar.description}</p>
                  <p className="text-xs text-muted-foreground">{similar.location} | {similar.daysAgo} hari yang lalu</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg p-5 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Pengendalian</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Pilih konfirmasi</label>
                <Select defaultValue="tutup">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih aksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutup">Tutup Laporan</SelectItem>
                    <SelectItem value="proses">Lanjutkan Proses</SelectItem>
                    <SelectItem value="tolak">Tolak Laporan</SelectItem>
                    <SelectItem value="review">Perlu Review Ulang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Selesaikan Evaluasi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Knowledge Sources - Horizontal Cards */}
      {report.aiKnowledgeSources && report.aiKnowledgeSources.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            AI Reasoning Details
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {report.aiKnowledgeSources.map((source, index) => (
              <AIKnowledgeCard key={index} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;