import { useState } from "react";
import { X, FileText, Layers, Code, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChunkData {
  id: string;
  text: string;
  page: number;
  similarity: number;
}

interface CitationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  citationTitle: string;
  citationContent: string;
  type: 'TBC' | 'PSPP' | 'GR';
}

// Dummy document pages for preview
const dummyDocumentPages = [
  {
    page: 1,
    title: "Daftar Isi",
    content: `DAFTAR ISI

1. Pendahuluan .................................................. 3
2. Definisi dan Istilah ........................................ 5
3. Prosedur Keselamatan Kerja ......................... 7
4. Pelanggaran dan Sanksi ................................ 12
5. Tata Cara Pelaporan ..................................... 18
6. Lampiran ....................................................... 22`
  },
  {
    page: 2,
    title: "Pendahuluan",
    content: `1. PENDAHULUAN

1.1 Latar Belakang
Dokumen ini merupakan pedoman standar keselamatan kerja yang wajib dipatuhi oleh seluruh karyawan dan kontraktor yang bekerja di area operasional.

1.2 Tujuan
- Menetapkan standar keselamatan yang jelas
- Mencegah kecelakaan kerja
- Melindungi aset perusahaan
- Memastikan kepatuhan terhadap regulasi

1.3 Ruang Lingkup
Pedoman ini berlaku untuk seluruh aktivitas operasional di semua site yang dikelola perusahaan.`
  },
  {
    page: 3,
    title: "Prosedur Keselamatan",
    content: `3. PROSEDUR KESELAMATAN KERJA

3.1 Penggunaan APD
Setiap pekerja WAJIB menggunakan Alat Pelindung Diri (APD) yang sesuai dengan jenis pekerjaan yang dilakukan.

APD Wajib:
• Helm safety (safety helmet)
• Sepatu safety (safety shoes)
• Rompi keselamatan (safety vest)
• Kacamata safety (untuk area berdebu)
• Sarung tangan (untuk pekerjaan mekanik)

3.2 Pengoperasian Kendaraan
Semua operator kendaraan harus memiliki SIM yang valid dan telah mengikuti pelatihan keselamatan berkendara.`
  }
];

// Dummy chunks for retrieval visualization
const dummyChunks: ChunkData[] = [
  {
    id: "chunk_001",
    text: "Setiap pekerja WAJIB menggunakan Alat Pelindung Diri (APD) yang sesuai dengan jenis pekerjaan yang dilakukan. APD Wajib meliputi: Helm safety, Sepatu safety, Rompi keselamatan, Kacamata safety untuk area berdebu, dan Sarung tangan untuk pekerjaan mekanik.",
    page: 3,
    similarity: 0.95
  },
  {
    id: "chunk_002",
    text: "Pelanggaran terhadap prosedur keselamatan dapat dikenakan sanksi sesuai tingkat keparahan: Tingkat 1 (Peringatan lisan), Tingkat 2 (Peringatan tertulis), Tingkat 3 (Skorsing), Tingkat 4 (Pemutusan hubungan kerja).",
    page: 4,
    similarity: 0.87
  },
  {
    id: "chunk_003",
    text: "Semua temuan keselamatan harus dilaporkan dalam waktu 24 jam melalui sistem BEATS Hazard Reporting. Penundaan pelaporan dapat mengakibatkan eskalasi risiko dan sanksi administratif.",
    page: 5,
    similarity: 0.82
  }
];

// Dummy raw retrieval output
const dummyRawOutput = {
  query: "Pekerja tidak menggunakan helm saat berada di area konstruksi",
  retrieval_timestamp: "2025-12-04T10:23:45.123Z",
  model: "text-embedding-3-small",
  top_k: 3,
  results: [
    {
      chunk_id: "chunk_001",
      document: "SOP-SAFETY-2024.pdf",
      page: 3,
      score: 0.9523,
      metadata: {
        section: "3.1 Penggunaan APD",
        last_updated: "2024-06-15"
      }
    },
    {
      chunk_id: "chunk_002", 
      document: "PSPP-2024.pdf",
      page: 4,
      score: 0.8745,
      metadata: {
        section: "4. Pelanggaran dan Sanksi",
        last_updated: "2024-08-20"
      }
    },
    {
      chunk_id: "chunk_003",
      document: "SOP-REPORTING-2024.pdf",
      page: 5,
      score: 0.8234,
      metadata: {
        section: "5. Tata Cara Pelaporan",
        last_updated: "2024-07-10"
      }
    }
  ],
  processing_time_ms: 245
};

const labelConfig = {
  TBC: { bg: "bg-emerald-500", text: "text-white" },
  PSPP: { bg: "bg-amber-500", text: "text-white" },
  GR: { bg: "bg-slate-600", text: "text-white" }
};

const CitationPanel = ({ 
  isOpen, 
  onClose, 
  documentName, 
  citationTitle, 
  citationContent,
  type 
}: CitationPanelProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const config = labelConfig[type];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative ml-auto w-full max-w-3xl bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                  {type}
                </span>
                <h2 className="font-semibold text-foreground text-sm">Rujukan Dokumen</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{documentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="document" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-4 grid grid-cols-3 h-10">
            <TabsTrigger value="document" className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4" />
              Dokumen
            </TabsTrigger>
            <TabsTrigger value="chunks" className="flex items-center gap-2 text-xs">
              <Layers className="w-4 h-4" />
              Chunks
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2 text-xs">
              <Code className="w-4 h-4" />
              Raw Output
            </TabsTrigger>
          </TabsList>

          {/* Document View Tab */}
          <TabsContent value="document" className="flex-1 overflow-hidden m-0 p-4">
            <div className="h-full flex flex-col bg-muted/30 rounded-lg border border-border overflow-hidden">
              {/* Document Navigation */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
                <span className="text-xs text-muted-foreground">
                  Halaman {currentPage + 1} dari {dummyDocumentPages.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(dummyDocumentPages.length - 1, p + 1))}
                    disabled={currentPage === dummyDocumentPages.length - 1}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <div className="bg-background rounded-lg shadow-sm border border-border p-8 min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      {dummyDocumentPages[currentPage].title}
                    </h3>
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {dummyDocumentPages[currentPage].content}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Chunks Tab */}
          <TabsContent value="chunks" className="flex-1 overflow-hidden m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground mb-3">
                  Menampilkan {dummyChunks.length} chunk yang paling relevan
                </div>
                {dummyChunks.map((chunk, index) => (
                  <div 
                    key={chunk.id}
                    className="bg-muted/30 rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Chunk #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Halaman {chunk.page}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Similarity:</span>
                        <span className={`text-xs font-semibold ${
                          chunk.similarity >= 0.9 ? 'text-success' : 
                          chunk.similarity >= 0.8 ? 'text-warning' : 'text-muted-foreground'
                        }`}>
                          {(chunk.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Raw Output Tab */}
          <TabsContent value="raw" className="flex-1 overflow-hidden m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  Raw retrieval output untuk debugging dan traceability
                </div>
                
                {/* Query Info */}
                <div className="bg-muted/30 rounded-lg border border-border p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Query
                  </h4>
                  <p className="text-sm text-foreground bg-background rounded p-2 border border-border">
                    "{dummyRawOutput.query}"
                  </p>
                </div>

                {/* Retrieval Metadata */}
                <div className="bg-muted/30 rounded-lg border border-border p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="text-foreground font-mono">{dummyRawOutput.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top K:</span>
                      <span className="text-foreground font-mono">{dummyRawOutput.top_k}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span className="text-foreground font-mono">{dummyRawOutput.processing_time_ms}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span className="text-foreground font-mono text-[10px]">
                        {new Date(dummyRawOutput.retrieval_timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Raw JSON */}
                <div className="bg-muted/30 rounded-lg border border-border p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Raw JSON Response
                  </h4>
                  <pre className="text-xs text-foreground bg-background rounded p-3 border border-border overflow-x-auto font-mono leading-relaxed">
{JSON.stringify(dummyRawOutput, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CitationPanel;
