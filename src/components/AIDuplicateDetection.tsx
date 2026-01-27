import React, { useState, useEffect } from 'react';
import { 
  Copy, ClipboardCheck, Tag, 
  Search, RefreshCw, ChevronRight, Filter, Clock,
  Bot, ExternalLink, Timer
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'duplicate', label: 'Duplicate Matcher', icon: Copy, color: 'text-geo' },
  { id: 'form', label: 'Form Checker', icon: ClipboardCheck, color: 'text-lexical' },
  { id: 'hazard', label: 'Hazard Labeling', icon: Tag, color: 'text-semantic' },
] as const;

const tabConfig = {
  duplicate: {
    title: 'Duplicate Matcher',
    subtitle: 'Memproses laporan pada rentang waktu tertentu untuk deteksi duplikat',
    buttonLabel: 'Open Duplicate Evaluator',
    navigateTo: '/dashboard-evaluator',
  },
  form: {
    title: 'Form Checker',
    subtitle: 'Memeriksa kelengkapan dan konsistensi field laporan',
    buttonLabel: 'Open Form Checker',
    navigateTo: '/form-checker',
  },
  hazard: {
    title: 'Hazard Labeling',
    subtitle: 'Memberi label hazard secara otomatis untuk mempercepat review',
    buttonLabel: 'Open Hazard Labeling',
    navigateTo: '/dashboard-evaluator',
  },
};

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
    id: '5892134',
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('duplicate');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [lokasiFilter, setLokasiFilter] = useState('all');
  const [ketidaksesuaianFilter, setKetidaksesuaianFilter] = useState('all');
  const [subKetidaksesuaianFilter, setSubKetidaksesuaianFilter] = useState('all');
  
  // Time window countdown state
  const [timeRemaining, setTimeRemaining] = useState(3 * 60 * 60); // 3 hours in seconds
  const [lastUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 3 * 60 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextUpdateTime = () => {
    const next = new Date(lastUpdated.getTime() + 3 * 60 * 60 * 1000);
    return next.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRefresh = () => {
    toast.info('Memuat ulang data...', {
      description: 'Data akan diperbarui'
    });
  };

  const currentConfig = tabConfig[activeTab as keyof typeof tabConfig];

  const handleQuickAction = () => {
    navigate(currentConfig.navigateTo);
  };

  const renderTable = () => (
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
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI Agent Queue Monitoring
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitoring antrian AI engine untuk pemrosesan laporan
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Flow Indicator */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    activeTab === tab.id 
                      ? `${tab.color} bg-${tab.id === 'duplicate' ? 'geo' : tab.id === 'form' ? 'lexical' : 'semantic'}/10 font-medium` 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === tab.id ? 'bg-foreground text-background' : 'bg-muted'
                  }`}>
                    {index + 1}
                  </span>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
                {index < tabs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
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
        {/* Step Header with Title, Subtitle, and Quick Action */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {activeTab === 'duplicate' && <Copy className="w-5 h-5 text-geo" />}
                {activeTab === 'form' && <ClipboardCheck className="w-5 h-5 text-lexical" />}
                {activeTab === 'hazard' && <Tag className="w-5 h-5 text-semantic" />}
                <h2 className="text-lg font-semibold text-foreground">
                  {currentConfig.title}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentConfig.subtitle}
              </p>
              
              {/* Time Window Info - Only for Duplicate Matcher */}
              {activeTab === 'duplicate' && (
                <div className="mt-3 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-geo/10 rounded-lg border border-geo/20">
                    <Timer className="w-4 h-4 text-geo" />
                    <span className="text-sm font-medium text-geo">Time Window: 3 jam terakhir</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Countdown: <span className="font-mono font-medium text-foreground">{formatCountdown(timeRemaining)}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Update berikutnya: <span className="font-medium text-foreground">{getNextUpdateTime()}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Terakhir diperbarui: <span className="font-medium text-foreground">{formatLastUpdated()}</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Action Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleQuickAction}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {currentConfig.buttonLabel}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buka dashboard evaluator untuk review detail</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="duplicate" className="mt-0">
            {renderTable()}
          </TabsContent>

          <TabsContent value="form" className="mt-0">
            {renderTable()}
          </TabsContent>

          <TabsContent value="hazard" className="mt-0">
            {renderTable()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIDuplicateDetection;
