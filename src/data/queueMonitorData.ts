// Queue Monitor Data Model with retry mechanism support

export type QueueItemStatus = 'menunggu' | 'diproses' | 'sukses' | 'gagal';

export interface QueueItem {
  id: string;
  timestamp: string;
  pelapor: string;
  perusahaan: string;
  pic_perusahaan: string;
  site: string;
  lokasi: string;
  detail_lokasi: string;
  geoCheck: boolean;
  textCheck: boolean;
  semanticCheck: boolean;
  status: QueueItemStatus;
  duplicateScore: number;
  duplicateStatus: string | null;
  // Retry metadata
  attempt_count: number;
  last_attempt_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  next_retry_at: string | null;
  batch_id: string;
  processing_started_at: string | null;
  // Date key for filtering
  date_key: string; // e.g. '2026-03-06'
}

export interface BatchRecord {
  batch_id: string;
  slot_time: string;
  window_start: string;
  window_end: string;
  triggered_at: string;
  triggered_by: 'system' | 'manual';
  status: 'completed' | 'partial' | 'failed' | 'running';
  total: number;
  success: number;
  failed: number;
  needs_check: number;
  stuck: number;
  duration: string;
  start_at: string;
  end_at: string | null;
  duration_seconds: number;
  fetched_count: number;
  date_key: string;
}

export interface AttemptRecord {
  attempt_number: number;
  timestamp: string;
  result: 'success' | 'failed' | 'timeout' | 'error';
  error_code?: string;
  error_message?: string;
  processing_stage?: string;
  duration?: string;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: 'retry_item' | 'retry_batch' | 'retry_selected' | 'mark_needs_check' | 'force_retry';
  timestamp: string;
  item_count: number;
  reason_code: string;
  reason_note: string;
  result: 'triggered' | 'completed' | 'failed';
  item_ids: string[];
  batch_id?: string;
}

// Status display config
export const statusDisplayConfig: Record<QueueItemStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  retryEligible: boolean;
}> = {
  menunggu: {
    label: 'Menunggu',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    description: 'Belum masuk proses',
    retryEligible: false,
  },
  diproses: {
    label: 'Diproses',
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    description: 'Sedang berjalan',
    retryEligible: false,
  },
  sukses: {
    label: 'Sukses',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    description: 'Siap dievaluasi',
    retryEligible: false,
  },
  gagal: {
    label: 'Gagal',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    description: 'Retry tersedia',
    retryEligible: true,
  },
};

// Helper to generate items for a specific date
function generateDayItems(dateStr: string, dateLabel: string, batchDateId: string): { items: QueueItem[]; batches: BatchRecord[] } {
  const pelapors = ['AGUS WIJAYA', 'DEDI KURNIAWAN', 'FIRMAN', 'SUWARNO', 'IRFAN NUR RIZAL', 'ABDAN SYEKURA', 'INDRA WIRA PRANATA', 'RIZKY MAULANA', 'HENDRA GUNAWAN', 'WAHYU SETIAWAN', 'BAMBANG SUSILO', 'YUSUF PRATAMA', 'ARIF HIDAYAT', 'RUDI HARTANTO', 'TONY WIJAYA'];
  const perusahaans = ['PT Pamapersada', 'PT BUMA', 'PT Pelayaran Nasional', 'PT Thiess', 'PT SIS'];
  const pics = ['Cahyo Wibowo', 'Andi Santoso', 'Budi Hartono', 'Dimas Prasetyo', 'Eko Saputra'];
  const sites = ['GMO', 'LMO', 'MARINE', 'BMO 1', 'BMO 2'];
  const lokasis = ['Pit 3 Section A', 'Hauling Road KM 5', 'Towing Tug', 'Workshop Bigshop BUMA', 'Crusher 01 dan BLC', 'Fuel Station', '(B8) Pit J', 'Workshop Mekanik', 'Disposal Area North', 'Jetty Batubara', 'Pit 5 Section C', 'Dewatering Pond', 'Pit 2 East', 'Stockpile ROM', 'Workshop Elektrikal'];
  const details = ['Bench 420 Sisi Barat', 'Persimpangan Jalan Utama', 'Dermaga B-3', 'Gedung Utama Lt. 2', 'Area Crushing Plant Utara', 'Tangki Solar Utama', 'Front Loading Area', 'Bay 3 Heavy Equipment', 'Bench 380', 'Conveyor Belt Section 2', 'Ramp Utara KM 2', 'Pompa Station 4', 'Bench 340 Sisi Timur', 'Area Penumpukan Barat', 'Panel Room Utama'];

  const slots = ['07:00', '10:00', '13:00', '16:00', '19:00'];
  const items: QueueItem[] = [];
  const batches: BatchRecord[] = [];

  slots.forEach((slot, slotIdx) => {
    const batchId = `DM-${batchDateId}-${slot.replace(':', '')}`;
    const count = 10 + Math.floor(Math.random() * 8); // 10-17 items per batch
    const batchItems: QueueItem[] = [];

    for (let i = 0; i < count; i++) {
      const pIdx = (slotIdx * 3 + i) % pelapors.length;
      const cIdx = (slotIdx + i) % perusahaans.length;
      const sIdx = (slotIdx + i) % sites.length;
      const hour = parseInt(slot.split(':')[0]);
      const minute = (i % 10).toString().padStart(2, '0');
      const statuses: QueueItemStatus[] = ['sukses', 'sukses', 'sukses', 'sukses', 'sukses', 'sukses', 'sukses', 'gagal'];
      const status = statuses[i % statuses.length];
      const id = `${batchDateId.slice(2)}${(slotIdx * 100 + i + 1).toString().padStart(3, '0')}`;

      batchItems.push({
        id,
        timestamp: `${dateLabel}, ${hour.toString().padStart(2, '0')}:${minute}`,
        pelapor: pelapors[pIdx],
        perusahaan: perusahaans[cIdx],
        pic_perusahaan: pics[cIdx],
        site: sites[sIdx],
        lokasi: lokasis[(slotIdx + i) % lokasis.length],
        detail_lokasi: details[(slotIdx + i) % details.length],
        geoCheck: true,
        textCheck: status !== 'gagal',
        semanticCheck: status === 'sukses',
        status,
        duplicateScore: status === 'sukses' ? 20 + Math.floor(Math.random() * 70) : 0,
        duplicateStatus: status === 'sukses' ? (Math.random() > 0.7 ? 'Potential Duplicate' : 'Non-Duplicate') : null,
        attempt_count: status === 'gagal' ? 1 + Math.floor(Math.random() * 2) : 1,
        last_attempt_at: `${dateStr}T${hour.toString().padStart(2, '0')}:${minute}:00Z`,
        last_error_code: status === 'gagal' ? 'TIMEOUT' : null,
        last_error_message: status === 'gagal' ? 'Processing timed out.' : null,
        next_retry_at: null,
        batch_id: batchId,
        processing_started_at: `${dateStr}T${hour.toString().padStart(2, '0')}:${minute}:00Z`,
        date_key: dateStr,
      });
    }

    items.push(...batchItems);
    const successCount = batchItems.filter(i => i.status === 'sukses').length;
    const failedCount = batchItems.filter(i => i.status === 'gagal').length;
    const slotHour = parseInt(slot.split(':')[0]);

    batches.push({
      batch_id: batchId,
      slot_time: slot,
      window_start: `${dateStr}T${slotHour.toString().padStart(2, '0')}:00:00Z`,
      window_end: `${dateStr}T${(slotHour + 3).toString().padStart(2, '0')}:00:00Z`,
      triggered_at: `${dateStr}T${slotHour.toString().padStart(2, '0')}:00:05Z`,
      triggered_by: 'system',
      status: 'completed',
      total: count,
      success: successCount,
      failed: failedCount,
      needs_check: 0,
      stuck: 0,
      duration: `${8 + Math.floor(Math.random() * 7)}m ${Math.floor(Math.random() * 59)}s`,
      start_at: `${dateStr}T${slotHour.toString().padStart(2, '0')}:00:05Z`,
      end_at: `${dateStr}T${slotHour.toString().padStart(2, '0')}:${(12 + Math.floor(Math.random() * 8)).toString().padStart(2, '0')}:00Z`,
      duration_seconds: 480 + Math.floor(Math.random() * 420),
      fetched_count: count,
      date_key: dateStr,
    });
  });

  return { items, batches };
}

// Today's data (2026-03-06) - kept manually for precise control
const batch0700Items: QueueItem[] = [
  { id: '8060401', timestamp: '06 Mar, 07:02', pelapor: 'AGUS WIJAYA', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Pit 3 Section A', detail_lokasi: 'Bench 420 Sisi Barat', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 92, duplicateStatus: 'Potential Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:05:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:02:00Z', date_key: '2026-03-06' },
  { id: '8060402', timestamp: '06 Mar, 07:02', pelapor: 'DEDI KURNIAWAN', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Hauling Road KM 5', detail_lokasi: 'Persimpangan Jalan Utama', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 45, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:04:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:02:30Z', date_key: '2026-03-06' },
  { id: '8060403', timestamp: '06 Mar, 07:03', pelapor: 'FIRMAN', perusahaan: 'PT Pelayaran Nasional', pic_perusahaan: 'Budi Hartono', site: 'MARINE', lokasi: 'Towing Tug', detail_lokasi: 'Dermaga B-3', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 20, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:05:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:03:00Z', date_key: '2026-03-06' },
  { id: '8060404', timestamp: '06 Mar, 07:03', pelapor: 'SUWARNO', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Workshop Bigshop BUMA', detail_lokasi: 'Gedung Utama Lt. 2', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 88, duplicateStatus: 'Potential Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:06:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:03:30Z', date_key: '2026-03-06' },
  { id: '8060405', timestamp: '06 Mar, 07:04', pelapor: 'IRFAN NUR RIZAL', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Crusher 01 dan BLC', detail_lokasi: 'Area Crushing Plant Utara', geoCheck: true, textCheck: true, semanticCheck: false, status: 'gagal', duplicateScore: 0, duplicateStatus: null, attempt_count: 2, last_attempt_at: '2026-03-06T00:08:00Z', last_error_code: 'TIMEOUT', last_error_message: 'Semantic analysis timed out after 300s.', next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:04:00Z', date_key: '2026-03-06' },
  { id: '8060406', timestamp: '06 Mar, 07:04', pelapor: 'ABDAN SYEKURA', perusahaan: 'PT Thiess', pic_perusahaan: 'Dimas Prasetyo', site: 'BMO 1', lokasi: 'Fuel Station', detail_lokasi: 'Tangki Solar Utama', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 55, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:06:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:04:30Z', date_key: '2026-03-06' },
  { id: '8060407', timestamp: '06 Mar, 07:05', pelapor: 'INDRA WIRA PRANATA', perusahaan: 'PT SIS', pic_perusahaan: 'Eko Saputra', site: 'BMO 2', lokasi: '(B8) Pit J', detail_lokasi: 'Front Loading Area', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 72, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:07:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:05:00Z', date_key: '2026-03-06' },
  { id: '8060408', timestamp: '06 Mar, 07:05', pelapor: 'RIZKY MAULANA', perusahaan: 'PT Thiess', pic_perusahaan: 'Dimas Prasetyo', site: 'BMO 1', lokasi: 'Workshop Mekanik', detail_lokasi: 'Bay 3 Heavy Equipment', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 30, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:07:30Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:05:30Z', date_key: '2026-03-06' },
  { id: '8060409', timestamp: '06 Mar, 07:06', pelapor: 'HENDRA GUNAWAN', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Disposal Area North', detail_lokasi: 'Bench 380', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 15, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:08:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:06:00Z', date_key: '2026-03-06' },
  { id: '8060410', timestamp: '06 Mar, 07:06', pelapor: 'WAHYU SETIAWAN', perusahaan: 'PT Pelayaran Nasional', pic_perusahaan: 'Budi Hartono', site: 'MARINE', lokasi: 'Jetty Batubara', detail_lokasi: 'Conveyor Belt Section 2', geoCheck: true, textCheck: false, semanticCheck: false, status: 'gagal', duplicateScore: 0, duplicateStatus: null, attempt_count: 1, last_attempt_at: '2026-03-06T00:09:00Z', last_error_code: 'DATA_INVALID', last_error_message: 'Field "lokasi" parsing failed.', next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:06:30Z', date_key: '2026-03-06' },
  { id: '8060411', timestamp: '06 Mar, 07:07', pelapor: 'BAMBANG SUSILO', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Pit 5 Section C', detail_lokasi: 'Ramp Utara KM 2', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 67, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:09:30Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:07:00Z', date_key: '2026-03-06' },
  { id: '8060412', timestamp: '06 Mar, 07:07', pelapor: 'YUSUF PRATAMA', perusahaan: 'PT SIS', pic_perusahaan: 'Eko Saputra', site: 'BMO 2', lokasi: 'Dewatering Pond', detail_lokasi: 'Pompa Station 4', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 40, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:10:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:07:30Z', date_key: '2026-03-06' },
  { id: '8060413', timestamp: '06 Mar, 07:08', pelapor: 'ARIF HIDAYAT', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Pit 2 East', detail_lokasi: 'Bench 340 Sisi Timur', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 78, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:10:30Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:08:00Z', date_key: '2026-03-06' },
  { id: '8060414', timestamp: '06 Mar, 07:09', pelapor: 'RUDI HARTANTO', perusahaan: 'PT Thiess', pic_perusahaan: 'Dimas Prasetyo', site: 'BMO 1', lokasi: 'Stockpile ROM', detail_lokasi: 'Area Penumpukan Barat', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 51, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:11:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:09:00Z', date_key: '2026-03-06' },
  { id: '8060415', timestamp: '06 Mar, 07:10', pelapor: 'TONY WIJAYA', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Workshop Elektrikal', detail_lokasi: 'Panel Room Utama', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 25, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T00:12:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-0700', processing_started_at: '2026-03-06T00:10:00Z', date_key: '2026-03-06' },
];

const batch1000Items: QueueItem[] = [
  { id: '8060501', timestamp: '06 Mar, 10:01', pelapor: 'SUWARNO', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Workshop Bigshop BUMA', detail_lokasi: 'Gedung Utama Lt. 2', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 85, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T03:05:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:01:00Z', date_key: '2026-03-06' },
  { id: '8060502', timestamp: '06 Mar, 10:01', pelapor: 'FIRMAN', perusahaan: 'PT Pelayaran Nasional', pic_perusahaan: 'Budi Hartono', site: 'MARINE', lokasi: 'Towing Tug', detail_lokasi: 'Dermaga B-3', geoCheck: true, textCheck: true, semanticCheck: true, status: 'diproses', duplicateScore: 35, duplicateStatus: null, attempt_count: 1, last_attempt_at: '2026-03-06T03:04:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:04:00Z', date_key: '2026-03-06' },
  { id: '8060503', timestamp: '06 Mar, 10:02', pelapor: 'IRFAN NUR RIZAL', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Crusher 01 dan BLC', detail_lokasi: 'Area Crushing Plant Utara', geoCheck: true, textCheck: true, semanticCheck: false, status: 'gagal', duplicateScore: 0, duplicateStatus: null, attempt_count: 2, last_attempt_at: '2026-03-06T03:06:00Z', last_error_code: 'TIMEOUT', last_error_message: 'Semantic analysis timed out after 300s.', next_retry_at: '2026-03-06T04:00:00Z', batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:02:00Z', date_key: '2026-03-06' },
  { id: '8060504', timestamp: '06 Mar, 10:02', pelapor: 'ABDAN SYEKURA', perusahaan: 'PT Thiess', pic_perusahaan: 'Dimas Prasetyo', site: 'BMO 1', lokasi: 'Fuel Station', detail_lokasi: 'Tangki Solar Utama', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 90, duplicateStatus: 'Potential Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T03:06:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:02:30Z', date_key: '2026-03-06' },
  { id: '8060505', timestamp: '06 Mar, 10:03', pelapor: 'INDRA WIRA PRANATA', perusahaan: 'PT SIS', pic_perusahaan: 'Eko Saputra', site: 'BMO 2', lokasi: '(B8) Pit J', detail_lokasi: 'Front Loading Area', geoCheck: true, textCheck: false, semanticCheck: false, status: 'gagal', duplicateScore: 0, duplicateStatus: null, attempt_count: 1, last_attempt_at: '2026-03-06T03:05:00Z', last_error_code: 'PROCESSING_TIMEOUT', last_error_message: 'Processing exceeded 15 minute threshold.', next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:03:00Z', date_key: '2026-03-06' },
  { id: '8060506', timestamp: '06 Mar, 10:03', pelapor: 'HENDRA GUNAWAN', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Disposal Area North', detail_lokasi: 'Bench 380', geoCheck: true, textCheck: true, semanticCheck: true, status: 'menunggu', duplicateScore: 0, duplicateStatus: null, attempt_count: 0, last_attempt_at: null, last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: null, date_key: '2026-03-06' },
  { id: '8060507', timestamp: '06 Mar, 10:04', pelapor: 'WAHYU SETIAWAN', perusahaan: 'PT Pelayaran Nasional', pic_perusahaan: 'Budi Hartono', site: 'MARINE', lokasi: 'Jetty Batubara', detail_lokasi: 'Conveyor Belt Section 2', geoCheck: true, textCheck: true, semanticCheck: true, status: 'diproses', duplicateScore: 50, duplicateStatus: null, attempt_count: 1, last_attempt_at: '2026-03-06T03:07:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:07:00Z', date_key: '2026-03-06' },
  { id: '8060508', timestamp: '06 Mar, 10:04', pelapor: 'BAMBANG SUSILO', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Pit 5 Section C', detail_lokasi: 'Ramp Utara KM 2', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 67, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T03:07:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:04:00Z', date_key: '2026-03-06' },
  { id: '8060509', timestamp: '06 Mar, 10:05', pelapor: 'YUSUF PRATAMA', perusahaan: 'PT SIS', pic_perusahaan: 'Eko Saputra', site: 'BMO 2', lokasi: 'Dewatering Pond', detail_lokasi: 'Pompa Station 4', geoCheck: true, textCheck: true, semanticCheck: true, status: 'menunggu', duplicateScore: 0, duplicateStatus: null, attempt_count: 0, last_attempt_at: null, last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: null, date_key: '2026-03-06' },
  { id: '8060510', timestamp: '06 Mar, 10:05', pelapor: 'ARIF HIDAYAT', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Pit 2 East', detail_lokasi: 'Bench 340 Sisi Timur', geoCheck: true, textCheck: true, semanticCheck: true, status: 'diproses', duplicateScore: 42, duplicateStatus: null, attempt_count: 1, last_attempt_at: '2026-03-06T03:08:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:08:00Z', date_key: '2026-03-06' },
  { id: '8060511', timestamp: '06 Mar, 10:06', pelapor: 'RUDI HARTANTO', perusahaan: 'PT Thiess', pic_perusahaan: 'Dimas Prasetyo', site: 'BMO 1', lokasi: 'Stockpile ROM', detail_lokasi: 'Area Penumpukan Barat', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 33, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T03:08:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:06:00Z', date_key: '2026-03-06' },
  { id: '8060512', timestamp: '06 Mar, 10:06', pelapor: 'TONY WIJAYA', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Workshop Elektrikal', detail_lokasi: 'Panel Room Utama', geoCheck: true, textCheck: true, semanticCheck: true, status: 'menunggu', duplicateScore: 0, duplicateStatus: null, attempt_count: 0, last_attempt_at: null, last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: null, date_key: '2026-03-06' },
  { id: '8060513', timestamp: '06 Mar, 10:07', pelapor: 'RIZKY MAULANA', perusahaan: 'PT Thiess', pic_perusahaan: 'Dimas Prasetyo', site: 'BMO 1', lokasi: 'Workshop Mekanik', detail_lokasi: 'Bay 3 Heavy Equipment', geoCheck: true, textCheck: true, semanticCheck: true, status: 'diproses', duplicateScore: 60, duplicateStatus: null, attempt_count: 1, last_attempt_at: '2026-03-06T03:09:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:09:00Z', date_key: '2026-03-06' },
  { id: '8060514', timestamp: '06 Mar, 10:08', pelapor: 'AGUS WIJAYA', perusahaan: 'PT Pamapersada', pic_perusahaan: 'Cahyo Wibowo', site: 'GMO', lokasi: 'Pit 3 Section A', detail_lokasi: 'Bench 420 Sisi Barat', geoCheck: true, textCheck: true, semanticCheck: true, status: 'menunggu', duplicateScore: 0, duplicateStatus: null, attempt_count: 0, last_attempt_at: null, last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: null, date_key: '2026-03-06' },
  { id: '8060515', timestamp: '06 Mar, 10:08', pelapor: 'DEDI KURNIAWAN', perusahaan: 'PT BUMA', pic_perusahaan: 'Andi Santoso', site: 'LMO', lokasi: 'Hauling Road KM 5', detail_lokasi: 'Persimpangan Jalan Utama', geoCheck: true, textCheck: true, semanticCheck: true, status: 'sukses', duplicateScore: 48, duplicateStatus: 'Non-Duplicate', attempt_count: 1, last_attempt_at: '2026-03-06T03:10:00Z', last_error_code: null, last_error_message: null, next_retry_at: null, batch_id: 'DM-20260306-1000', processing_started_at: '2026-03-06T03:08:30Z', date_key: '2026-03-06' },
];

// Today's batches
const todayBatches: BatchRecord[] = [
  {
    batch_id: 'DM-20260306-0700', slot_time: '07:00', window_start: '2026-03-06T00:00:00Z', window_end: '2026-03-06T03:00:00Z', triggered_at: '2026-03-06T00:00:05Z', triggered_by: 'system', status: 'completed', total: 15, success: 13, failed: 2, needs_check: 0, stuck: 0, duration: '12m 05s', start_at: '2026-03-06T00:00:05Z', end_at: '2026-03-06T00:12:10Z', duration_seconds: 725, fetched_count: 15, date_key: '2026-03-06',
  },
  {
    batch_id: 'DM-20260306-1000', slot_time: '10:00', window_start: '2026-03-06T03:00:00Z', window_end: '2026-03-06T06:00:00Z', triggered_at: '2026-03-06T03:00:12Z', triggered_by: 'system', status: 'running', total: 15, success: 5, failed: 2, needs_check: 0, stuck: 0, duration: '—', start_at: '2026-03-06T03:00:12Z', end_at: null, duration_seconds: 271, fetched_count: 15, date_key: '2026-03-06',
  },
];

// Generate previous days data
const day1 = generateDayItems('2026-03-05', '05 Mar', '20260305');
const day2 = generateDayItems('2026-03-04', '04 Mar', '20260304');
const day3 = generateDayItems('2026-03-03', '03 Mar', '20260303');

// All data combined
export const allQueueItems: Record<string, QueueItem[]> = {
  '2026-03-06': [...batch0700Items, ...batch1000Items],
  '2026-03-05': day1.items,
  '2026-03-04': day2.items,
  '2026-03-03': day3.items,
};

export const allBatches: Record<string, BatchRecord[]> = {
  '2026-03-06': todayBatches,
  '2026-03-05': day1.batches,
  '2026-03-04': day2.batches,
  '2026-03-03': day3.batches,
};

// Default exports for backward compat
export const mockQueueItems: QueueItem[] = [...batch0700Items, ...batch1000Items];
export const mockBatches: BatchRecord[] = todayBatches;

// Date options for the date filter
export const DATE_OPTIONS = [
  { value: '2026-03-06', label: 'Hari ini', sublabel: '06 Mar 2026' },
  { value: '2026-03-05', label: '1 hari lalu', sublabel: '05 Mar 2026' },
  { value: '2026-03-04', label: '2 hari lalu', sublabel: '04 Mar 2026' },
  { value: '2026-03-03', label: '3 hari lalu', sublabel: '03 Mar 2026' },
];

// Mock attempt history for error details
export const mockAttemptHistory: Record<string, AttemptRecord[]> = {
  '8060405': [
    { attempt_number: 1, timestamp: '2026-03-06T00:05:00Z', result: 'timeout', error_code: 'TIMEOUT', error_message: 'Semantic analysis timed out after 300s.', processing_stage: 'semantic', duration: '5m 00s' },
    { attempt_number: 2, timestamp: '2026-03-06T00:08:00Z', result: 'timeout', error_code: 'TIMEOUT', error_message: 'Semantic analysis timed out again.', processing_stage: 'semantic', duration: '5m 00s' },
  ],
  '8060410': [
    { attempt_number: 1, timestamp: '2026-03-06T00:09:00Z', result: 'error', error_code: 'DATA_INVALID', error_message: 'Field "lokasi" parsing failed. Invalid coordinate format.', processing_stage: 'geo', duration: '0m 12s' },
  ],
  '8060503': [
    { attempt_number: 1, timestamp: '2026-03-06T03:03:00Z', result: 'timeout', error_code: 'TIMEOUT', error_message: 'Semantic analysis timed out after 300s.', processing_stage: 'semantic', duration: '5m 00s' },
    { attempt_number: 2, timestamp: '2026-03-06T03:06:00Z', result: 'timeout', error_code: 'TIMEOUT', error_message: 'Semantic analysis timed out after 300s. Model inference exceeded maximum wait time.', processing_stage: 'semantic', duration: '5m 00s' },
  ],
  '8060505': [
    { attempt_number: 1, timestamp: '2026-03-06T03:05:00Z', result: 'timeout', error_code: 'PROCESSING_TIMEOUT', error_message: 'Processing exceeded 15 minute threshold.', processing_stage: 'lexical', duration: '15m+' },
  ],
};

export const retryReasonOptions = [
  { value: 'TIMEOUT', label: 'Timeout' },
  { value: 'RATE_LIMIT', label: 'Rate Limit' },
  { value: 'MODEL_ERROR', label: 'Model Error' },
  { value: 'DATA_FIXED', label: 'Data Sudah Diperbaiki' },
  { value: 'OTHER', label: 'Lainnya' },
];

export const retryStepScopeOptions = [
  { value: 'scoring', label: 'Re-run scoring only' },
  { value: 'clustering_scoring', label: 'Re-run clustering + scoring' },
  { value: 'full', label: 'Full re-run (embedding → retrieval → clustering → scoring)' },
];
