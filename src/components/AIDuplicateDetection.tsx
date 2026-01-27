import React, { useState, useEffect } from 'react';
import { 
  Copy, ClipboardCheck, Tag, 
  Search, RefreshCw, ChevronRight, Filter, Clock,
  Bot, ExternalLink, Timer, MoreHorizontal, MapPin, Type, Sparkles, CheckCircle2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import PipelineStatusCards from './PipelineStatusCards';

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

// Mock data for the table - matching the reference UI
const mockReports = [
  {
    id: '8060386',
    timestamp: '19 Jan, 08:05',
    pelapor: 'SUWARNO',
    site: 'LMO',
    lokasi: 'Workshop Bigshop BUMA',
    geoCheck: true,
    textCheck: true,
    semanticCheck: true,
    status: 'menunggu',
    duplicateScore: 45,
    duplicateStatus: null,
  },
  {
    id: '8060385',
    timestamp: '19 Jan, 08:05',
    pelapor: 'FIRMAN',
    site: 'MARINE',
    lokasi: 'Towing Tug',
    geoCheck: true,
    textCheck: true,
    semanticCheck: true,
    status: 'menunggu',
    duplicateScore: 35,
    duplicateStatus: null,
  },
  {
    id: '8060379',
    timestamp: '19 Jan, 08:05',
    pelapor: 'IRFAN NUR RIZAL',
    site: 'GMO',
    lokasi: 'Crusher 01 dan BLC',
    geoCheck: true,
    textCheck: true,
    semanticCheck: true,
    status: 'diproses',
    duplicateScore: 60,
    duplicateStatus: null,
  },
  {
    id: '8060378',
    timestamp: '19 Jan, 08:05',
    pelapor: 'ABDAN SYEKURA',
    site: 'BMO 1',
    lokasi: 'Fuel Station',
    geoCheck: true,
    textCheck: true,
    semanticCheck: true,
    status: 'diproses',
    duplicateScore: 55,
    duplicateStatus: null,
  },
  {
    id: '8060377',
    timestamp: '19 Jan, 08:05',
    pelapor: 'INDRA WIRA PRANATA',
    site: 'BMO 2',
    lokasi: '(B8) Pit J',
    geoCheck: true,
    textCheck: true,
    semanticCheck: true,
    status: 'diproses',
    duplicateScore: 50,
    duplicateStatus: null,
  },
  {
    id: '8060373',
    timestamp: '19 Jan, 08:05',
    pelapor: 'FIRMAN',
    site: 'MARINE',
    lokasi: 'Towing Tug',
    geoCheck: true,
    textCheck: true,
    semanticCheck: true,
    status: 'diproses',
    duplicateScore: 40,
    duplicateStatus: null,
  },
];

// Mock pipeline stats for each tab
const pipelineStats = {
  duplicate: { menunggu: 2, diproses: 4, selesai: 12, gagal: 0 },
  form: { menunggu: 5, diproses: 3, selesai: 8, gagal: 1 },
  hazard: { menunggu: 3, diproses: 2, selesai: 10, gagal: 0 },
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'menunggu') {
    return (
      <Badge 
        variant="outline" 
        className="bg-warning/10 text-warning border-warning/30 font-normal gap-1.5"
      >
        <Clock className="w-3 h-3" />
        Menunggu
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className="bg-info/10 text-info border-info/30 font-normal gap-1.5"
    >
      <RefreshCw className="w-3 h-3 animate-spin" />
      Diproses
    </Badge>
  );
};

const CheckIcon = ({ checked, type }: { checked: boolean; type: 'geo' | 'text' | 'semantic' }) => {
  const colorClass = type === 'geo' ? 'text-geo' : type === 'text' ? 'text-lexical' : 'text-semantic';
  
  return (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checked ? `bg-${type === 'geo' ? 'geo' : type === 'text' ? 'lexical' : 'semantic'}/10` : 'bg-muted'}`}>
      {checked ? (
        <CheckCircle2 className={`w-4 h-4 ${colorClass}`} />
      ) : (
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
      )}
    </div>
  );
};

const AIDuplicateDetection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('duplicate');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [lokasiFilter, setLokasiFilter] = useState('all');
  
  // Time window countdown state
  const [timeRemaining, setTimeRemaining] = useState(3 * 60 * 60); // 3 hours in seconds
  const [lastUpdated] = useState(new Date());

  // Current execution date (for Form Checker and Hazard Labeling)
  const executionDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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
  const currentStats = pipelineStats[activeTab as keyof typeof pipelineStats];

  const handleQuickAction = () => {
    navigate(currentConfig.navigateTo);
  };

  const handleStatusCardClick = (status: string) => {
    setStatusFilter(status);
    toast.info(`Filter: ${status}`, {
      description: `Menampilkan laporan dengan status ${status}`
    });
  };

  const renderTable = () => (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold text-foreground">ID</TableHead>
            <TableHead className="font-semibold text-foreground">Timestamp</TableHead>
            <TableHead className="font-semibold text-foreground">Pelapor</TableHead>
            <TableHead className="font-semibold text-foreground">Site</TableHead>
            <TableHead className="font-semibold text-foreground">Lokasi</TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <MapPin className="w-4 h-4 text-geo mx-auto" />
                  </TooltipTrigger>
                  <TooltipContent>Geo Check</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Type className="w-4 h-4 text-lexical mx-auto" />
                  </TooltipTrigger>
                  <TooltipContent>Text Check</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Sparkles className="w-4 h-4 text-semantic mx-auto" />
                  </TooltipTrigger>
                  <TooltipContent>Semantic Check</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Duplicate Score</TableHead>
            <TableHead className="font-semibold text-foreground">Duplicate Status</TableHead>
            <TableHead className="font-semibold text-foreground">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockReports.map((report, index) => (
            <TableRow key={`${report.id}-${index}`} className="hover:bg-muted/20">
              <TableCell className="font-mono font-semibold text-primary">{report.id}</TableCell>
              <TableCell className="text-muted-foreground">{report.timestamp}</TableCell>
              <TableCell className="font-medium text-geo">{report.pelapor}</TableCell>
              <TableCell className="text-muted-foreground">{report.site}</TableCell>
              <TableCell className="text-primary">{report.lokasi}</TableCell>
              <TableCell className="text-center">
                <CheckIcon checked={report.geoCheck} type="geo" />
              </TableCell>
              <TableCell className="text-center">
                <CheckIcon checked={report.textCheck} type="text" />
              </TableCell>
              <TableCell className="text-center">
                <CheckIcon checked={report.semanticCheck} type="semantic" />
              </TableCell>
              <TableCell>
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[100px]">
                  <Progress value={report.duplicateScore} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">Processing...</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
        1-{mockReports.length} dari {mockReports.length}
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
                placeholder="Cari ID / Pelapor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Filter className="w-4 h-4" />
            </div>

            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Semua Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Site</SelectItem>
                <SelectItem value="marine">MARINE</SelectItem>
                <SelectItem value="lmo">LMO</SelectItem>
                <SelectItem value="gmo">GMO</SelectItem>
                <SelectItem value="bmo1">BMO 1</SelectItem>
                <SelectItem value="bmo2">BMO 2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={lokasiFilter} onValueChange={setLokasiFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Semua Lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lokasi</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="towing">Towing Tug</SelectItem>
                <SelectItem value="crusher">Crusher</SelectItem>
                <SelectItem value="fuel">Fuel Station</SelectItem>
              </SelectContent>
            </Select>

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

            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Sort
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

              {/* Execution Info - For Form Checker */}
              {activeTab === 'form' && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-lexical/10 rounded-lg border border-lexical/20 w-fit">
                    <ClipboardCheck className="w-4 h-4 text-lexical" />
                    <span className="text-sm font-medium text-lexical">
                      Sedang mengeksekusi form check pada tanggal: {executionDate}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">
                    Hazard yang dianalisis adalah hazard yang tidak termasuk duplicate
                  </p>
                </div>
              )}

              {/* Execution Info - For Hazard Labeling */}
              {activeTab === 'hazard' && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-semantic/10 rounded-lg border border-semantic/20 w-fit">
                    <Tag className="w-4 h-4 text-semantic" />
                    <span className="text-sm font-medium text-semantic">
                      Sedang memberi label hazard pada tanggal: {executionDate}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">
                    Proses dilakukan setelah Form Checker selesai
                  </p>
                </div>
              )}
            </div>
            
            {/* Quick Action Button - Subtle styling */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleQuickAction}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-xs">{currentConfig.buttonLabel}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buka dashboard evaluator untuk review detail</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Pipeline Status Cards */}
        <div className="mb-4">
          <PipelineStatusCards 
            stats={currentStats} 
            onStatusClick={handleStatusCardClick} 
          />
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
