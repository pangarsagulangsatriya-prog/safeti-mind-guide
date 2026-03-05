import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, ClipboardCheck, Tag, 
  Search, RefreshCw, ChevronRight, Clock, ChevronsLeft, ChevronsRight,
  Bot, ExternalLink, CheckCircle2,
  AlertCircle, History, ChevronLeft, Eye, EyeOff, RotateCcw, X, ArrowUpDown
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
import BatchScheduleBar, { ScheduleSlot } from './BatchScheduleBar';
import MultiSelectDropdown from './MultiSelectDropdown';

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

const SCHEDULE_SLOTS = ['07:00', '10:00', '13:00', '16:00', '19:00'];

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

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

const AIDuplicateDetection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('duplicate');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState<string[]>([]);
  const [perusahaanFilter, setPerusahaanFilter] = useState<string[]>([]);
  const [lokasiFilter, setLokasiFilter] = useState<string[]>([]);
  const [detailLokasiFilter, setDetailLokasiFilter] = useState<string[]>([]);
  const [batchFilter, setBatchFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [errorMode, setErrorMode] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [retryModalItems, setRetryModalItems] = useState<Array<{ id: string; status: QueueItemStatus }>>([]);
  const [retryModalMode, setRetryModalMode] = useState<'items' | 'batch'>('items');
  const [retryBatchId, setRetryBatchId] = useState<string | undefined>();

  const [errorDrawerOpen, setErrorDrawerOpen] = useState(false);
  const [errorDrawerItem, setErrorDrawerItem] = useState<QueueItem | null>(null);

  const [batchDrawerOpen, setBatchDrawerOpen] = useState(false);

  const executionDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // Build schedule slots from mock data
  const scheduleSlots: ScheduleSlot[] = useMemo(() => {
    return SCHEDULE_SLOTS.map(time => {
      const batch = mockBatches.find(b => b.slot_time === time);
      let status: ScheduleSlot['status'] = 'upcoming';
      if (batch) {
        if (batch.status === 'running') status = 'running';
        else status = 'done';
      }
      return {
        time,
        status,
        batchId: batch?.batch_id,
        fetched_count: batch?.fetched_count,
        success: batch?.success,
        failed: batch?.failed,
      };
    });
  }, []);


  // Unique values for filters
  const uniquePerusahaan = useMemo(() => [...new Set(mockQueueItems.map(i => i.perusahaan))], []);
  const uniqueLokasi = useMemo(() => [...new Set(mockQueueItems.map(i => i.lokasi))], []);
  const uniqueDetailLokasi = useMemo(() => [...new Set(mockQueueItems.map(i => i.detail_lokasi))], []);
  const uniqueSite = useMemo(() => [...new Set(mockQueueItems.map(i => i.site))], []);

  // Filtered data
  const filteredItems = useMemo(() => {
    return mockQueueItems.filter(item => {
      if (errorMode && item.status !== 'gagal') return false;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        item.id.toLowerCase().includes(q) ||
        item.pelapor.toLowerCase().includes(q) ||
        item.pic_perusahaan.toLowerCase().includes(q) ||
        item.lokasi.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSite = siteFilter.length === 0 || siteFilter.includes(item.site);
      const matchPerusahaan = perusahaanFilter.length === 0 || perusahaanFilter.includes(item.perusahaan);
      const matchLokasi = lokasiFilter.length === 0 || lokasiFilter.includes(item.lokasi);
      const matchDetailLokasi = detailLokasiFilter.length === 0 || detailLokasiFilter.includes(item.detail_lokasi);
      const matchBatch = batchFilter === 'all' || item.batch_id === batchFilter;
      return matchSearch && matchStatus && matchSite && matchPerusahaan && matchLokasi && matchDetailLokasi && matchBatch;
    });
  }, [searchQuery, statusFilter, siteFilter, perusahaanFilter, lokasiFilter, detailLokasiFilter, errorMode, batchFilter]);

  useEffect(() => { setCurrentPage(1); clearSelection(); }, [searchQuery, statusFilter, siteFilter, perusahaanFilter, lokasiFilter, detailLokasiFilter, activeTab, errorMode, batchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const currentStats = useMemo(() => ({
    total: filteredItems.length,
    menunggu: filteredItems.filter(i => i.status === 'menunggu').length,
    diproses: filteredItems.filter(i => i.status === 'diproses').length,
    berhasil: filteredItems.filter(i => i.status === 'sukses').length,
    gagal: filteredItems.filter(i => i.status === 'gagal').length,
  }), [filteredItems]);

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

  const handleSlotClick = (slot: ScheduleSlot) => {
    if (slot.batchId) {
      setBatchFilter(slot.batchId);
    } else {
      // Upcoming/no data — set a filter that won't match anything
      setBatchFilter(`no-batch-${slot.time}`);
      toast.info(`Belum ada data batch untuk slot ${slot.time} WIB`, {
        description: 'Batch ini belum dieksekusi hari ini.',
      });
    }
  };

  // Build meaningful batch dropdown options
  const batchDropdownOptions = useMemo(() => {
    return SCHEDULE_SLOTS.map(time => {
      const batch = mockBatches.find(b => b.slot_time === time);
      const statusLabel = batch ? 
        (batch.status === 'running' ? '🔄' : batch.status === 'completed' ? '✅' : batch.status === 'partial' ? '⚠️' : '❌') 
        : '⏳';
      return {
        value: batch ? batch.batch_id : `no-batch-${time}`,
        label: `${statusLabel} ${time} WIB`,
      };
    });
  }, []);

  // Pagination helpers
  const paginationRange = useMemo(() => {
    const range: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (currentPage > 3) range.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) range.push(i);
      if (currentPage < totalPages - 2) range.push('ellipsis');
      range.push(totalPages);
    }
    return range;
  }, [totalPages, currentPage]);

  const headerCellClass = "font-medium text-muted-foreground text-[11px] uppercase tracking-wider py-3 px-3 bg-muted/50 border-b border-border sticky top-0 z-[1]";
  const cellClass = "py-2.5 px-3 text-[13px] border-b border-border/40";

  const TruncatedCell = ({ text, maxW = 'max-w-[140px]' }: { text: string; maxW?: string }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`block truncate ${maxW}`}>{text}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px] text-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderTable = () => (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {errorMode && (
                <TableHead className={`${headerCellClass} w-10`}>
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead className={`${headerCellClass} min-w-[90px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">ID <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[110px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">Waktu <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[120px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">Pelapor <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[130px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">Perusahaan <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[120px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">PIC <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[70px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">Site <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[130px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">Lokasi <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[130px]`}>
                <span className="inline-flex items-center gap-1 group cursor-default">Detail Lokasi <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" /></span>
              </TableHead>
              <TableHead className={`${headerCellClass} min-w-[100px]`}>Status</TableHead>
              <TableHead className={`${headerCellClass} min-w-[120px] text-right`}>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={errorMode ? 11 : 10} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {errorMode ? 'Tidak ada item gagal.' : 'Tidak ada data untuk filter ini.'}
                      </p>
                      <p className="text-xs text-muted-foreground/60">Coba ubah atau reset filter untuk melihat data lain.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs mt-1"
                      onClick={() => {
                        setPerusahaanFilter([]); setSiteFilter([]); setLokasiFilter([]); setDetailLokasiFilter([]);
                        setStatusFilter('all'); setBatchFilter('all'); setErrorMode(false); setSearchQuery('');
                      }}
                    >
                      Reset Filter
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item, idx) => (
                <TableRow
                  key={item.id}
                  className={`transition-colors ${
                    selectedIds.has(item.id)
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : idx % 2 === 1
                        ? 'bg-muted/[0.03] hover:bg-muted/30'
                        : 'hover:bg-muted/30'
                  }`}
                >
                  {errorMode && (
                    <TableCell className={cellClass}>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className={`${cellClass} font-mono text-xs font-semibold text-foreground`}>{item.id}</TableCell>
                  <TableCell className={`${cellClass} text-muted-foreground whitespace-nowrap text-xs`}>{item.timestamp}</TableCell>
                  <TableCell className={`${cellClass} font-medium text-foreground text-xs`}>{item.pelapor}</TableCell>
                  <TableCell className={`${cellClass} text-muted-foreground text-xs`}>
                    <TruncatedCell text={item.perusahaan} maxW="max-w-[130px]" />
                  </TableCell>
                  <TableCell className={`${cellClass} text-muted-foreground text-xs`}>
                    <TruncatedCell text={item.pic_perusahaan} maxW="max-w-[120px]" />
                  </TableCell>
                  <TableCell className={`${cellClass} text-muted-foreground text-xs font-medium`}>{item.site}</TableCell>
                  <TableCell className={`${cellClass} text-muted-foreground text-xs`}>
                    <TruncatedCell text={item.lokasi} />
                  </TableCell>
                  <TableCell className={`${cellClass} text-muted-foreground text-xs`}>
                    <TruncatedCell text={item.detail_lokasi} />
                  </TableCell>
                  <TableCell className={cellClass}>
                    <QueueStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className={`${cellClass} text-right`}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewItem(item)}
                        className="inline-flex items-center gap-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </button>
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
                                <RotateCcw className="w-3 h-3" />
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
      </div>

      {/* Pagination */}
      <div className="px-4 py-2.5 border-t border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {filteredItems.length === 0
              ? '0 item'
              : `Menampilkan ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredItems.length)} dari ${filteredItems.length}`}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground/60">Per halaman:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="h-7 w-[60px] text-xs border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map(n => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)} className="h-7 w-7 p-0">
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="h-7 w-7 p-0">
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          {paginationRange.map((item, i) =>
            item === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground/40">…</span>
            ) : (
              <Button
                key={item}
                variant={item === currentPage ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage(item as number)}
                className="h-7 w-7 p-0 text-xs"
              >
                {item}
              </Button>
            )
          )}
          <Button variant="ghost" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-7 w-7 p-0">
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} className="h-7 w-7 p-0">
            <ChevronsRight className="w-3.5 h-3.5" />
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
        {/* Step Header */}
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

        {/* Jadwal Batch - TOP of content area */}
        {activeTab === 'duplicate' && (
          <div className="mb-4 rounded-lg border border-border bg-card p-3.5">
            <BatchScheduleBar
              slots={scheduleSlots}
              onSlotClick={handleSlotClick}
              activeSlot={batchFilter !== 'all' ? scheduleSlots.find(s => s.batchId === batchFilter || `no-batch-${s.time}` === batchFilter)?.time : undefined}
            />
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

        {/* Filter Bar */}
        <div className="mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search — dominant */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                placeholder="Cari ID / Pelapor / PIC / Lokasi…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>

            {/* Multi-select: Perusahaan */}
            <MultiSelectDropdown
              label="Perusahaan"
              options={uniquePerusahaan}
              selected={perusahaanFilter}
              onChange={setPerusahaanFilter}
            />

            {/* Multi-select: Site */}
            <MultiSelectDropdown
              label="Site"
              options={uniqueSite}
              selected={siteFilter}
              onChange={setSiteFilter}
            />

            {/* Multi-select: Lokasi */}
            <MultiSelectDropdown
              label="Lokasi"
              options={uniqueLokasi}
              selected={lokasiFilter}
              onChange={setLokasiFilter}
            />

            {/* Multi-select: Detail Lokasi */}
            <MultiSelectDropdown
              label="Detail Lokasi"
              options={uniqueDetailLokasi}
              selected={detailLokasiFilter}
              onChange={setDetailLokasiFilter}
            />

            {/* Single-select: Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-auto min-w-[130px] h-9 text-sm gap-1.5">
                <SelectValue>
                  {statusFilter === 'all' ? 'Status: Semua' : `Status: ${statusDisplayConfig[statusFilter as QueueItemStatus]?.label || statusFilter}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
                <SelectItem value="sukses">Berhasil</SelectItem>
                <SelectItem value="gagal">Gagal</SelectItem>
              </SelectContent>
            </Select>

            {/* Single-select: Batch */}
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-auto min-w-[140px] h-9 text-sm gap-1.5">
                <SelectValue>
                  {batchFilter === 'all' ? 'Batch: Semua' : `Batch: ${batchDropdownOptions.find(o => o.value === batchFilter)?.label || batchFilter}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {batchDropdownOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gagal Toggle */}
            <button
              onClick={() => setErrorMode(prev => !prev)}
              className={`ml-auto inline-flex items-center gap-2 h-9 px-3.5 rounded-md border text-sm font-medium transition-all whitespace-nowrap ${
                errorMode
                  ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15'
                  : 'bg-background text-muted-foreground border-input hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {errorMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Gagal
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(() => {
          const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
          if (perusahaanFilter.length > 0) activeFilters.push({ key: 'perusahaan', label: `Perusahaan: ${perusahaanFilter.length} dipilih`, onClear: () => setPerusahaanFilter([]) });
          if (siteFilter.length > 0) activeFilters.push({ key: 'site', label: `Site: ${siteFilter.length} dipilih`, onClear: () => setSiteFilter([]) });
          if (lokasiFilter.length > 0) activeFilters.push({ key: 'lokasi', label: `Lokasi: ${lokasiFilter.length} dipilih`, onClear: () => setLokasiFilter([]) });
          if (detailLokasiFilter.length > 0) activeFilters.push({ key: 'detail', label: `Detail Lokasi: ${detailLokasiFilter.length} dipilih`, onClear: () => setDetailLokasiFilter([]) });
          if (statusFilter !== 'all') activeFilters.push({ key: 'status', label: `Status: ${statusDisplayConfig[statusFilter as QueueItemStatus]?.label || statusFilter}`, onClear: () => setStatusFilter('all') });
          if (batchFilter !== 'all') {
            const bOpt = batchDropdownOptions.find(o => o.value === batchFilter);
            activeFilters.push({ key: 'batch', label: `Batch: ${bOpt?.label || batchFilter}`, onClear: () => setBatchFilter('all') });
          }
          if (errorMode) activeFilters.push({ key: 'error', label: 'Mode: Gagal', onClear: () => setErrorMode(false) });
          if (searchQuery) activeFilters.push({ key: 'search', label: `Pencarian: "${searchQuery}"`, onClear: () => setSearchQuery('') });

          if (activeFilters.length === 0) return null;

          const resetAll = () => {
            setPerusahaanFilter([]); setSiteFilter([]); setLokasiFilter([]); setDetailLokasiFilter([]);
            setStatusFilter('all'); setBatchFilter('all'); setErrorMode(false); setSearchQuery('');
          };

          return (
            <div className="mb-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mr-1">Filter aktif</span>
              {activeFilters.map(f => (
                <span key={f.key} className="inline-flex items-center gap-1 h-6 pl-2.5 pr-1 rounded-full bg-muted/80 border border-border/60 text-xs text-foreground">
                  {f.label}
                  <button onClick={f.onClear} className="ml-0.5 p-0.5 rounded-full hover:bg-foreground/10 transition-colors">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </span>
              ))}
              <button onClick={resetAll} className="ml-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                Reset Filter ({activeFilters.length})
              </button>
            </div>
          );
        })()}

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
