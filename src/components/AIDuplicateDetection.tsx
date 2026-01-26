import React, { useState } from 'react';
import { 
  Copy, ClipboardCheck, Tag, 
  Search, RefreshCw, ChevronRight, Filter, Clock,
  Activity, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const tabs = [
  { id: 'duplicate', label: 'Duplicate Matcher', icon: Copy, color: 'text-geo', bgColor: 'bg-geo/10', actionLabel: 'Lihat Detail Duplicate', actionRoute: '/form-checker' },
  { id: 'form', label: 'Form Checker', icon: ClipboardCheck, color: 'text-lexical', bgColor: 'bg-lexical/10', actionLabel: 'Lihat Form Checker', actionRoute: '/form-checker' },
  { id: 'hazard', label: 'Hazard Labeling', icon: Tag, color: 'text-semantic', bgColor: 'bg-semantic/10', actionLabel: 'Lihat Hazard Labels', actionRoute: '/form-checker' },
] as const;

// Mock data for the table
const mockReports = [
  {
    id: '7355231',
    waktu: '12.28',
    pelapor: 'MOHAMMAD ARIFIANTO',
    site: 'MARINE',
    lokasi: 'Floating Crane',
    detailLokasi: 'FLF Ocean Flow',
    ketidaksesuaian: 'External Issue',
    subKetidaksesuaian: 'External Issue',
    status: 'menunggu',
  },
  {
    id: '5892132',
    waktu: '12.28',
    pelapor: 'SUL FIKRAN',
    site: 'BMO 1',
    lokasi: 'CPP Binungan',
    detailLokasi: 'Area Parkir Unit & Jalan CPP Bin BC',
    ketidaksesuaian: 'Security',
    subKetidaksesuaian: 'Terdapat potensi ter...',
    status: 'menunggu',
  },
  {
    id: '5892133',
    waktu: '12.28',
    pelapor: 'SUL FIKRAN',
    site: 'BMO 1',
    lokasi: 'CPP Binungan',
    detailLokasi: 'Area Parkir Unit & Jalan CPP Bin BC',
    ketidaksesuaian: 'Security',
    subKetidaksesuaian: 'Terdapat potensi ter...',
    status: 'menunggu',
  },
  {
    id: '5892133',
    waktu: '12.28',
    pelapor: 'SUL FIKRAN',
    site: 'BMO 1',
    lokasi: 'CPP Binungan',
    detailLokasi: 'Area Parkir Unit & Jalan CPP Bin BC',
    ketidaksesuaian: 'Security',
    subKetidaksesuaian: 'Terdapat potensi ter...',
    status: 'menunggu',
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge 
      variant="outline" 
      className="bg-warning/10 text-warning border-warning/30 font-normal gap-1.5"
    >
      <Clock className="w-3 h-3" />
      Menunggu
    </Badge>
  );
};

const AIDuplicateDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('duplicate');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [lokasiFilter, setLokasiFilter] = useState('all');
  const [ketidaksesuaianFilter, setKetidaksesuaianFilter] = useState('all');
  const [subKetidaksesuaianFilter, setSubKetidaksesuaianFilter] = useState('all');

  const handleRefresh = () => {
    toast.info('Memuat ulang data...', {
      description: 'Data akan diperbarui'
    });
  };

  const navigate = useNavigate();
  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Queue Monitoring
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Monitoring antrian pemrosesan laporan AI
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Flow Indicator with Quick Actions */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Stepper */}
            <div className="flex items-center gap-2">
              {tabs.map((tab, index) => (
                <React.Fragment key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border ${
                      activeTab === tab.id 
                        ? `${tab.color} ${tab.bgColor} border-current font-medium shadow-sm` 
                        : 'text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      activeTab === tab.id ? 'bg-foreground text-background' : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                  {index < tabs.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Quick Action Button */}
            {currentTab && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(currentTab.actionRoute)}
                className={`gap-2 ${currentTab.color} border-current/30 hover:${currentTab.bgColor}`}
              >
                <currentTab.icon className="w-4 h-4" />
                {currentTab.actionLabel}
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Controls / Filters */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Filter className="w-4 h-4" />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>

            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Site</SelectItem>
                <SelectItem value="marine">MARINE</SelectItem>
                <SelectItem value="bmo1">BMO 1</SelectItem>
                <SelectItem value="bmo2">BMO 2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={lokasiFilter} onValueChange={setLokasiFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Lokasi</SelectItem>
                <SelectItem value="floating">Floating Crane</SelectItem>
                <SelectItem value="cpp">CPP Binungan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ketidaksesuaianFilter} onValueChange={setKetidaksesuaianFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ketidaksesuaian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ketidaksesuaian</SelectItem>
                <SelectItem value="external">External Issue</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subKetidaksesuaianFilter} onValueChange={setSubKetidaksesuaianFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sub-Ketidakses..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sub-Ketidaksesuaian</SelectItem>
                <SelectItem value="external">External Issue</SelectItem>
                <SelectItem value="potensi">Terdapat potensi</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Terlama
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Table */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="duplicate" className="mt-0">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-foreground">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Waktu</TableHead>
                    <TableHead className="font-semibold text-foreground">Pelapor</TableHead>
                    <TableHead className="font-semibold text-foreground">Site</TableHead>
                    <TableHead className="font-semibold text-foreground">Lokasi</TableHead>
                    <TableHead className="font-semibold text-foreground">Detail Lokasi</TableHead>
                    <TableHead className="font-semibold text-foreground">Ketidaksesuaian</TableHead>
                    <TableHead className="font-semibold text-foreground">Sub-Ketidaksesuaian</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report, index) => (
                    <TableRow key={`${report.id}-${index}`} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-medium text-primary">{report.id}</TableCell>
                      <TableCell className="text-muted-foreground">{report.waktu}</TableCell>
                      <TableCell className="font-medium text-geo">{report.pelapor}</TableCell>
                      <TableCell>{report.site}</TableCell>
                      <TableCell className="text-primary">{report.lokasi}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.detailLokasi}</TableCell>
                      <TableCell className="text-muted-foreground">{report.ketidaksesuaian}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[150px] truncate">{report.subKetidaksesuaian}</TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination info */}
              <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
                1-4 dari 4
              </div>
            </div>
          </TabsContent>

          <TabsContent value="form" className="mt-0">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-foreground">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Waktu</TableHead>
                    <TableHead className="font-semibold text-foreground">Pelapor</TableHead>
                    <TableHead className="font-semibold text-foreground">Site</TableHead>
                    <TableHead className="font-semibold text-foreground">Lokasi</TableHead>
                    <TableHead className="font-semibold text-foreground">Detail Lokasi</TableHead>
                    <TableHead className="font-semibold text-foreground">Ketidaksesuaian</TableHead>
                    <TableHead className="font-semibold text-foreground">Sub-Ketidaksesuaian</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report, index) => (
                    <TableRow key={`${report.id}-${index}`} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-medium text-primary">{report.id}</TableCell>
                      <TableCell className="text-muted-foreground">{report.waktu}</TableCell>
                      <TableCell className="font-medium text-geo">{report.pelapor}</TableCell>
                      <TableCell>{report.site}</TableCell>
                      <TableCell className="text-primary">{report.lokasi}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.detailLokasi}</TableCell>
                      <TableCell className="text-muted-foreground">{report.ketidaksesuaian}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[150px] truncate">{report.subKetidaksesuaian}</TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
                1-4 dari 4
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hazard" className="mt-0">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-foreground">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Waktu</TableHead>
                    <TableHead className="font-semibold text-foreground">Pelapor</TableHead>
                    <TableHead className="font-semibold text-foreground">Site</TableHead>
                    <TableHead className="font-semibold text-foreground">Lokasi</TableHead>
                    <TableHead className="font-semibold text-foreground">Detail Lokasi</TableHead>
                    <TableHead className="font-semibold text-foreground">Ketidaksesuaian</TableHead>
                    <TableHead className="font-semibold text-foreground">Sub-Ketidaksesuaian</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report, index) => (
                    <TableRow key={`${report.id}-${index}`} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-medium text-primary">{report.id}</TableCell>
                      <TableCell className="text-muted-foreground">{report.waktu}</TableCell>
                      <TableCell className="font-medium text-geo">{report.pelapor}</TableCell>
                      <TableCell>{report.site}</TableCell>
                      <TableCell className="text-primary">{report.lokasi}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.detailLokasi}</TableCell>
                      <TableCell className="text-muted-foreground">{report.ketidaksesuaian}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[150px] truncate">{report.subKetidaksesuaian}</TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
                1-4 dari 4
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIDuplicateDetection;
