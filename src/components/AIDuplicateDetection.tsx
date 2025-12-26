import React, { useState } from 'react';
import { 
  Inbox, MapPin, Type, Brain, Shield, 
  Search, RefreshCw, ChevronRight, Filter
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
import QueueTab from './QueueTab';
import GeoTab from './GeoTab';
import LexicalTab from './LexicalTab';
import SemanticTab from './SemanticTab';
import FinalClusterTab from './FinalClusterTab';
import {
  queueReports,
  geoReports,
  lexicalReports,
  semanticReports,
  finalReports,
  duplicateClusters,
  auditLog,
  getStageCounts,
  StageStatus,
} from '@/data/duplicateDetectionData';

const tabs = [
  { id: 'queue', label: 'Queue', icon: Inbox, color: 'text-muted-foreground' },
  { id: 'geo', label: 'Geo', icon: MapPin, color: 'text-geo' },
  { id: 'lexical', label: 'Lexical', icon: Type, color: 'text-lexical' },
  { id: 'semantic', label: 'Semantic', icon: Brain, color: 'text-semantic' },
  { id: 'final', label: 'Final', icon: Shield, color: 'text-destructive' },
] as const;

const AIDuplicateDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');

  const stageCounts = getStageCounts();

  // Handler functions
  const handleStartAnalysis = (reportId: string) => {
    toast.success(`Analisis dimulai untuk ${reportId}`, {
      description: 'Laporan dipindahkan ke tahap Geo'
    });
    setActiveTab('geo');
  };

  const handleAdvanceToLexical = (reportId: string) => {
    toast.success(`${reportId} dilanjutkan ke Lexical`, {
      description: 'Analisis teks akan dimulai'
    });
    setActiveTab('lexical');
  };

  const handleExcludeFromCluster = (reportId: string) => {
    toast.info(`${reportId} dikeluarkan dari cluster Geo`);
  };

  const handleAdvanceToSemantic = (reportId: string) => {
    toast.success(`${reportId} dilanjutkan ke Semantic`, {
      description: 'Analisis makna dan gambar akan dimulai'
    });
    setActiveTab('semantic');
  };

  const handleMarkNotSimilar = (reportId: string) => {
    toast.info(`${reportId} ditandai tidak mirip secara teks`);
  };

  const handleSendToFinal = (reportId: string) => {
    toast.success(`${reportId} dikirim ke Final Cluster`, {
      description: 'Siap untuk keputusan akhir'
    });
    setActiveTab('final');
  };

  const handleMarkNotSameEvent = (reportId: string) => {
    toast.info(`${reportId} ditandai bukan kejadian sama`);
  };

  const handleConfirmDuplicate = (reportId: string, notes: string) => {
    toast.success('Duplicate dikonfirmasi', {
      description: notes || 'Status diperbarui ke Confirmed Duplicate'
    });
  };

  const handleMarkNonDuplicate = (reportId: string, notes: string) => {
    toast.success('Ditandai sebagai Non-Duplicate', {
      description: notes || 'Laporan dipisahkan dari cluster'
    });
  };

  const handleMergeCluster = (clusterId: string, targetClusterId: string) => {
    toast.success(`Cluster ${clusterId} digabungkan dengan ${targetClusterId}`);
  };

  const handleSplitCluster = (clusterId: string, reportIds: string[]) => {
    toast.success(`Cluster ${clusterId} dipisah`);
  };

  const handleChangeRepresentative = (clusterId: string, newRepId: string) => {
    toast.success(`Representative diubah ke ${newRepId}`);
  };

  const handleRefresh = () => {
    toast.info('Memuat ulang data...', {
      description: 'Data akan diperbarui'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AI Duplicate Detection
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {stageCounts.queue} menunggu • {stageCounts.geo + stageCounts.lexical + stageCounts.semantic} diproses • {stageCounts.final} selesai
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Info Banner */}
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">AI menganalisis kemiripan laporan</span> berdasarkan 
              <span className="text-geo font-medium"> Geo</span> → 
              <span className="text-lexical font-medium"> Lexical</span> → 
              <span className="text-semantic font-medium"> Semantic</span>. 
              Laporan mirip akan dikelompokkan sebagai duplicate.
            </p>
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
                      ? `${tab.color} bg-${tab.id === 'queue' ? 'muted' : tab.id}/10 font-medium` 
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
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {stageCounts[tab.id as keyof typeof stageCounts]}
                  </Badge>
                </button>
                {index < tabs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-border bg-card/30 sticky top-[120px] z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari ID / pelapor / lokasi / kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="non_duplicate">Non-Duplicate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Site</SelectItem>
                <SelectItem value="adaro">Site Adaro</SelectItem>
                <SelectItem value="bharinto">Site Bharinto</SelectItem>
                <SelectItem value="tutupan">Site Tutupan</SelectItem>
                <SelectItem value="wara">Site Wara</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="queue" className="mt-0">
            <QueueTab 
              reports={queueReports}
              onStartAnalysis={handleStartAnalysis}
            />
          </TabsContent>

          <TabsContent value="geo" className="mt-0">
            <GeoTab 
              reports={geoReports}
              onAdvanceToLexical={handleAdvanceToLexical}
              onExcludeFromCluster={handleExcludeFromCluster}
            />
          </TabsContent>

          <TabsContent value="lexical" className="mt-0">
            <LexicalTab 
              reports={lexicalReports}
              onAdvanceToSemantic={handleAdvanceToSemantic}
              onMarkNotSimilar={handleMarkNotSimilar}
            />
          </TabsContent>

          <TabsContent value="semantic" className="mt-0">
            <SemanticTab 
              reports={semanticReports}
              onSendToFinal={handleSendToFinal}
              onMarkNotSameEvent={handleMarkNotSameEvent}
            />
          </TabsContent>

          <TabsContent value="final" className="mt-0">
            <FinalClusterTab 
              reports={finalReports}
              clusters={duplicateClusters}
              auditLog={auditLog}
              onConfirmDuplicate={handleConfirmDuplicate}
              onMarkNonDuplicate={handleMarkNonDuplicate}
              onMergeCluster={handleMergeCluster}
              onSplitCluster={handleSplitCluster}
              onChangeRepresentative={handleChangeRepresentative}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIDuplicateDetection;
