import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, ClipboardCheck, Tag, 
  Search, RefreshCw, ChevronRight, Filter, Clock,
  Bot, ExternalLink, Timer, CheckCircle2,
  AlertCircle, History, ChevronLeft, Eye, RotateCcw, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import RetryModal, { RetryConfig } from './RetryModal';
import ErrorDetailsDrawer from './ErrorDetailsDrawer';
import BatchHistoryDrawer from './BatchHistoryDrawer';
import {
  QueueItem, QueueItemStatus, statusDisplayConfig,
  mockQueueItems, mockBatches, mockAttemptHistory,
} from '@/data/queueMonitorData';

const tabs = [
  { id: 'duplicate', label: 'Duplicate Matcher', icon: Copy },
  { id: 'form', label: 'Form Checker', icon: ClipboardCheck },
  { id: 'hazard', label: 'Hazard Labeling', icon: Tag },
] as const;

const tabConfig = {
  duplicate: {
    title: 'Duplicate Matcher',
    subtitle: '',
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

const QueueStatusBadge = ({ status }: { status: QueueItemStatus }) => {
  const conf = statusDisplayConfig[status];
  if (!conf) return null;
  const iconMap: Record<string, React.ReactNode> = {
    menunggu: <Clock className="w-3 h-3" />,
    diproses: <RefreshCw className="w-3 h-3 animate-spin" />,
    sukses: <CheckCircle2 className="w-3 h-3" />,
    gagal: <AlertCircle className="w-3 h-3" />,
  };

  return (
    <Badge variant="outline" className={`${conf.bgColor} ${conf.color} ${conf.borderColor} font-normal gap-1.5`}>
      {iconMap[status] || null}
      {conf.label}
    </Badge>
  );
};

const ITEMS_PER_PAGE = 5;

const AIDuplicateDetection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('duplicate');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [perusahaanFilter, setPerusahaanFilter] = useState('all');
  const [lokasiFilter, setLokasiFilter] = useState('all');
  const [detailLokasiFilter, setDetailLokasiFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  // Batch time options (WIB)
  const batchTimeOptions = ['07:00', '10:00', '13:00', '16:00', '19:00'];
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMode, setErrorMode] = useState(false);

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

  // Unique values for filters
  const uniquePerusahaan = useMemo(() => [...new Set(mockQueueItems.map(i => i.perusahaan))], []);
  const uniqueLokasi = useMemo(() => [...new Set(mockQueueItems.map(i => i.lokasi))], []);
  const uniqueDetailLokasi = useMemo(() => [...new Set(mockQueueItems.map(i => i.detail_lokasi))], []);

  // Filtered data
  const filteredItems = useMemo(() => {
    return mockQueueItems.filter(item => {
      if (errorMode && item.status !== 'gagal') return false;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        item.id.toLowerCase().includes(q) ||
        item.pelapor.toLowerCase().includes(q) ||
        item.pic_perusahaan.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSite = siteFilter === 'all' || item.site.toLowerCase() === siteFilter;
      const matchPerusahaan = perusahaanFilter === 'all' || item.perusahaan === perusahaanFilter;
      const matchLokasi = lokasiFilter === 'all' || item.lokasi === lokasiFilter;
      const matchDetailLokasi = detailLokasiFilter === 'all' || item.detail_lokasi === detailLokasiFilter;
      const matchBatch = batchFilter === 'all' || (item.batch_id && item.batch_id.includes(batchFilter));
      return matchSearch && matchStatus && matchSite && matchPerusahaan && matchLokasi && matchDetailLokasi && matchBatch;
    });
  }, [searchQuery, statusFilter, siteFilter, perusahaanFilter, lokasiFilter, detailLokasiFilter, errorMode, batchFilter]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); clearSelection(); }, [searchQuery, statusFilter, siteFilter, perusahaanFilter, lokasiFilter, detailLokasiFilter, activeTab, errorMode, batchFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Pipeline stats based on filtered items (follows active filters)
  const currentStats = useMemo(() => ({
    total: filteredItems.length,
    menunggu: filteredItems.filter(i => i.status === 'menunggu').length,
    diproses: filteredItems.filter(i => i.status === 'diproses').length,
    berhasil: filteredItems.filter(i => i.status === 'sukses').length,
    gagal: filteredItems.filter(i => i.status === 'gagal').length,
  }), [filteredItems]);

  // Selection helpers
  const allVisibleSelected = paginatedItems.length > 0 && paginatedItems.every(i => selectedIds.has(i.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedItems.map(i => i.id)));
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

  const selectedItems = filteredItems.filter(i => selectedIds.has(i.id));
  const eligibleStatuses: QueueItemStatus[] = ['gagal'];
  const hasEligibleSelected = selectedItems.some(i => eligibleStatuses.includes(i.status));

  const handleRetrySelected = () => {
    setRetryModalItems(selectedItems.map(i => ({ id: i.id, status: i.status })));
    setRetryModalMode('items');
    setRetryBatchId(undefined);
    setRetryModalOpen(true);
  };

  const handleRetryFromErrorDrawer = (itemId: string) => {
    const item = mockQueueItems.find(i => i.id === itemId);
    if (item) {
      setErrorDrawerOpen(false);
      setRetryModalItems([{ id: item.id, status: item.status }]);
      setRetryModalMode('items');
      setRetryBatchId(undefined);
      setRetryModalOpen(true);
    }
  };

  const handleRetrySubmit = (config: RetryConfig) => {
    toast.success('Retry triggered', {
      description: `${config.item_ids.length} item akan diproses ulang.`,
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
  };

  const handleRefresh = () => {
    toast.info('Memuat ulang data...');
  };

  const currentConfig = tabConfig[activeTab as keyof typeof tabConfig];

  const handleQuickAction = () => {
    navigate(currentConfig.navigateTo);
  };

  const handleViewItem = (item: QueueItem) => {
    setErrorDrawerItem(item);
    setErrorDrawerOpen(true);
  };

  const handleRetrySingle = (item: QueueItem) => {
    setRetryModalItems([{ id: item.id, status: item.status }]);
    setRetryModalMode('items');
    setRetryBatchId(undefined);
    setRetryModalOpen(true);
  };

  const renderTable = () => (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {errorMode && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">ID</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">Timestamp</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">Pelapor</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">Perusahaan</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">PIC Perusahaan</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">Site</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">Lokasi</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">Detail Lokasi</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={errorMode ? 12 : 11} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Search className="w-5 h-5 text-muted-foreground/50" />
                  <span>{errorMode ? 'Tidak ada item gagal pada rentang waktu ini.' : 'Tidak ada item ditemukan.'}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedItems.map((item) => (
              <TableRow
                key={item.id}
                className={`transition-colors ${selectedIds.has(item.id) ? 'bg-primary/5' : 'hover:bg-muted/20'}`}
              >
                {errorMode && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-mono text-sm font-medium text-foreground">{item.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{item.timestamp}</TableCell>
                <TableCell className="text-sm font-medium text-foreground">{item.pelapor}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.perusahaan}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.pic_perusahaan}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.site}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{item.lokasi}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{item.detail_lokasi}</TableCell>
                <TableCell>
                  <QueueStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => handleViewItem(item)}>
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              disabled={item.status !== 'gagal'}
                              onClick={() => handleRetrySingle(item)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Retry
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {item.status !== 'gagal' && (
                          <TooltipContent>Retry hanya tersedia untuk status Gagal.</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
        <span className="text-sm text-muted-foreground">
          {filteredItems.length === 0 ? '0 item' : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} dari ${filteredItems.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="h-8 w-8 p-0 text-xs"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Bot className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Agent Queue Monitoring</h1>
                <p className="text-sm text-muted-foreground">Monitoring antrian AI engine untuk pemrosesan laporan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setBatchDrawerOpen(true)} className="gap-1.5 text-muted-foreground">
                <History className="w-4 h-4" />
                Riwayat Batch
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="text-muted-foreground">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Flow */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => { setActiveTab(tab.id); clearSelection(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-foreground text-background font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === tab.id ? 'bg-background text-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}>{index + 1}</span>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
                {index < tabs.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Step Header - Title only, no subtitle */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              {activeTab === 'duplicate' && <Copy className="w-5 h-5 text-muted-foreground" />}
              {activeTab === 'form' && <ClipboardCheck className="w-5 h-5 text-muted-foreground" />}
              {activeTab === 'hazard' && <Tag className="w-5 h-5 text-muted-foreground" />}
              <h2 className="text-lg font-semibold text-foreground">{currentConfig.title}</h2>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleQuickAction} className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-xs">{currentConfig.buttonLabel}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Buka dashboard evaluator untuk review detail</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Time Window Info */}
        {activeTab === 'duplicate' && (
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Time Window: 3 jam terakhir</span>
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
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border w-fit">
              <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sedang mengeksekusi form check pada tanggal: {executionDate}</span>
            </div>
            <p className="text-xs text-muted-foreground pl-1">Hazard yang dianalisis adalah hazard yang tidak termasuk duplicate</p>
          </div>
        )}

        {activeTab === 'hazard' && (
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border w-fit">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sedang memberi label hazard pada tanggal: {executionDate}</span>
            </div>
            <p className="text-xs text-muted-foreground pl-1">Proses dilakukan setelah Form Checker selesai</p>
          </div>
        )}

        {/* Pipeline Status Cards */}
        <div className="mb-4">
          <PipelineStatusCards stats={currentStats} onStatusClick={handleStatusCardClick} activeFilter={statusFilter} />
        </div>

        {/* Filter Bar - below cards, above table */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari ID / Pelapor / PIC..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground"><Filter className="w-4 h-4" /></div>
            <Select value={perusahaanFilter} onValueChange={setPerusahaanFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Perusahaan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Perusahaan</SelectItem>
                {uniquePerusahaan.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Site" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Site</SelectItem>
                <SelectItem value="marine">MARINE</SelectItem>
                <SelectItem value="lmo">LMO</SelectItem>
                <SelectItem value="gmo">GMO</SelectItem>
                <SelectItem value="bmo 1">BMO 1</SelectItem>
                <SelectItem value="bmo 2">BMO 2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={lokasiFilter} onValueChange={setLokasiFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Lokasi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lokasi</SelectItem>
                {uniqueLokasi.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={detailLokasiFilter} onValueChange={setDetailLokasiFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Detail Lokasi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Detail Lokasi</SelectItem>
                {uniqueDetailLokasi.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
                <SelectItem value="sukses">Berhasil</SelectItem>
                <SelectItem value="gagal">Gagal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Batch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Batch</SelectItem>
                {batchTimeOptions.map(time => (
                  <SelectItem key={time} value={time}>Batch {time} WIB</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button
                variant={errorMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setErrorMode(prev => !prev)}
                className="gap-1.5 text-xs"
              >
                {errorMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                Tampilkan Error Saja
              </Button>
              {errorMode && <span className="ml-2 text-xs text-muted-foreground">Menampilkan item dengan status Gagal.</span>}
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {errorMode && someSelected && (
          <div className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-muted/50 sticky top-[73px] z-[5]">
            <span className="text-sm font-medium text-foreground">{selectedIds.size} item gagal dipilih</span>
            <div className="flex-1" />
            <Button
              size="sm"
              onClick={handleRetrySelected}
              className="gap-1.5"
            >
              Retry Terpilih
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="text-muted-foreground">
              Batal Pilih
            </Button>
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
          toast.info(`Detail batch ${batchId}`);
        }}
      />
    </div>
  );
};

export default AIDuplicateDetection;
