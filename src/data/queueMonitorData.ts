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
}

export interface BatchRecord {
  batch_id: string;
  slot_time: string; // e.g. "10:00"
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

// Mock queue items
export const mockQueueItems: QueueItem[] = [
  {
    id: '8060386',
    timestamp: '19 Jan, 08:05',
    pelapor: 'SUWARNO',
    perusahaan: 'PT BUMA',
    pic_perusahaan: 'Andi Santoso',
    site: 'LMO',
    lokasi: 'Workshop Bigshop BUMA',
    detail_lokasi: 'Gedung Utama Lt. 2',
    geoCheck: true, textCheck: true, semanticCheck: true,
    status: 'menunggu',
    duplicateScore: 0,
    duplicateStatus: null,
    attempt_count: 0,
    last_attempt_at: null,
    last_error_code: null,
    last_error_message: null,
    next_retry_at: null,
    batch_id: 'DM-20260305-1029',
    processing_started_at: null,
  },
  {
    id: '8060385',
    timestamp: '19 Jan, 08:05',
    pelapor: 'FIRMAN',
    perusahaan: 'PT Pelayaran Nasional',
    pic_perusahaan: 'Budi Hartono',
    site: 'MARINE',
    lokasi: 'Towing Tug',
    detail_lokasi: 'Dermaga B-3',
    geoCheck: true, textCheck: true, semanticCheck: true,
    status: 'diproses',
    duplicateScore: 35,
    duplicateStatus: null,
    attempt_count: 1,
    last_attempt_at: '2026-03-05T10:30:00Z',
    last_error_code: null,
    last_error_message: null,
    next_retry_at: null,
    batch_id: 'DM-20260305-1029',
    processing_started_at: '2026-03-05T10:30:00Z',
  },
  {
    id: '8060379',
    timestamp: '19 Jan, 08:05',
    pelapor: 'IRFAN NUR RIZAL',
    perusahaan: 'PT Pamapersada',
    pic_perusahaan: 'Cahyo Wibowo',
    site: 'GMO',
    lokasi: 'Crusher 01 dan BLC',
    detail_lokasi: 'Area Crushing Plant Utara',
    geoCheck: true, textCheck: true, semanticCheck: false,
    status: 'gagal',
    duplicateScore: 60,
    duplicateStatus: null,
    attempt_count: 2,
    last_attempt_at: '2026-03-05T10:25:00Z',
    last_error_code: 'TIMEOUT',
    last_error_message: 'Semantic analysis timed out after 300s. Model inference exceeded maximum wait time.',
    next_retry_at: '2026-03-05T11:00:00Z',
    batch_id: 'DM-20260305-1029',
    processing_started_at: '2026-03-05T10:20:00Z',
  },
  {
    id: '8060378',
    timestamp: '19 Jan, 08:05',
    pelapor: 'ABDAN SYEKURA',
    perusahaan: 'PT Thiess',
    pic_perusahaan: 'Dimas Prasetyo',
    site: 'BMO 1',
    lokasi: 'Fuel Station',
    detail_lokasi: 'Tangki Solar Utama',
    geoCheck: true, textCheck: true, semanticCheck: true,
    status: 'sukses',
    duplicateScore: 85,
    duplicateStatus: 'Non-Duplicate',
    attempt_count: 1,
    last_attempt_at: '2026-03-05T10:15:00Z',
    last_error_code: null,
    last_error_message: null,
    next_retry_at: null,
    batch_id: 'DM-20260305-1029',
    processing_started_at: '2026-03-05T10:10:00Z',
  },
  {
    id: '8060377',
    timestamp: '19 Jan, 08:05',
    pelapor: 'INDRA WIRA PRANATA',
    perusahaan: 'PT SIS',
    pic_perusahaan: 'Eko Saputra',
    site: 'BMO 2',
    lokasi: '(B8) Pit J',
    detail_lokasi: 'Front Loading Area',
    geoCheck: true, textCheck: false, semanticCheck: false,
    status: 'gagal',
    duplicateScore: 50,
    duplicateStatus: null,
    attempt_count: 1,
    last_attempt_at: '2026-03-05T09:45:00Z',
    last_error_code: 'PROCESSING_TIMEOUT',
    last_error_message: 'Item telah diproses lebih dari 15 menit tanpa respons. Kemungkinan model inference hang.',
    next_retry_at: null,
    batch_id: 'DM-20260305-1029',
    processing_started_at: '2026-03-05T09:45:00Z',
  },
  {
    id: '8060373',
    timestamp: '19 Jan, 08:05',
    pelapor: 'FIRMAN',
    perusahaan: 'PT Pelayaran Nasional',
    pic_perusahaan: 'Budi Hartono',
    site: 'MARINE',
    lokasi: 'Towing Tug',
    detail_lokasi: 'Dermaga B-3',
    geoCheck: true, textCheck: true, semanticCheck: true,
    status: 'gagal',
    duplicateScore: 40,
    duplicateStatus: null,
    attempt_count: 3,
    last_attempt_at: '2026-03-05T10:00:00Z',
    last_error_code: 'DATA_INVALID',
    last_error_message: 'Field "lokasi" tidak dapat diparse. Format koordinat tidak valid (-999, 999).',
    next_retry_at: null,
    batch_id: 'DM-20260305-0729',
    processing_started_at: '2026-03-05T09:55:00Z',
  },
  {
    id: '8060370',
    timestamp: '19 Jan, 07:50',
    pelapor: 'AGUS WIJAYA',
    perusahaan: 'PT Pamapersada',
    pic_perusahaan: 'Cahyo Wibowo',
    site: 'GMO',
    lokasi: 'Pit 3 Section A',
    detail_lokasi: 'Bench 420 Sisi Barat',
    geoCheck: true, textCheck: true, semanticCheck: true,
    status: 'diproses',
    duplicateScore: 30,
    duplicateStatus: null,
    attempt_count: 2,
    last_attempt_at: '2026-03-05T10:32:00Z',
    last_error_code: 'MODEL_ERROR',
    last_error_message: 'Embedding model returned empty vector.',
    next_retry_at: null,
    batch_id: 'DM-20260305-0729',
    processing_started_at: '2026-03-05T10:32:00Z',
  },
  {
    id: '8060365',
    timestamp: '19 Jan, 07:45',
    pelapor: 'DEDI KURNIAWAN',
    perusahaan: 'PT BUMA',
    pic_perusahaan: 'Andi Santoso',
    site: 'LMO',
    lokasi: 'Hauling Road KM 5',
    detail_lokasi: 'Persimpangan Jalan Utama',
    geoCheck: true, textCheck: true, semanticCheck: true,
    status: 'sukses',
    duplicateScore: 92,
    duplicateStatus: 'Potential Duplicate',
    attempt_count: 1,
    last_attempt_at: '2026-03-05T09:30:00Z',
    last_error_code: null,
    last_error_message: null,
    next_retry_at: null,
    batch_id: 'DM-20260305-0729',
    processing_started_at: '2026-03-05T09:25:00Z',
  },
];

// Mock batch records
export const mockBatches: BatchRecord[] = [
  {
    batch_id: 'DM-20260306-1000',
    slot_time: '10:00',
    window_start: '2026-03-06T03:00:00Z',
    window_end: '2026-03-06T03:00:00Z',
    triggered_at: '2026-03-06T03:00:12Z',
    triggered_by: 'system',
    status: 'running',
    total: 12,
    success: 5,
    failed: 1,
    needs_check: 0,
    stuck: 0,
    duration: '—',
    start_at: '2026-03-06T03:00:12Z',
    end_at: null,
    duration_seconds: 271,
    fetched_count: 12,
  },
  {
    batch_id: 'DM-20260306-0700',
    slot_time: '07:00',
    window_start: '2026-03-06T00:00:00Z',
    window_end: '2026-03-06T03:00:00Z',
    triggered_at: '2026-03-06T00:00:05Z',
    triggered_by: 'system',
    status: 'completed',
    total: 18,
    success: 16,
    failed: 1,
    needs_check: 1,
    stuck: 0,
    duration: '12m 05s',
    start_at: '2026-03-06T00:00:05Z',
    end_at: '2026-03-06T00:12:10Z',
    duration_seconds: 725,
    fetched_count: 18,
  },
  {
    batch_id: 'DM-20260305-1900',
    slot_time: '19:00',
    window_start: '2026-03-05T09:00:00Z',
    window_end: '2026-03-05T12:00:00Z',
    triggered_at: '2026-03-05T12:00:00Z',
    triggered_by: 'system',
    status: 'completed',
    total: 8,
    success: 8,
    failed: 0,
    needs_check: 0,
    stuck: 0,
    duration: '5m 12s',
    start_at: '2026-03-05T12:00:00Z',
    end_at: '2026-03-05T12:05:12Z',
    duration_seconds: 312,
    fetched_count: 8,
  },
  {
    batch_id: 'DM-20260305-1600',
    slot_time: '16:00',
    window_start: '2026-03-05T06:00:00Z',
    window_end: '2026-03-05T09:00:00Z',
    triggered_at: '2026-03-05T09:00:00Z',
    triggered_by: 'system',
    status: 'completed',
    total: 15,
    success: 14,
    failed: 1,
    needs_check: 0,
    stuck: 0,
    duration: '9m 47s',
    start_at: '2026-03-05T09:00:00Z',
    end_at: '2026-03-05T09:09:47Z',
    duration_seconds: 587,
    fetched_count: 15,
  },
  {
    batch_id: 'DM-20260305-1300',
    slot_time: '13:00',
    window_start: '2026-03-05T03:00:00Z',
    window_end: '2026-03-05T06:00:00Z',
    triggered_at: '2026-03-05T06:00:15Z',
    triggered_by: 'manual',
    status: 'partial',
    total: 22,
    success: 10,
    failed: 8,
    needs_check: 2,
    stuck: 2,
    duration: '15m 33s',
    start_at: '2026-03-05T06:00:15Z',
    end_at: '2026-03-05T06:15:48Z',
    duration_seconds: 933,
    fetched_count: 22,
  },
];

// Mock attempt history for error details
export const mockAttemptHistory: Record<string, AttemptRecord[]> = {
  '8060379': [
    { attempt_number: 1, timestamp: '2026-03-05T10:15:00Z', result: 'timeout', error_code: 'TIMEOUT', error_message: 'Geo analysis completed, lexical completed. Semantic analysis timed out after 300s.', processing_stage: 'semantic', duration: '5m 00s' },
    { attempt_number: 2, timestamp: '2026-03-05T10:25:00Z', result: 'timeout', error_code: 'TIMEOUT', error_message: 'Semantic analysis timed out after 300s. Model inference exceeded maximum wait time.', processing_stage: 'semantic', duration: '5m 00s' },
  ],
  '8060377': [
    { attempt_number: 1, timestamp: '2026-03-05T09:45:00Z', result: 'timeout', error_code: 'PROCESSING_TIMEOUT', error_message: 'Processing exceeded 15 minute threshold. Last known stage: lexical analysis. No response from worker.', processing_stage: 'lexical', duration: '15m+' },
  ],
  '8060373': [
    { attempt_number: 1, timestamp: '2026-03-05T09:30:00Z', result: 'error', error_code: 'DATA_INVALID', error_message: 'Field "lokasi" parsing failed. Invalid coordinate format.', processing_stage: 'geo', duration: '0m 12s' },
    { attempt_number: 2, timestamp: '2026-03-05T09:45:00Z', result: 'error', error_code: 'DATA_INVALID', error_message: 'Same data issue persists after retry.', processing_stage: 'geo', duration: '0m 08s' },
    { attempt_number: 3, timestamp: '2026-03-05T10:00:00Z', result: 'error', error_code: 'DATA_INVALID', error_message: 'Field "lokasi" tidak dapat diparse. Format koordinat tidak valid (-999, 999).', processing_stage: 'geo', duration: '0m 10s' },
  ],
  '8060370': [
    { attempt_number: 1, timestamp: '2026-03-05T10:20:00Z', result: 'error', error_code: 'MODEL_ERROR', error_message: 'Embedding model returned empty vector for input text.', processing_stage: 'embedding', duration: '1m 20s' },
    { attempt_number: 2, timestamp: '2026-03-05T10:32:00Z', result: 'failed', error_code: 'MODEL_ERROR', error_message: 'Embedding model returned empty vector. Retrying...', processing_stage: 'embedding', duration: '0m 45s' },
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
