import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, ClipboardCheck, Tag, 
  Search, RefreshCw, ChevronRight, Filter, Clock,
  Bot, ExternalLink, Timer, MoreHorizontal, MapPin, Type, Sparkles, CheckCircle2,
  AlertCircle, RotateCcw, History, XCircle, AlertTriangle, Eye, FileText, Flag, Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import RetryModal, { RetryConfig } from './RetryModal';
import ErrorDetailsDrawer from './ErrorDetailsDrawer';
import BatchHistoryDrawer from './BatchHistoryDrawer';
import {
  QueueItem, QueueItemStatus, statusDisplayConfig,
  mockQueueItems, mockBatches, mockAttemptHistory,
} from '@/data/queueMonitorData';

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

const QueueStatusBadge = ({ status, errorCode }: { status: QueueItemStatus; errorCode?: string | null }) => {
  const conf = statusDisplayConfig[status];
  const iconMap: Record<QueueItemStatus, React.ReactNode> = {
    menunggu: <Clock className="w-3 h-3" />,
    diproses: <RefreshCw className="w-3 h-3 animate-spin" />,
    sukses: <CheckCircle2 className="w-3 h-3" />,
    gagal: <XCircle className="w-3 h-3" />,
    butuh_pengecekan: <AlertTriangle className="w-3 h-3" />,
    retrying: <RotateCcw className="w-3 h-3 animate-spin" />,
    stuck: <AlertCircle className="w-3 h-3" />,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${conf.bgColor} ${conf.color} ${conf.borderColor} font-normal gap-1.5 cursor-help`}>
            {iconMap[status]}
            {conf.label}
            {errorCode && ['gagal', 'stuck', 'butuh_pengecekan'].includes(status) && (
              <AlertTriangle className="w-2.5 h-2.5 ml-0.5" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px]">
          <p className="text-xs">{conf.description}</p>
          {errorCode && <p className="text-xs text-destructive mt-1">Error: {errorCode}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal/Drawer states
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [retryModalItems, setRetryModalItems] = useState<Array<{ id: string; status: QueueItemStatus }>>([]);
  const [retryModalMode, setRetryModalMode] = useState<'items' | 'batch'>('items');
  const [retryBatchId, setRetryBatchId] = useState<string | undefined>();

  const [errorDrawerOpen, setErrorDrawerOpen] = useState(false);
  const [errorDrawerItem, setErrorDrawerItem] = useState<QueueItem | null>(null);

  const [batchDrawerOpen, setBatchDrawerOpen] = useState(false);

  // Time window
  const [timeRemaining, setTimeRemaining] = useState(3 * 60 * 60);
  const [lastUpdated] = useState(new Date());

  const executionDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
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
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  // Filtered data
  const filteredItems = useMemo(() => {
    return mockQueueItems.filter(item => {
      const matchSearch = !searchQuery ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pelapor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSite = siteFilter === 'all' || item.site.toLowerCase() === siteFilter;
      const matchLokasi = lokasiFilter === 'all';
      return matchSearch && matchStatus && matchSite && matchLokasi;
    });
  }, [searchQuery, statusFilter, siteFilter, lokasiFilter]);

  // Pipeline stats computed from data
  const currentStats = useMemo(() => ({
    menunggu: mockQueueItems.filter(i => i.status === 'menunggu').length,
    diproses: mockQueueItems.filter(i => ['diproses', 'retrying'].includes(i.status)).length,
    selesai: mockQueueItems.filter(i => i.status === 'sukses').length,
    gagal: mockQueueItems.filter(i => ['gagal', 'stuck', 'butuh_pengecekan'].includes(i.status)).length,
  }), []);

  // Selection helpers
  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every(i => selectedIds.has(i.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Retry eligibility check
  const selectedItems = filteredItems.filter(i => selectedIds.has(i.id));
  const eligibleStatuses: QueueItemStatus[] = ['gagal', 'stuck', 'butuh_pengecekan'];
  const hasEligibleSelected = selectedItems.some(i => eligibleStatuses.includes(i.status));

  // Handlers
  const handleRetrySelected = () => {
    setRetryModalItems(selectedItems.map(i => ({ id: i.id, status: i.status })));
    setRetryModalMode('items');
    setRetryBatchId(undefined);
    setRetryModalOpen(true);
  };

  const handleRetryItem = (item: QueueItem) => {
    setRetryModalItems([{ id: item.id, status: item.status }]);
    setRetryModalMode('items');
    setRetryBatchId(undefined);
    setRetryModalOpen(true);
  };

  const handleViewError = (item: QueueItem) => {
    setErrorDrawerItem(item);
    setErrorDrawerOpen(true);
  };

  const handleRetryFromErrorDrawer = (itemId: string) => {
    const item = mockQueueItems.find(i => i.id === itemId);
    if (item) {
      setErrorDrawerOpen(false);
      handleRetryItem(item);
    }
  };

  const handleRetrySubmit = (config: RetryConfig) => {
    toast.success('Retry triggered', {
      description: `${config.item_ids.length} item akan diproses ulang. Alasan: ${config.reason_code}`,
    });
    clearSelection();
  };

  const handleRetryBatch = (batchId: string, scope: 'failed_only' | 'entire_batch') => {
    const batchItems = mockQueueItems
      .filter(i => i.batch_id === batchId)
      .map(i => ({ id: i.id, status: i.status }));
    setRetryModalItems(batchItems);
    setRetryModalMode('batch');
    setRetryBatchId(batchId);
    setBatchDrawerOpen(false);
    setRetryModalOpen(true);
  };

  const handleStatusCardClick = (status: string) => {
    setStatusFilter(status);
    toast.info(`Filter: ${status}`, {
      description: `Menampilkan laporan dengan status ${status}`
    });
  };

  const handleRefresh = () => {
    toast.info('Memuat ulang data...', { description: 'Data akan diperbarui' });
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
            <TableHead className="w-10">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="font-semibold text-foreground">ID</TableHead>
            <TableHead className="font-semibold text-foreground">Timestamp</TableHead>
            <TableHead className="font-semibold text-foreground">Pelapor</TableHead>
            <TableHead className="font-semibold text-foreground">Site</TableHead>
            <TableHead className="font-semibold text-foreground">Lokasi</TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              <TooltipProvider><Tooltip><TooltipTrigger><MapPin className="w-4 h-4 text-geo mx-auto" /></TooltipTrigger><TooltipContent>Geo Check</TooltipContent></Tooltip></TooltipProvider>
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              <TooltipProvider><Tooltip><TooltipTrigger><Type className="w-4 h-4 text-lexical mx-auto" /></TooltipTrigger><TooltipContent>Text Check</TooltipContent></Tooltip></TooltipProvider>
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              <TooltipProvider><Tooltip><TooltipTrigger><Sparkles className="w-4 h-4 text-semantic mx-auto" /></TooltipTrigger><TooltipContent>Semantic Check</TooltipContent></Tooltip></TooltipProvider>
            </TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Duplicate Score</TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              <TooltipProvider><Tooltip><TooltipTrigger><span className="text-xs">Retry</span></TooltipTrigger><TooltipContent>Jumlah percobaan</TooltipContent></Tooltip></TooltipProvider>
            </TableHead>
            <TableHead className="font-semibold text-foreground">Duplicate Status</TableHead>
            <TableHead className="font-semibold text-foreground">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                Tidak ada item ditemukan dalam time window ini.
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow
                key={item.id}
                className={`hover:bg-muted/20 ${selectedIds.has(item.id) ? 'bg-primary/5' : ''}`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                  />
                </TableCell>
                <TableCell className="font-mono font-semibold text-primary">{item.id}</TableCell>
                <TableCell className="text-muted-foreground">{item.timestamp}</TableCell>
                <TableCell className="font-medium text-geo">{item.pelapor}</TableCell>
                <TableCell className="text-muted-foreground">{item.site}</TableCell>
                <TableCell className="text-primary">{item.lokasi}</TableCell>
                <TableCell className="text-center"><CheckIcon checked={item.geoCheck} type="geo" /></TableCell>
                <TableCell className="text-center"><CheckIcon checked={item.textCheck} type="text" /></TableCell>
                <TableCell className="text-center"><CheckIcon checked={item.semanticCheck} type="semantic" /></TableCell>
                <TableCell>
                  <QueueStatusBadge status={item.status} errorCode={item.last_error_code} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    {item.status === 'sukses' ? (
                      <>
                        <Progress value={item.duplicateScore} className="h-1.5 flex-1" />
                        <span className="text-xs font-mono text-foreground">{item.duplicateScore}%</span>
                      </>
                    ) : item.status === 'diproses' || item.status === 'retrying' ? (
                      <>
                        <Progress value={item.duplicateScore} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">Processing…</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {item.attempt_count > 0 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className={`text-xs font-mono ${item.attempt_count >= 3 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            {item.attempt_count}x
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {item.attempt_count} percobaan
                            {item.last_attempt_at && (
                              <><br />Terakhir: {new Date(item.last_attempt_at).toLocaleString('id-ID')}</>
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.duplicateStatus || '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {eligibleStatuses.includes(item.status) && (
                        <DropdownMenuItem onClick={() => handleRetryItem(item)} className="gap-2">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Ulangi Proses
                        </DropdownMenuItem>
                      )}
                      {item.last_error_message && (
                        <DropdownMenuItem onClick={() => handleViewError(item)} className="gap-2">
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Detail Error
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Lihat Log
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {item.status !== 'butuh_pengecekan' && (
                        <DropdownMenuItem className="gap-2 text-warning">
                          <Flag className="w-3.5 h-3.5" />
                          Tandai Butuh Pengecekan
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground flex items-center justify-between">
        <span>1-{filteredItems.length} dari {mockQueueItems.length}</span>
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
                <h1 className="text-xl font-bold text-foreground">AI Agent Queue Monitoring</h1>
                <p className="text-sm text-muted-foreground">Monitoring antrian AI engine untuk pemrosesan laporan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setBatchDrawerOpen(true)} className="gap-1.5">
                      <History className="w-4 h-4" />
                      Riwayat Batch
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Lihat riwayat batch dan retry per batch</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Flow */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => { setActiveTab(tab.id); clearSelection(); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    activeTab === tab.id
                      ? `${tab.color} bg-${tab.id === 'duplicate' ? 'geo' : tab.id === 'form' ? 'lexical' : 'semantic'}/10 font-medium`
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === tab.id ? 'bg-foreground text-background' : 'bg-muted'
                  }`}>{index + 1}</span>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
                {index < tabs.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari ID / Pelapor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground"><Filter className="w-4 h-4" /></div>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Semua Site" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Site</SelectItem>
                <SelectItem value="marine">MARINE</SelectItem>
                <SelectItem value="lmo">LMO</SelectItem>
                <SelectItem value="gmo">GMO</SelectItem>
                <SelectItem value="bmo 1">BMO 1</SelectItem>
                <SelectItem value="bmo 2">BMO 2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
                <SelectItem value="sukses">Sukses</SelectItem>
                <SelectItem value="gagal">Gagal</SelectItem>
                <SelectItem value="stuck">Tersangkut</SelectItem>
                <SelectItem value="butuh_pengecekan">Butuh Pengecekan</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Sort
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Step Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {activeTab === 'duplicate' && <Copy className="w-5 h-5 text-geo" />}
                {activeTab === 'form' && <ClipboardCheck className="w-5 h-5 text-lexical" />}
                {activeTab === 'hazard' && <Tag className="w-5 h-5 text-semantic" />}
                <h2 className="text-lg font-semibold text-foreground">{currentConfig.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{currentConfig.subtitle}</p>

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
                    <span>Update berikutnya: <span className="font-medium text-foreground">{getNextUpdateTime()}</span></span>
                    <span>Terakhir diperbarui: <span className="font-medium text-foreground">{formatLastUpdated()}</span></span>
                  </div>
                </div>
              )}

              {activeTab === 'form' && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-lexical/10 rounded-lg border border-lexical/20 w-fit">
                    <ClipboardCheck className="w-4 h-4 text-lexical" />
                    <span className="text-sm font-medium text-lexical">Sedang mengeksekusi form check pada tanggal: {executionDate}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">Hazard yang dianalisis adalah hazard yang tidak termasuk duplicate</p>
                </div>
              )}

              {activeTab === 'hazard' && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-semantic/10 rounded-lg border border-semantic/20 w-fit">
                    <Tag className="w-4 h-4 text-semantic" />
                    <span className="text-sm font-medium text-semantic">Sedang memberi label hazard pada tanggal: {executionDate}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">Proses dilakukan setelah Form Checker selesai</p>
                </div>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleQuickAction} className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-xs">{currentConfig.buttonLabel}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Buka dashboard evaluator untuk review detail</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Pipeline Status Cards */}
        <div className="mb-4">
          <PipelineStatusCards stats={currentStats} onStatusClick={handleStatusCardClick} />
        </div>

        {/* Bulk Action Bar */}
        {someSelected && (
          <div className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg border border-primary/20 bg-primary/5 sticky top-[73px] z-[5]">
            <span className="text-sm font-medium text-foreground">{selectedIds.size} item dipilih</span>
            <div className="flex-1" />
            <Button
              size="sm"
              onClick={handleRetrySelected}
              disabled={!hasEligibleSelected}
              className="gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ulangi Proses (Terpilih)
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              Tandai Butuh Pengecekan
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="text-muted-foreground">
              Hapus Pilihan
            </Button>
            {!hasEligibleSelected && selectedIds.size > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="text-xs">Tidak ada item yang eligible untuk retry di pilihan saat ini. Hanya status Gagal, Tersangkut, dan Butuh Pengecekan yang bisa diretry.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            {tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="duplicate" className="mt-0">{renderTable()}</TabsContent>
          <TabsContent value="form" className="mt-0">{renderTable()}</TabsContent>
          <TabsContent value="hazard" className="mt-0">{renderTable()}</TabsContent>
        </Tabs>
      </div>

      {/* Modals & Drawers */}
      <RetryModal
        open={retryModalOpen}
        onOpenChange={setRetryModalOpen}
        items={retryModalItems}
        mode={retryModalMode}
        batchId={retryBatchId}
        onRetry={handleRetrySubmit}
      />

      <ErrorDetailsDrawer
        open={errorDrawerOpen}
        onOpenChange={setErrorDrawerOpen}
        item={errorDrawerItem}
        attempts={errorDrawerItem ? (mockAttemptHistory[errorDrawerItem.id] || []) : []}
        onRetry={handleRetryFromErrorDrawer}
      />

      <BatchHistoryDrawer
        open={batchDrawerOpen}
        onOpenChange={setBatchDrawerOpen}
        batches={mockBatches}
        onRetryBatch={handleRetryBatch}
        onViewBatchDetail={(batchId) => {
          toast.info(`Detail batch ${batchId}`, { description: 'Fitur detail batch akan segera tersedia.' });
        }}
      />
    </div>
  );
};

export default AIDuplicateDetection;
