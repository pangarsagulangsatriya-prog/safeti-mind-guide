import { useState } from "react";
import { FileText, Search, Filter, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "./StatusBadge";
import ClusterPanel from "./ClusterPanel";
import { HazardReport, reportClusters, ClusterInfo } from "@/data/hazardReports";

interface HazardTableProps {
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

const getReportLabel = (report: HazardReport): ('TBC' | 'PSPP' | 'GR')[] => {
  if (report.labels && report.labels.length > 0) {
    return report.labels;
  }
  // Default assignment based on hazard type
  if (report.jenisHazard === "APD") return ["TBC"];
  if (report.jenisHazard === "Pengoperasian Kendaraan") return ["PSPP"];
  if (report.jenisHazard === "Kondisi Area" || report.jenisHazard === "Perawatan Jalan") return ["GR"];
  return ["TBC"];
};

const HazardTable = ({ reports, onViewDetail }: HazardTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);

  // Filter reports
  const filteredReports = reports.filter(report => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.deskripsiTemuan.toLowerCase().includes(searchTerm.toLowerCase());

    // Label filter
    const reportLabels = getReportLabel(report);
    const matchesLabel = selectedLabels.length === 0 || 
      selectedLabels.some(label => reportLabels.includes(label as 'TBC' | 'PSPP' | 'GR'));

    // Cluster filter
    const matchesCluster = selectedClusters.length === 0 || 
      (report.cluster && selectedClusters.includes(report.cluster));

    return matchesSearch && matchesLabel && matchesCluster;
  });

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const handleClusterToggle = (clusterId: string) => {
    setSelectedClusters(prev => 
      prev.includes(clusterId) 
        ? prev.filter(c => c !== clusterId)
        : [...prev, clusterId]
    );
  };

  const clearFilters = () => {
    setSelectedLabels([]);
    setSelectedClusters([]);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLabels.length > 0 || selectedClusters.length > 0;

  const handleClusterClick = (clusterId: string) => {
    const cluster = reportClusters.find(c => c.id === clusterId);
    if (cluster) {
      setViewingCluster(cluster);
    }
  };

  const handleSelectReportFromCluster = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setViewingCluster(null);
      onViewDetail(report);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Daftar Laporan Hazard</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari ID, pelapor, lokasi, atau deskripsi..." 
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Label Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Label
                  {selectedLabels.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedLabels.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Label</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedLabels.includes("TBC")}
                  onCheckedChange={() => handleLabelToggle("TBC")}
                >
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor("TBC")}`}>
                    TBC
                  </span>
                  <span className="ml-2 text-muted-foreground">To be Concern</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedLabels.includes("PSPP")}
                  onCheckedChange={() => handleLabelToggle("PSPP")}
                >
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor("PSPP")}`}>
                    PSPP
                  </span>
                  <span className="ml-2 text-muted-foreground">Sanksi Pelanggaran</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedLabels.includes("GR")}
                  onCheckedChange={() => handleLabelToggle("GR")}
                >
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor("GR")}`}>
                    GR
                  </span>
                  <span className="ml-2 text-muted-foreground">Golden Rules</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cluster Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" />
                  Cluster
                  {selectedClusters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedClusters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Filter by Cluster</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {reportClusters.map((cluster) => (
                  <DropdownMenuCheckboxItem
                    key={cluster.id}
                    checked={selectedClusters.includes(cluster.id)}
                    onCheckedChange={() => handleClusterToggle(cluster.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{cluster.id}</span>
                      <span className="text-xs text-muted-foreground">{cluster.name}</span>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {cluster.reportCount}
                    </Badge>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedLabels.map(label => (
                <Badge 
                  key={label} 
                  variant="secondary" 
                  className="gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleLabelToggle(label)}
                >
                  {label}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              {selectedClusters.map(clusterId => (
                <Badge 
                  key={clusterId} 
                  variant="secondary" 
                  className="gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleClusterToggle(clusterId)}
                >
                  {clusterId}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Label</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">ID Tracking</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tanggal</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pelapor</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Lokasi</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Jenis Hazard</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cluster</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => {
                const labels = getReportLabel(report);
                return (
                  <tr 
                    key={report.id} 
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {labels.map(label => (
                          <span 
                            key={label}
                            className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor(label)}`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{report.id}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{report.tanggal}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{report.pelapor}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{report.lokasiKode}</p>
                        <p className="text-xs text-muted-foreground">{report.lokasi}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{report.jenisHazard}</p>
                        <p className="text-xs text-muted-foreground">{report.subJenisHazard}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={report.evaluationStatus === 'SELESAI' ? 'Selesai' : report.evaluationStatus === 'DALAM_EVALUASI' ? 'Dalam Proses' : 'Menunggu Review'} />
                    </td>
                    <td className="px-4 py-3">
                      {report.cluster ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                          onClick={() => handleClusterClick(report.cluster!)}
                        >
                          {report.cluster}
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => onViewDetail(report)}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Evaluasi
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan 1-{filteredReports.length} dari {reports.length} laporan
            {hasActiveFilters && ` (${filteredReports.length} hasil filter)`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>

      {/* Cluster Detail Panel */}
      {viewingCluster && (
        <ClusterPanel 
          cluster={viewingCluster}
          onClose={() => setViewingCluster(null)}
          onSelectReport={handleSelectReportFromCluster}
        />
      )}
    </>
  );
};

export default HazardTable;