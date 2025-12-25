import { useState, useMemo } from "react";
import { 
  Layers, Search, Clock, Loader2, Filter, ChevronLeft, ChevronRight, 
  RotateCcw, Info, ArrowUpDown, Eye, RefreshCw, XCircle, MapPin, 
  FileText, Brain, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DuplicateReport, duplicateReports, duplicateClusters } from "@/data/duplicateDetectionData";
import DuplicateDetailDrawer from "./DuplicateDetailDrawer";

interface AIDuplicateQueueTableProps {
  onViewDetail?: (report: DuplicateReport) => void;
}

const getStatusBadge = (status: DuplicateReport['status']) => {
  switch (status) {
    case "waiting":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          Menunggu
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1 whitespace-nowrap">
          <Loader2 className="w-3 h-3 animate-spin" />
          Diproses
        </Badge>
      );
    case "done":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3" />
          Selesai
        </Badge>
      );
    case "error":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1 whitespace-nowrap">
          <AlertTriangle className="w-3 h-3" />
          Error
        </Badge>
      );
    default:
      return null;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-destructive";
  if (score >= 50) return "text-warning";
  return "text-success";
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-destructive";
  if (score >= 50) return "bg-warning";
  return "bg-success";
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", { 
    day: "2-digit", 
    month: "short",
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const ITEMS_PER_PAGE = 10;

const siteOptions = ["MINING PIT", "MARINE", "PROCESSING PLANT", "CAMP AREA", "OFFICE AREA"];

const AIDuplicateQueueEnhanced = ({ onViewDetail }: AIDuplicateQueueTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "highest" | "lowest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReport, setSelectedReport] = useState<DuplicateReport | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const reports = duplicateReports;

  const filteredReports = useMemo(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.report_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.deskripsi_temuan.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesSite = siteFilter === "all" || report.site === siteFilter;
      
      return matchesSearch && matchesStatus && matchesSite;
    });

    // Sort
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortOrder === "highest") {
      filtered.sort((a, b) => b.duplicate_score - a.duplicate_score);
    } else {
      filtered.sort((a, b) => a.duplicate_score - b.duplicate_score);
    }

    // Processing items always first
    filtered.sort((a, b) => {
      if (a.status === "processing" && b.status !== "processing") return -1;
      if (b.status === "processing" && a.status !== "processing") return 1;
      return 0;
    });

    return filtered;
  }, [reports, searchTerm, statusFilter, siteFilter, sortOrder]);

  // Filter by tab (stage focus)
  const tabFilteredReports = useMemo(() => {
    if (activeTab === "all") return filteredReports;
    if (activeTab === "geo") {
      return filteredReports.filter(r => r.geo_score >= 80);
    }
    if (activeTab === "lexical") {
      return filteredReports.filter(r => r.lexical_score >= 70);
    }
    if (activeTab === "semantic") {
      return filteredReports.filter(r => r.semantic_score >= 70);
    }
    return filteredReports;
  }, [filteredReports, activeTab]);

  // Pagination
  const totalPages = Math.ceil(tabFilteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = tabFilteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const menungguCount = reports.filter(r => r.status === "waiting").length;
  const diprosesCount = reports.filter(r => r.status === "processing").length;

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || siteFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSiteFilter("all");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const handleRowClick = (report: DuplicateReport) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedReport(null);
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Antrian AI Duplicate Detection</h2>
                <p className="text-sm text-muted-foreground">
                  {menungguCount} menunggu • {diprosesCount} diproses
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          
          {/* Info Banner */}
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/90">
              AI menganalisis kemiripan laporan berdasarkan <strong>Geo</strong> (lokasi), <strong>Lexical</strong> (kata), dan <strong>Semantic</strong> (makna). Laporan mirip akan dikelompokkan sebagai duplicate.
            </p>
          </div>
        </div>

        {/* Stage Tabs */}
        <div className="border-b border-border">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
            <TabsList className="w-full justify-start rounded-none bg-transparent border-b-0 p-0">
              <TabsTrigger 
                value="all" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Semua
                <Badge variant="secondary" className="ml-2 text-xs">{filteredReports.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="geo" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
              >
                <MapPin className="w-4 h-4" />
                Geo
                <Badge variant="secondary" className="ml-1 text-xs bg-destructive/20 text-destructive">
                  {filteredReports.filter(r => r.geo_score >= 80).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="lexical" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
              >
                <FileText className="w-4 h-4" />
                Lexical
                <Badge variant="secondary" className="ml-1 text-xs bg-warning/20 text-warning">
                  {filteredReports.filter(r => r.lexical_score >= 70).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="semantic" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
              >
                <Brain className="w-4 h-4" />
                Semantic
                <Badge variant="secondary" className="ml-1 text-xs bg-info/20 text-info">
                  {filteredReports.filter(r => r.semantic_score >= 70).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Tab Description */}
            <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground">
              {activeTab === "all" && "Menampilkan semua laporan dalam antrian analisis duplicate."}
              {activeTab === "geo" && "Menampilkan laporan dengan skor Geo ≥80% — kemungkinan besar di lokasi yang sama/berdekatan."}
              {activeTab === "lexical" && "Menampilkan laporan dengan skor Lexical ≥70% — ada kesamaan kata/teks yang tinggi."}
              {activeTab === "semantic" && "Menampilkan laporan dengan skor Semantic ≥70% — memiliki makna yang serupa berdasarkan AI."}
            </div>
          </Tabs>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-shrink-0 w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari ID / pelapor / lokasi / kata kunci…" 
                className="pl-9 bg-background h-9 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[130px] h-9 text-sm bg-popover">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="waiting">Menunggu</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="done">Selesai</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={siteFilter} onValueChange={(v) => { setSiteFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] h-9 text-sm bg-popover">
                  <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Semua Site</SelectItem>
                  {siteOptions.map(site => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(v: typeof sortOrder) => { setSortOrder(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[160px] h-9 text-sm bg-popover">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="highest">Skor Tertinggi</SelectItem>
                  <SelectItem value="lowest">Skor Terendah</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Timestamp</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Pelapor</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Site</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Lokasi</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap min-w-[140px]">Duplicate Score</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 cursor-help mx-auto">
                      <MapPin className="w-3 h-3" /> Geo
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border-border">
                      <p className="text-xs max-w-[200px]">Kesamaan lokasi geografis (site, lokasi, koordinat)</p>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 cursor-help mx-auto">
                      <FileText className="w-3 h-3" /> Lexical
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border-border">
                      <p className="text-xs max-w-[200px]">Kesamaan kata/teks dalam deskripsi temuan</p>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 cursor-help mx-auto">
                      <Brain className="w-3 h-3" /> Semantic
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border-border">
                      <p className="text-xs max-w-[200px]">Kesamaan makna berdasarkan AI embedding + VLM</p>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Status</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Layers className="w-8 h-8 opacity-50" />
                      <p className="text-sm">Belum ada laporan untuk dianalisis.</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr 
                    key={report.report_id} 
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => handleRowClick(report)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground whitespace-nowrap">
                      {report.report_id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatTimestamp(report.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-foreground text-xs whitespace-nowrap">
                      {report.pelapor}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <Badge variant="outline" className="text-xs font-normal">
                        {report.site}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground text-xs whitespace-nowrap max-w-[150px] truncate">
                      {report.lokasi}
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${getScoreBgColor(report.duplicate_score)}`}
                                style={{ width: `${report.duplicate_score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold min-w-[36px] ${getScoreColor(report.duplicate_score)}`}>
                              {report.duplicate_score}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover border-border max-w-[280px]">
                          <p className="text-xs font-medium mb-1">
                            {report.duplicate_score >= 80 
                              ? '🔴 High Risk Duplicate' 
                              : report.duplicate_score >= 50 
                              ? '🟡 Potential Duplicate' 
                              : '🟢 Low Risk'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.duplicate_score >= 80 
                              ? 'Sangat mungkin duplicate - perlu konfirmasi' 
                              : report.duplicate_score >= 50 
                              ? 'Mungkin duplicate - perlu review' 
                              : 'Kemungkinan bukan duplicate'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreChip score={report.geo_score} status={report.geo_analysis?.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreChip score={report.lexical_score} status={report.lexical_analysis?.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreChip score={report.semantic_score} status={report.semantic_analysis?.status} />
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover border-border">Review</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover border-border">Re-run</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success">
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover border-border">Mark Non-duplicate</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Menampilkan {tabFilteredReports.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ITEMS_PER_PAGE, tabFilteredReports.length)} dari {tabFilteredReports.length} laporan
          </p>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-3 min-w-[80px] text-center">
              {currentPage} / {totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <DuplicateDetailDrawer 
        report={selectedReport}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        clusters={duplicateClusters}
      />
    </>
  );
};

// Score Chip Component
const ScoreChip = ({ score, status }: { score: number; status?: string }) => {
  if (status === "processing") {
    return (
      <Badge variant="outline" className="text-xs bg-muted/50 border-border gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
      </Badge>
    );
  }

  const colorClass = score >= 80 
    ? "bg-destructive/15 text-destructive border-destructive/30" 
    : score >= 50 
    ? "bg-warning/15 text-warning border-warning/30" 
    : "bg-success/15 text-success border-success/30";

  return (
    <Badge variant="outline" className={`text-xs font-medium ${colorClass}`}>
      {score}%
    </Badge>
  );
};

export default AIDuplicateQueueEnhanced;
