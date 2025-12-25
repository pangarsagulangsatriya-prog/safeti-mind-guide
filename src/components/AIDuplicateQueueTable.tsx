import { useState, useMemo } from "react";
import { Layers, Search, Clock, Loader2, Filter, ChevronLeft, ChevronRight, RotateCcw, Info, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { HazardReport, DuplicateStatus, siteOptions, lokasiOptions } from "@/data/hazardReports";

interface AIDuplicateQueueTableProps {
  reports: HazardReport[];
  onViewDetail?: (report: HazardReport) => void;
}

const getDuplicateStatusBadge = (status?: DuplicateStatus) => {
  switch (status) {
    case "MENUNGGU_ANALISIS_DUPLICATE":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          Menunggu
        </Badge>
      );
    case "SEDANG_ANALISIS_DUPLICATE":
      return (
        <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1 whitespace-nowrap">
          <Loader2 className="w-3 h-3 animate-spin" />
          Diproses
        </Badge>
      );
    case "DUPLICATE_SELESAI":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1 whitespace-nowrap">
          Selesai
        </Badge>
      );
    default:
      return null;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 0.75) return "text-destructive";
  if (score >= 0.5) return "text-warning";
  return "text-success";
};

const getProgressColor = (score: number) => {
  if (score >= 0.75) return "bg-destructive";
  if (score >= 0.5) return "bg-warning";
  return "bg-success";
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", { 
    day: "2-digit", 
    month: "short",
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const ITEMS_PER_PAGE = 10;

const AIDuplicateQueueTable = ({ reports, onViewDetail }: AIDuplicateQueueTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Location filters
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [lokasiAreaFilter, setLokasiAreaFilter] = useState<string>("all");

  // Get lokasi options based on selected site
  const availableLokasiOptions = useMemo(() => {
    if (siteFilter === "all") {
      return [...new Set(Object.values(lokasiOptions).flat())];
    }
    return lokasiOptions[siteFilter] || [];
  }, [siteFilter]);

  // Reset dependent filters when parent changes
  const handleSiteChange = (value: string) => {
    setSiteFilter(value);
    setLokasiAreaFilter("all");
    setCurrentPage(1);
  };

  const handleLokasiAreaChange = (value: string) => {
    setLokasiAreaFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSiteFilter("all");
    setLokasiAreaFilter("all");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    statusFilter !== "all" || 
    siteFilter !== "all" ||
    lokasiAreaFilter !== "all";

  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || report.duplicateStatus === statusFilter;
      const matchesSite = siteFilter === "all" || report.site === siteFilter;
      const matchesLokasiArea = lokasiAreaFilter === "all" || report.lokasiArea === lokasiAreaFilter;
      
      return matchesSearch && matchesStatus && matchesSite && matchesLokasiArea;
    });

    // Sort: SEDANG_ANALISIS_DUPLICATE always first, then by timestamp
    return filtered.sort((a, b) => {
      // Processing items always come first
      if (a.duplicateStatus === "SEDANG_ANALISIS_DUPLICATE" && b.duplicateStatus !== "SEDANG_ANALISIS_DUPLICATE") return -1;
      if (b.duplicateStatus === "SEDANG_ANALISIS_DUPLICATE" && a.duplicateStatus !== "SEDANG_ANALISIS_DUPLICATE") return 1;
      
      // Then sort by timestamp
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [reports, searchTerm, statusFilter, siteFilter, lokasiAreaFilter, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredAndSortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const menungguCount = reports.filter(r => r.duplicateStatus === "MENUNGGU_ANALISIS_DUPLICATE").length;
  const sedangProsesCount = reports.filter(r => r.duplicateStatus === "SEDANG_ANALISIS_DUPLICATE").length;

  return (
    <div className="bg-card rounded-lg card-shadow animate-fade-in">
      {/* Header Info */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Layers className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Antrian AI Duplicate Detection</h2>
              <p className="text-sm text-muted-foreground">
                {menungguCount} menunggu · {sedangProsesCount} diproses
              </p>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="mt-3 p-2.5 rounded-md bg-info/10 border border-info/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <p className="text-xs text-info">
            AI menganalisis kemiripan laporan berdasarkan <strong>Rule-based</strong>, <strong>Geo</strong> (lokasi), <strong>Lexical</strong> (kata), dan <strong>Semantic</strong> (makna). Laporan mirip akan dikelompokkan sebagai duplicate.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-shrink-0 w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari..." 
              className="pl-9 bg-background h-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="MENUNGGU_ANALISIS_DUPLICATE">Menunggu</SelectItem>
              <SelectItem value="SEDANG_ANALISIS_DUPLICATE">Diproses</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={siteFilter} onValueChange={handleSiteChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Site</SelectItem>
              {siteOptions.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={lokasiAreaFilter} onValueChange={handleLokasiAreaChange}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {availableLokasiOptions.map(lok => (
                <SelectItem key={lok} value={lok}>{lok}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="h-8 px-2 text-xs gap-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortOrder === "asc" ? "Terlama" : "Terbaru"}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Timestamp</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Pelapor</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Site</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Lokasi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Duplicate Score</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[100px]">
                <Tooltip>
                  <TooltipTrigger className="cursor-help underline decoration-dotted">Rule-Based</TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[200px]">Kecocokan berdasarkan aturan tetap (site, ketidaksesuaian, dll)</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[80px]">
                <Tooltip>
                  <TooltipTrigger className="cursor-help underline decoration-dotted">Geo</TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[200px]">Kedekatan lokasi geografis (radius ≤1km)</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[80px]">
                <Tooltip>
                  <TooltipTrigger className="cursor-help underline decoration-dotted">Lexical</TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[200px]">Kesamaan kata/teks dalam deskripsi</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[80px]">
                <Tooltip>
                  <TooltipTrigger className="cursor-help underline decoration-dotted">Semantic</TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[200px]">Kesamaan makna menggunakan AI embedding</p></TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">
                  Tidak ada laporan ditemukan
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => (
                <tr 
                  key={report.id} 
                  className="border-b border-border hover:bg-muted/10 transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-foreground text-xs whitespace-nowrap">{report.id}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs whitespace-nowrap">{formatTimestamp(report.timestamp)}</td>
                  <td className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{report.pelapor}</td>
                  <td className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{report.site}</td>
                  <td className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{report.lokasiArea || "-"}</td>
                  <td className="px-3 py-2">
                    {report.duplicateScores?.overall !== undefined ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressColor(report.duplicateScores.overall)}`}
                                style={{ width: `${report.duplicateScores.overall * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${getScoreColor(report.duplicateScores.overall)}`}>
                              {(report.duplicateScores.overall * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          <p className="text-xs font-medium mb-1">
                            {report.duplicateScores.overall >= 0.75 
                              ? '🔴 Duplicate Kuat' 
                              : report.duplicateScores.overall >= 0.5 
                              ? '🟡 Mungkin Duplicate' 
                              : '🟢 Bukan Duplicate'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.duplicateScores.overall >= 0.75 
                              ? 'Kemungkinan besar laporan ini duplicate dengan laporan lain' 
                              : report.duplicateScores.overall >= 0.5 
                              ? 'Perlu validasi manual untuk memastikan' 
                              : 'Kemungkinan besar bukan duplicate'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-xs cursor-help ${report.duplicateScores?.ruleBased !== undefined ? getScoreColor(report.duplicateScores.ruleBased) : 'text-muted-foreground'}`}>
                          {report.duplicateScores?.ruleBased !== undefined ? `${(report.duplicateScores.ruleBased * 100).toFixed(0)}%` : '-'}
                        </span>
                      </TooltipTrigger>
                      {report.duplicateScores?.ruleBased !== undefined && (
                        <TooltipContent>
                          <p className="text-xs">Kecocokan aturan tetap: {(report.duplicateScores.ruleBased * 100).toFixed(0)}%</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </td>
                  <td className="px-3 py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-xs cursor-help ${report.duplicateScores?.geo !== undefined ? getScoreColor(report.duplicateScores.geo) : 'text-muted-foreground'}`}>
                          {report.duplicateScores?.geo !== undefined ? `${(report.duplicateScores.geo * 100).toFixed(0)}%` : '-'}
                        </span>
                      </TooltipTrigger>
                      {report.duplicateScores?.geo !== undefined && (
                        <TooltipContent>
                          <p className="text-xs">Kedekatan lokasi: {(report.duplicateScores.geo * 100).toFixed(0)}%</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </td>
                  <td className="px-3 py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-xs cursor-help ${report.duplicateScores?.lexical !== undefined ? getScoreColor(report.duplicateScores.lexical) : 'text-muted-foreground'}`}>
                          {report.duplicateScores?.lexical !== undefined ? `${(report.duplicateScores.lexical * 100).toFixed(0)}%` : '-'}
                        </span>
                      </TooltipTrigger>
                      {report.duplicateScores?.lexical !== undefined && (
                        <TooltipContent>
                          <p className="text-xs">Kesamaan kata: {(report.duplicateScores.lexical * 100).toFixed(0)}%</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </td>
                  <td className="px-3 py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-xs cursor-help ${report.duplicateScores?.semantic !== undefined ? getScoreColor(report.duplicateScores.semantic) : 'text-muted-foreground'}`}>
                          {report.duplicateScores?.semantic !== undefined ? `${(report.duplicateScores.semantic * 100).toFixed(0)}%` : '-'}
                        </span>
                      </TooltipTrigger>
                      {report.duplicateScores?.semantic !== undefined && (
                        <TooltipContent>
                          <p className="text-xs">Kesamaan makna: {(report.duplicateScores.semantic * 100).toFixed(0)}%</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </td>
                  <td className="px-3 py-2">
                    {getDuplicateStatusBadge(report.duplicateStatus)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {filteredAndSortedReports.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedReports.length)} dari {filteredAndSortedReports.length}
        </p>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {currentPage} / {totalPages || 1}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIDuplicateQueueTable;
