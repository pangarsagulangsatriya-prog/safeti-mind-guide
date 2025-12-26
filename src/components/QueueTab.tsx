import React from 'react';
import { Play, Clock, MapPin, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DuplicateReport } from '@/data/duplicateDetectionData';
import { formatDate } from '@/lib/utils';

interface QueueTabProps {
  reports: DuplicateReport[];
  onStartAnalysis: (reportId: string) => void;
}

const QueueTab: React.FC<QueueTabProps> = ({ reports, onStartAnalysis }) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Belum ada laporan baru dalam antrian
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Laporan baru akan muncul di sini untuk dianalisis oleh sistem AI Duplicate Detection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Antrian Laporan Baru</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Laporan di sini belum dianalisis. Klik "Mulai Analisis" untuk memulai pipeline Geo → Lexical → Semantic.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead className="w-[160px]">Timestamp</TableHead>
              <TableHead>Pelapor</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow 
                key={report.report_id}
                className="hover:bg-muted/20 transition-colors"
              >
                <TableCell className="font-mono text-sm font-medium">
                  {report.report_id}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(report.timestamp)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{report.reporter}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{report.site}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{report.lokasi}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className="bg-muted/50 text-muted-foreground border-muted-foreground/30"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Menunggu
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onStartAnalysis(report.report_id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Mulai Analisis
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground text-center py-2">
        {reports.length} laporan menunggu analisis
      </div>
    </div>
  );
};

export default QueueTab;
