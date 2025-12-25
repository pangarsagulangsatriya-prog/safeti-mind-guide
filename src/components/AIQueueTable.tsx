import { useState, useMemo } from "react";
import { Bot, Search, Clock, Loader2, Filter, ChevronLeft, ChevronRight, RotateCcw, Info, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HazardReport, AIStatus, siteOptions, lokasiOptions, detailLokasiOptions } from "@/data/hazardReports";
import { ketidaksesuaianData } from "@/data/ketidaksesuaianData";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface AIQueueTableProps {
  reports: HazardReport[];
  onViewDetail?: (report: HazardReport) => void;
}

const getAIStatusBadge = (status: AIStatus) => {
  switch (status) {
    case "MENUNGGU_ANALISIS_AI":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          Menunggu
        </Badge>
      );
    case "SEDANG_ANALISIS_AI":
      return (
        <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1 whitespace-nowrap">
          <Loader2 className="w-3 h-3 animate-spin" />
          Diproses
        </Badge>
      );
    default:
      return null;
  }
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

const ITEMS_PER_PAGE = 10;

const AIQueueTable = ({ reports, onViewDetail }: AIQueueTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Location filters
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [lokasiAreaFilter, setLokasiAreaFilter] = useState<string>("all");
  const [detailLokasiFilter, setDetailLokasiFilter] = useState<string>("all");
  
  // Multi-select filters
  const [selectedKetidaksesuaian, setSelectedKetidaksesuaian] = useState<string[]>([]);
  const [selectedSubKetidaksesuaian, setSelectedSubKetidaksesuaian] = useState<string[]>([]);

  // Get lokasi options based on selected site
  const availableLokasiOptions = useMemo(() => {
    if (siteFilter === "all") {
      return [...new Set(Object.values(lokasiOptions).flat())];
    }
    return lokasiOptions[siteFilter] || [];
  }, [siteFilter]);

  // Get detail lokasi options based on selected lokasi
  const availableDetailLokasiOptions = useMemo(() => {
    if (lokasiAreaFilter === "all") {
      return [...new Set(Object.values(detailLokasiOptions).flat())];
    }
    return detailLokasiOptions[lokasiAreaFilter] || [];
  }, [lokasiAreaFilter]);

  // Get all ketidaksesuaian options
  const ketidaksesuaianOptions = ketidaksesuaianData.map(k => k.ketidaksesuaian);

  // Get sub-ketidaksesuaian options based on selected ketidaksesuaian
  const subKetidaksesuaianOptions = useMemo(() => {
    if (selectedKetidaksesuaian.length === 0) {
      return ketidaksesuaianData.flatMap(k => k.sub_ketidaksesuaian);
    }
    return ketidaksesuaianData
      .filter(k => selectedKetidaksesuaian.includes(k.ketidaksesuaian))
      .flatMap(k => k.sub_ketidaksesuaian);
  }, [selectedKetidaksesuaian]);

  // Reset dependent filters when parent changes
  const handleSiteChange = (value: string) => {
    setSiteFilter(value);
    setLokasiAreaFilter("all");
    setDetailLokasiFilter("all");
    setCurrentPage(1);
  };

  const handleLokasiAreaChange = (value: string) => {
    setLokasiAreaFilter(value);
    setDetailLokasiFilter("all");
    setCurrentPage(1);
  };

  const handleDetailLokasiChange = (value: string) => {
    setDetailLokasiFilter(value);
    setCurrentPage(1);
  };

  // Reset sub selections when ketidaksesuaian changes
  const handleKetidaksesuaianChange = (selected: string[]) => {
    setSelectedKetidaksesuaian(selected);
    if (selected.length > 0) {
      const validSubs = ketidaksesuaianData
        .filter(k => selected.includes(k.ketidaksesuaian))
        .flatMap(k => k.sub_ketidaksesuaian);
      setSelectedSubKetidaksesuaian(prev => prev.filter(s => validSubs.includes(s)));
    }
    setCurrentPage(1);
  };

  const handleSubKetidaksesuaianChange = (selected: string[]) => {
    setSelectedSubKetidaksesuaian(selected);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSiteFilter("all");
    setLokasiAreaFilter("all");
    setDetailLokasiFilter("all");
    setSelectedKetidaksesuaian([]);
    setSelectedSubKetidaksesuaian([]);
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    statusFilter !== "all" || 
    siteFilter !== "all" ||
    lokasiAreaFilter !== "all" ||
    detailLokasiFilter !== "all" ||
    selectedKetidaksesuaian.length > 0 ||
    selectedSubKetidaksesuaian.length > 0;

  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.ketidaksesuaian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.subKetidaksesuaian?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || report.aiStatus === statusFilter;
      const matchesSite = siteFilter === "all" || report.site === siteFilter;
      const matchesLokasiArea = lokasiAreaFilter === "all" || report.lokasiArea === lokasiAreaFilter;
      const matchesDetailLokasi = detailLokasiFilter === "all" || report.detailLokasi === detailLokasiFilter;
      
      const matchesKetidaksesuaian = selectedKetidaksesuaian.length === 0 || 
        (report.ketidaksesuaian && selectedKetidaksesuaian.includes(report.ketidaksesuaian));
      
      const matchesSubKetidaksesuaian = selectedSubKetidaksesuaian.length === 0 || 
        (report.subKetidaksesuaian && selectedSubKetidaksesuaian.includes(report.subKetidaksesuaian));
      
      return matchesSearch && matchesStatus && matchesSite && matchesLokasiArea && matchesDetailLokasi && matchesKetidaksesuaian && matchesSubKetidaksesuaian;
    });

    // Sort: SEDANG_ANALISIS_AI always first, then by timestamp
    return filtered.sort((a, b) => {
      // Processing items always come first
      if (a.aiStatus === "SEDANG_ANALISIS_AI" && b.aiStatus !== "SEDANG_ANALISIS_AI") return -1;
      if (b.aiStatus === "SEDANG_ANALISIS_AI" && a.aiStatus !== "SEDANG_ANALISIS_AI") return 1;
      
      // Then sort by timestamp
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [reports, searchTerm, statusFilter, siteFilter, lokasiAreaFilter, detailLokasiFilter, selectedKetidaksesuaian, selectedSubKetidaksesuaian, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredAndSortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const menungguCount = reports.filter(r => r.aiStatus === "MENUNGGU_ANALISIS_AI").length;
  const sedangProsesCount = reports.filter(r => r.aiStatus === "SEDANG_ANALISIS_AI").length;

  return (
    <div className="bg-card rounded-lg card-shadow animate-fade-in">
      {/* Header Info */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Antrian AI (Pre-Processing)</h2>
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
            Laporan yang sudah selesai dianalisis AI akan otomatis pindah ke tab <strong>Evaluasi → Daftar Laporan</strong> untuk proses evaluasi selanjutnya.
          </p>
        </div>
      </div>

      {/* Search & Filters - Single Row */}
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
              <SelectItem value="MENUNGGU_ANALISIS_AI">Menunggu</SelectItem>
              <SelectItem value="SEDANG_ANALISIS_AI">Diproses</SelectItem>
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

          <Select value={detailLokasiFilter} onValueChange={handleDetailLokasiChange}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Detail Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Detail</SelectItem>
              {availableDetailLokasiOptions.map(det => (
                <SelectItem key={det} value={det}>{det}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-shrink-0 w-36">
            <MultiSelectDropdown
              label="Ketidaksesuaian"
              options={ketidaksesuaianOptions}
              selected={selectedKetidaksesuaian}
              onChange={handleKetidaksesuaianChange}
              placeholder="Ketidaksesuaian"
              compact
            />
          </div>
          
          <div className="flex-shrink-0 w-36">
            <MultiSelectDropdown
              label="Sub"
              options={subKetidaksesuaianOptions}
              selected={selectedSubKetidaksesuaian}
              onChange={handleSubKetidaksesuaianChange}
              placeholder="Sub-Ketidaksesuaian"
              compact
            />
          </div>

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

      {/* Compact Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Waktu</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Pelapor</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Site</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Lokasi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Detail Lokasi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[150px]">Ketidaksesuaian</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[150px]">Sub-Ketidaksesuaian</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
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
                  <td className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{report.detailLokasi}</td>
                  <td className="px-3 py-2 max-w-[150px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground text-xs truncate block cursor-help">
                          {report.ketidaksesuaian || "-"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">{report.ketidaksesuaian || "-"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="px-3 py-2 max-w-[150px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground text-xs truncate block cursor-help">
                          {report.subKetidaksesuaian || "-"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">{report.subKetidaksesuaian || "-"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="px-3 py-2">
                    {getAIStatusBadge(report.aiStatus)}
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
            className="h-7 px-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentPage} / {totalPages || 1}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIQueueTable;
