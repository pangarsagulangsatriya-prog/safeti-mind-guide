import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Clock, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HazardReport } from "@/data/hazardReports";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ReportListPanelProps {
  reports: HazardReport[];
  selectedReportId: string;
  onSelectReport: (report: HazardReport) => void;
}

const getReportLabel = (report: HazardReport): string => {
  // Assign labels based on hazard type
  if (report.jenisHazard === "APD") return "TBC";
  if (report.jenisHazard === "Pengoperasian Kendaraan") return "PSPP";
  if (report.jenisHazard === "Kondisi Area" || report.jenisHazard === "Perawatan Jalan") return "GR";
  return "TBC";
};

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

const getReportAge = (tanggal: string): string => {
  // Simple calculation based on the date string
  const today = new Date();
  const parts = tanggal.split(" ");
  const day = parseInt(parts[0]);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const month = monthNames.indexOf(parts[1]);
  const year = parseInt(parts[2]);
  
  const reportDate = new Date(year, month, day);
  const diffTime = Math.abs(today.getTime() - reportDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "1 hari lalu";
  return `${diffDays} hari lalu`;
};

const ReportListPanel = ({ reports, selectedReportId, onSelectReport }: ReportListPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter reports based on search
  const filteredReports = reports.filter(report =>
    report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.deskripsiTemuan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Search & Filter */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari laporan..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto">
        {paginatedReports.map((report) => {
          const label = getReportLabel(report);
          const isSelected = report.id === selectedReportId;
          
          return (
            <button
              key={report.id}
              onClick={() => onSelectReport(report)}
              className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50 ${
                isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor(label)}`}>
                      {label}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {report.id}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {report.subJenisHazard}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{report.tanggal}</span>
                    <span className="text-muted-foreground/60">•</span>
                    <span>{getReportAge(report.tanggal)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{filteredReports.length} laporan</span>
          <span>Hal {currentPage} / {totalPages || 1}</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="w-7 h-7"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="icon"
                className="w-7 h-7"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            className="w-7 h-7"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportListPanel;
