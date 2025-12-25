import { useState, useMemo } from "react";
import { FileText, Search, Filter, X, Clock, CheckCircle2, AlertCircle, RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HazardReport, EvaluationStatus, siteOptions, lokasiOptions, detailLokasiOptions } from "@/data/hazardReports";
import { ketidaksesuaianData } from "@/data/ketidaksesuaianData";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface EvaluatorTableProps {
  reports: HazardReport[];
  onViewDetail: (report: HazardReport) => void;
}

const getLabelColor = (label: string): string => {
  switch (label) {
    case "TBC":
      return "bg-warning/10 text-warning border-warning/20";
    case "PSPP":
      return "bg-info/10 text-info border-info/20";
    case "GR":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getEvaluationStatusBadge = (status: EvaluationStatus) => {
  switch (status) {
    case "BELUM_DIEVALUASI":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          Belum Dievaluasi
        </Badge>
      );
    case "DALAM_EVALUASI":
      return (
        <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1 whitespace-nowrap">
          <AlertCircle className="w-3 h-3" />
          Dalam Evaluasi
        </Badge>
      );
    case "SELESAI":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3" />
          Selesai
        </Badge>
      );
    case "PERLU_REVIEW_ULANG":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 whitespace-nowrap">
          <RotateCcw className="w-3 h-3" />
          Perlu Review
        </Badge>
      );
    default:
      return null;
  }
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

const EvaluatorTable = ({ reports, onViewDetail }: EvaluatorTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Default timestamp filter to last 7 days
  const [timestampFilter, setTimestampFilter] = useState<string>("7days");
  
  // Location filters
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [lokasiAreaFilter, setLokasiAreaFilter] = useState<string>("all");
  const [detailLokasiFilter, setDetailLokasiFilter] = useState<string>("all");
  
  // Hazard type filter
  const [hazardFilter, setHazardFilter] = useState<string>("all");
  
  // Multi-select filters
  const [selectedKetidaksesuaian, setSelectedKetidaksesuaian] = useState<string[]>([]);
  const [selectedSubKetidaksesuaian, setSelectedSubKetidaksesuaian] = useState<string[]>([]);

  // Get unique hazard types from reports
  const hazardTypes = useMemo(() => {
    const types = [...new Set(reports.map(r => r.jenisHazard).filter(Boolean))];
    return types;
  }, [reports]);

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

  // Filter reports
  const filteredAndSortedReports = useMemo(() => {
    // Calculate date threshold for timestamp filter
    const now = new Date();
    let dateThreshold: Date | null = null;
    if (timestampFilter === "7days") {
      dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timestampFilter === "30days") {
      dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timestampFilter === "90days") {
      dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const filtered = reports.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.deskripsiTemuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.ketidaksesuaian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.subKetidaksesuaian?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLabel = selectedLabels.length === 0 || 
        selectedLabels.some(label => report.labels?.includes(label as 'TBC' | 'PSPP' | 'GR'));

      const matchesSite = siteFilter === "all" || report.site === siteFilter;
      const matchesLokasiArea = lokasiAreaFilter === "all" || report.lokasiArea === lokasiAreaFilter;
      const matchesDetailLokasi = detailLokasiFilter === "all" || report.detailLokasi === detailLokasiFilter;
      
      const matchesHazard = hazardFilter === "all" || report.jenisHazard === hazardFilter;
      
      const matchesKetidaksesuaian = selectedKetidaksesuaian.length === 0 || 
        (report.ketidaksesuaian && selectedKetidaksesuaian.includes(report.ketidaksesuaian));
      
      const matchesSubKetidaksesuaian = selectedSubKetidaksesuaian.length === 0 || 
        (report.subKetidaksesuaian && selectedSubKetidaksesuaian.includes(report.subKetidaksesuaian));

      // Timestamp filter
      let matchesTimestamp = true;
      if (dateThreshold && report.timestamp) {
        const reportDate = new Date(report.timestamp);
        matchesTimestamp = reportDate >= dateThreshold;
      }

      return matchesSearch && matchesLabel && matchesSite && matchesLokasiArea && matchesDetailLokasi && matchesHazard && matchesKetidaksesuaian && matchesSubKetidaksesuaian && matchesTimestamp;
    });

    // Sort by timestamp
    return filtered.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.tanggal).getTime();
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.tanggal).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [reports, searchTerm, selectedLabels, siteFilter, lokasiAreaFilter, detailLokasiFilter, hazardFilter, selectedKetidaksesuaian, selectedSubKetidaksesuaian, sortOrder, timestampFilter]);

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedLabels([]);
    setSiteFilter("all");
    setLokasiAreaFilter("all");
    setDetailLokasiFilter("all");
    setHazardFilter("all");
    setSelectedKetidaksesuaian([]);
    setSelectedSubKetidaksesuaian([]);
    setSearchTerm("");
    setSortOrder("desc");
    setTimestampFilter("7days");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedLabels.length > 0 || siteFilter !== "all" || lokasiAreaFilter !== "all" || detailLokasiFilter !== "all" || hazardFilter !== "all" || selectedKetidaksesuaian.length > 0 || selectedSubKetidaksesuaian.length > 0 || searchTerm !== "" || timestampFilter !== "7days";

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredAndSortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Stats
  const siapEvaluasiCount = reports.filter(r => r.evaluationStatus === "BELUM_DIEVALUASI").length;

  return (
    <div className="bg-card rounded-lg card-shadow animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Daftar Laporan (Siap Dievaluasi)</h2>
              <p className="text-sm text-muted-foreground">
                {siapEvaluasiCount} siap dievaluasi
              </p>
            </div>
          </div>
        </div>
        
        {/* Search & Filters - Single Row */}
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

          {/* Quick Label Filters */}
          <div className="flex items-center gap-1">
            <Button 
              variant={selectedLabels.includes("TBC") ? "default" : "outline"} 
              size="sm"
              className={`h-8 text-xs ${selectedLabels.includes("TBC") ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}`}
              onClick={() => handleLabelToggle("TBC")}
            >
              TBC
            </Button>
            <Button 
              variant={selectedLabels.includes("PSPP") ? "default" : "outline"} 
              size="sm"
              className={`h-8 text-xs ${selectedLabels.includes("PSPP") ? "bg-info text-info-foreground hover:bg-info/90" : ""}`}
              onClick={() => handleLabelToggle("PSPP")}
            >
              PSPP
            </Button>
            <Button 
              variant={selectedLabels.includes("GR") ? "default" : "outline"} 
              size="sm"
              className={`h-8 text-xs ${selectedLabels.includes("GR") ? "bg-success text-success-foreground hover:bg-success/90" : ""}`}
              onClick={() => handleLabelToggle("GR")}
            >
              GR
            </Button>
          </div>

          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          {/* Timestamp Filter */}
          <Select value={timestampFilter} onValueChange={(v) => { setTimestampFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Waktu</SelectItem>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="90days">90 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>

          {/* Hazard Type Filter */}
          <Select value={hazardFilter} onValueChange={(v) => { setHazardFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Jenis Hazard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Hazard</SelectItem>
              {hazardTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
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
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-xs">
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Label</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Confidence</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">ID Tracking</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Timestamp Masuk</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Pelapor</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Site</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Lokasi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[150px]">Ketidaksesuaian</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap w-[150px]">Sub-Ketidaksesuaian</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Jenis Hazard</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Status Evaluasi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-8 text-center text-muted-foreground">
                  Tidak ada laporan ditemukan
                </td>
              </tr>
            ) : (
              paginatedReports.map((report, index) => (
                <tr 
                  key={report.id} 
                  className="border-b border-border hover:bg-muted/20 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {report.labels?.map(label => (
                        <span 
                          key={label}
                          className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor(label)}`}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-medium ${
                      (report.confidenceScore || 0) >= 90 ? 'text-success' :
                      (report.confidenceScore || 0) >= 80 ? 'text-warning' : 'text-muted-foreground'
                    }`}>
                      {report.confidenceScore || 0}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap">{report.id}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatTimestamp(report.timestamp) || report.tanggal}</td>
                  <td className="px-3 py-2 text-xs text-foreground whitespace-nowrap">{report.pelapor}</td>
                  <td className="px-3 py-2 text-xs text-foreground whitespace-nowrap">{report.site}</td>
                  <td className="px-3 py-2 text-xs text-foreground whitespace-nowrap">{report.lokasiArea || report.lokasi}</td>
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
                    <div>
                      <p className="text-xs font-medium text-foreground">{report.jenisHazard}</p>
                      <p className="text-[10px] text-muted-foreground">{report.subJenisHazard}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {report.evaluationStatus && getEvaluationStatusBadge(report.evaluationStatus)}
                  </td>
                  <td className="px-3 py-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5 h-7 text-xs"
                      onClick={() => onViewDetail(report)}
                    >
                      <FileText className="w-3 h-3" />
                      Evaluasi
                    </Button>
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
          {hasActiveFilters && ` (hasil filter)`}
        </p>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="h-7 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {currentPage} / {totalPages || 1}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="h-7 px-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorTable;