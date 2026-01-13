// AI Duplicate Detection - 5-Tab Linear Flow Data Model

export type StageStatus = 'queue' | 'geo' | 'lexical' | 'semantic' | 'final';
export type DecisionStatus = 'pending' | 'confirmed_duplicate' | 'potential_duplicate' | 'non_duplicate';
export type ProcessingStatus = 'waiting' | 'processing' | 'done' | 'error';

export interface GeoAnalysis {
  geo_cluster_id: string;
  geo_score: number;
  site_match: boolean;
  lokasi_match: boolean;
  detail_lokasi_match: boolean;
  distance_to_cluster_center?: number;
  latitude?: number;
  longitude?: number;
  geo_reason: string;
  status: ProcessingStatus;
}

export interface LexicalAnalysis {
  lexical_score: number;
  matched_phrases: string[];
  ketidaksesuaian: string;
  sub_ketidaksesuaian: string;
  quick_action: string;
  deskripsi_temuan: string;
  deskripsi_overlap_pct: number;
  lexical_reason: string;
  status: ProcessingStatus;
}

export interface SemanticAnalysis {
  semantic_score: number;
  visual_context_match: boolean;
  detected_objects: string[];
  scene_context: string;
  hazard_type: string;
  image_urls: string[];
  semantic_reason: string;
  status: ProcessingStatus;
}

export interface DuplicateCandidate {
  report_id: string;
  timestamp: string;
  reporter: string;
  site: string;
  lokasi: string;
  detail_lokasi: string;
  deskripsi_temuan: string;
  geo_score: number;
  lexical_score: number;
  semantic_score: number;
  overall_score: number;
  image_url?: string;
}

export interface DuplicateCluster {
  cluster_id: string;
  name: string;
  representative_report_id: string;
  member_report_ids: string[];
  member_count: number;
  geo_score: number;
  lexical_score: number;
  semantic_score: number;
  final_score: number;
  decision_status: DecisionStatus;
  created_at: string;
  updated_at: string;
}

export interface DuplicateReport {
  report_id: string;
  timestamp: string;
  reporter: string;
  site: string;
  lokasi: string;
  detail_lokasi: string;
  latitude?: number;
  longitude?: number;
  ketidaksesuaian: string;
  sub_ketidaksesuaian: string;
  quick_action: string;
  deskripsi_temuan: string;
  keterangan_lokasi: string;
  image_urls: string[];
  
  // Stage tracking
  stage_status: StageStatus;
  processing_status: ProcessingStatus;
  error_message?: string;
  
  // Scores
  duplicate_score: number;
  geo_score: number;
  lexical_score: number;
  semantic_score: number;
  
  // Stage details
  geo_analysis?: GeoAnalysis;
  lexical_analysis?: LexicalAnalysis;
  semantic_analysis?: SemanticAnalysis;
  
  // Cluster
  cluster_id?: string;
  candidates: DuplicateCandidate[];
  
  // AI Recommendation
  ai_recommendation: 'duplicate' | 'potential_duplicate' | 'non_duplicate';
  ai_explanation: string[];
}

export interface AuditLogEntry {
  id: string;
  cluster_id: string;
  report_id?: string;
  action: 'confirm_duplicate' | 'mark_non_duplicate' | 'merge_cluster' | 'split_cluster' | 'rerun_analysis' | 'change_representative';
  user: string;
  timestamp: string;
  before_status: string;
  after_status: string;
  notes?: string;
}

// Helper functions
export function getReportsByStage(reports: DuplicateReport[], stage: StageStatus): DuplicateReport[] {
  return reports.filter(r => r.stage_status === stage);
}

export function getStageCounts(reports: DuplicateReport[]): Record<StageStatus, number> {
  return {
    queue: reports.filter(r => r.stage_status === 'queue').length,
    geo: reports.filter(r => r.stage_status === 'geo').length,
    lexical: reports.filter(r => r.stage_status === 'lexical').length,
    semantic: reports.filter(r => r.stage_status === 'semantic').length,
    final: reports.filter(r => r.stage_status === 'final').length,
  };
}

// Mock Data - Queue Reports (new, waiting)
export const queueReports: DuplicateReport[] = [
  {
    report_id: "HR-2025-001",
    timestamp: "2025-01-13T08:00:00Z",
    reporter: "Budi Santoso",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Jalur Angkut Pit Selatan",
    latitude: -2.9876,
    longitude: 115.4321,
    ketidaksesuaian: "DDP : Kelayakan Kendaraan",
    sub_ketidaksesuaian: "Tidak menggunakan APD",
    quick_action: "Warning",
    deskripsi_temuan: "Pekerja tidak menggunakan helm safety di area konstruksi.",
    keterangan_lokasi: "Dekat loading point utama",
    image_urls: ["/placeholder.svg"],
    stage_status: 'queue',
    processing_status: 'waiting',
    duplicate_score: 0,
    geo_score: 0,
    lexical_score: 0,
    semantic_score: 0,
    candidates: [],
    ai_recommendation: 'non_duplicate',
    ai_explanation: []
  },
  {
    report_id: "HR-2025-002",
    timestamp: "2025-01-13T08:30:00Z",
    reporter: "Sinta Dewi",
    site: "OFFICE AREA",
    lokasi: "Workshop",
    detail_lokasi: "Workshop Utama",
    ketidaksesuaian: "Perlengkapan Keselamatan",
    sub_ketidaksesuaian: "APD tidak lengkap",
    quick_action: "APD Check",
    deskripsi_temuan: "Teknisi tidak menggunakan sarung tangan saat bekerja dengan oli.",
    keterangan_lokasi: "Workshop maintenance, bay 3",
    image_urls: [],
    stage_status: 'queue',
    processing_status: 'waiting',
    duplicate_score: 0,
    geo_score: 0,
    lexical_score: 0,
    semantic_score: 0,
    candidates: [],
    ai_recommendation: 'non_duplicate',
    ai_explanation: []
  },
  {
    report_id: "HR-2025-003",
    timestamp: "2025-01-13T09:00:00Z",
    reporter: "Ahmad Fauzi",
    site: "MINING PIT",
    lokasi: "Pit Area",
    detail_lokasi: "Pit 3 Section A",
    latitude: -2.9912,
    longitude: 115.4567,
    ketidaksesuaian: "Road Management",
    sub_ketidaksesuaian: "Jalan berlubang",
    quick_action: "Road Maintenance",
    deskripsi_temuan: "Terdapat lubang di jalan hauling sekitar 40cm diameter.",
    keterangan_lokasi: "300m dari disposal",
    image_urls: ["/placeholder.svg"],
    stage_status: 'queue',
    processing_status: 'waiting',
    duplicate_score: 0,
    geo_score: 0,
    lexical_score: 0,
    semantic_score: 0,
    candidates: [],
    ai_recommendation: 'non_duplicate',
    ai_explanation: []
  }
];

// Mock Data - Geo Reports (being analyzed for location)
export const geoReports: DuplicateReport[] = [
  {
    report_id: "HR-2025-010",
    timestamp: "2025-01-12T10:00:00Z",
    reporter: "Eka Putra",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Gerbang Utama Site",
    latitude: -2.9850,
    longitude: 115.4290,
    ketidaksesuaian: "DDP : Kelayakan Kendaraan",
    sub_ketidaksesuaian: "Kecepatan melebihi batas",
    quick_action: "Warning",
    deskripsi_temuan: "Kendaraan LV melaju kencang di area gerbang, estimasi 45 km/jam.",
    keterangan_lokasi: "100m sebelum gerbang utama",
    image_urls: ["/placeholder.svg"],
    stage_status: 'geo',
    processing_status: 'done',
    duplicate_score: 0,
    geo_score: 94,
    lexical_score: 0,
    semantic_score: 0,
    geo_analysis: {
      geo_cluster_id: "GEO-001",
      geo_score: 94,
      site_match: true,
      lokasi_match: true,
      detail_lokasi_match: true,
      distance_to_cluster_center: 85,
      latitude: -2.9850,
      longitude: 115.4290,
      geo_reason: "Lokasi identik dengan 2 laporan lain. Jarak hanya 85m dari cluster center.",
      status: 'done'
    },
    candidates: [
      {
        report_id: "HR-2025-011",
        timestamp: "2025-01-12T10:30:00Z",
        reporter: "Agus Wijaya",
        site: "MINING PIT",
        lokasi: "Hauling Road",
        detail_lokasi: "Gerbang Utama Site",
        deskripsi_temuan: "LV melaju 50 km/jam di zona 30 km/jam.",
        geo_score: 92,
        lexical_score: 0,
        semantic_score: 0,
        overall_score: 92,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'potential_duplicate',
    ai_explanation: ["Lokasi sangat berdekatan"]
  },
  {
    report_id: "HR-2025-011",
    timestamp: "2025-01-12T10:30:00Z",
    reporter: "Agus Wijaya",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Gerbang Utama Site",
    latitude: -2.9855,
    longitude: 115.4295,
    ketidaksesuaian: "DDP : Kelayakan Kendaraan",
    sub_ketidaksesuaian: "Kecepatan melebihi batas",
    quick_action: "Warning Letter",
    deskripsi_temuan: "LV melaju 50 km/jam di zona 30 km/jam dekat gerbang.",
    keterangan_lokasi: "Dekat pos jaga gerbang utama",
    image_urls: ["/placeholder.svg"],
    stage_status: 'geo',
    processing_status: 'done',
    duplicate_score: 0,
    geo_score: 92,
    lexical_score: 0,
    semantic_score: 0,
    geo_analysis: {
      geo_cluster_id: "GEO-001",
      geo_score: 92,
      site_match: true,
      lokasi_match: true,
      detail_lokasi_match: true,
      distance_to_cluster_center: 42,
      latitude: -2.9855,
      longitude: 115.4295,
      geo_reason: "Site sama, lokasi hauling road sama, jarak 42m dari cluster center.",
      status: 'done'
    },
    candidates: [],
    ai_recommendation: 'potential_duplicate',
    ai_explanation: []
  }
];

// Mock Data - Lexical Reports (text similarity analysis)
export const lexicalReports: DuplicateReport[] = [
  {
    report_id: "HR-2025-020",
    timestamp: "2025-01-11T08:00:00Z",
    reporter: "Rudi Hartono",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Jalur Angkut Pit Selatan",
    latitude: -2.9876,
    longitude: 115.4321,
    ketidaksesuaian: "DDP : Kelayakan Kendaraan",
    sub_ketidaksesuaian: "Tidak menggunakan APD",
    quick_action: "Warning",
    deskripsi_temuan: "Pekerja tidak menggunakan helm safety di area konstruksi. Terlihat 2 orang sedang melakukan loading.",
    keterangan_lokasi: "Dekat loading point utama",
    image_urls: ["/placeholder.svg"],
    stage_status: 'lexical',
    processing_status: 'done',
    duplicate_score: 0,
    geo_score: 92,
    lexical_score: 78,
    semantic_score: 0,
    geo_analysis: {
      geo_cluster_id: "GEO-002",
      geo_score: 92,
      site_match: true,
      lokasi_match: true,
      detail_lokasi_match: true,
      distance_to_cluster_center: 42,
      geo_reason: "Site sama, lokasi sama, jarak 42m.",
      status: 'done'
    },
    lexical_analysis: {
      lexical_score: 78,
      matched_phrases: ["tidak menggunakan helm", "area konstruksi", "APD", "pekerja", "safety"],
      ketidaksesuaian: "DDP : Kelayakan Kendaraan",
      sub_ketidaksesuaian: "Tidak menggunakan APD",
      quick_action: "Warning",
      deskripsi_temuan: "Pekerja tidak menggunakan helm safety di area konstruksi.",
      deskripsi_overlap_pct: 72,
      lexical_reason: "Deskripsi memiliki 72% kesamaan kata. Frasa 'tidak menggunakan helm' ditemukan di kedua laporan.",
      status: 'done'
    },
    candidates: [
      {
        report_id: "HR-2025-021",
        timestamp: "2025-01-11T08:15:00Z",
        reporter: "Sinta Dewi",
        site: "MINING PIT",
        lokasi: "Hauling Road",
        detail_lokasi: "Jalur Angkut Pit Selatan",
        deskripsi_temuan: "Karyawan tidak memakai helm saat bekerja di area konstruksi.",
        geo_score: 95,
        lexical_score: 82,
        semantic_score: 0,
        overall_score: 88,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'potential_duplicate',
    ai_explanation: ["Teks sangat mirip"]
  }
];

// Mock Data - Semantic Reports (meaning & image analysis)
export const semanticReports: DuplicateReport[] = [
  {
    report_id: "HR-2025-030",
    timestamp: "2025-01-10T09:00:00Z",
    reporter: "Dedi Kurniawan",
    site: "MINING PIT",
    lokasi: "Pit Area",
    detail_lokasi: "Pit 3 Section B",
    latitude: -2.9920,
    longitude: 115.4580,
    ketidaksesuaian: "Road Management",
    sub_ketidaksesuaian: "Jalan berlubang",
    quick_action: "Road Maintenance",
    deskripsi_temuan: "Lubang besar di tengah jalan, berpotensi bahaya untuk unit HD.",
    keterangan_lokasi: "500m dari loading point",
    image_urls: ["/placeholder.svg", "/placeholder.svg"],
    stage_status: 'semantic',
    processing_status: 'done',
    duplicate_score: 0,
    geo_score: 72,
    lexical_score: 65,
    semantic_score: 85,
    geo_analysis: {
      geo_cluster_id: "GEO-003",
      geo_score: 72,
      site_match: true,
      lokasi_match: true,
      detail_lokasi_match: false,
      distance_to_cluster_center: 150,
      geo_reason: "Site sama, lokasi berdekatan.",
      status: 'done'
    },
    lexical_analysis: {
      lexical_score: 65,
      matched_phrases: ["lubang", "jalan", "bahaya"],
      ketidaksesuaian: "Road Management",
      sub_ketidaksesuaian: "Jalan berlubang",
      quick_action: "Road Maintenance",
      deskripsi_temuan: "Lubang besar di tengah jalan.",
      deskripsi_overlap_pct: 55,
      lexical_reason: "Kesamaan kata menengah.",
      status: 'done'
    },
    semantic_analysis: {
      semantic_score: 85,
      visual_context_match: true,
      detected_objects: ["pothole", "road", "mining_truck", "dust"],
      scene_context: "mining_hauling_road",
      hazard_type: "road_damage",
      image_urls: ["/placeholder.svg", "/placeholder.svg"],
      semantic_reason: "Gambar menunjukkan lubang jalan serupa. VLM mendeteksi kondisi yang sama.",
      status: 'done'
    },
    candidates: [
      {
        report_id: "HR-2025-031",
        timestamp: "2025-01-10T09:30:00Z",
        reporter: "Joko Susilo",
        site: "MINING PIT",
        lokasi: "Pit Area",
        detail_lokasi: "Pit 3 Section B",
        deskripsi_temuan: "Ada lubang di jalan pit, ukuran cukup besar.",
        geo_score: 75,
        lexical_score: 60,
        semantic_score: 88,
        overall_score: 74,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'duplicate',
    ai_explanation: ["Gambar menunjukkan kejadian yang sama"]
  }
];

// Mock Data - Final Reports (ready for decision)
export const finalReports: DuplicateReport[] = [
  {
    report_id: "HR-2025-040",
    timestamp: "2025-01-09T07:00:00Z",
    reporter: "Eko Prasetyo",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Gerbang Utama Site",
    latitude: -2.9850,
    longitude: 115.4290,
    ketidaksesuaian: "DDP : Kelayakan Kendaraan",
    sub_ketidaksesuaian: "Kecepatan melebihi batas",
    quick_action: "Warning",
    deskripsi_temuan: "Kendaraan melaju kencang di area gerbang.",
    keterangan_lokasi: "Dekat gerbang utama",
    image_urls: ["/placeholder.svg"],
    stage_status: 'final',
    processing_status: 'done',
    duplicate_score: 91,
    geo_score: 94,
    lexical_score: 88,
    semantic_score: 90,
    cluster_id: "CL-001",
    geo_analysis: {
      geo_cluster_id: "GEO-001",
      geo_score: 94,
      site_match: true,
      lokasi_match: true,
      detail_lokasi_match: true,
      distance_to_cluster_center: 85,
      geo_reason: "Lokasi identik.",
      status: 'done'
    },
    lexical_analysis: {
      lexical_score: 88,
      matched_phrases: ["kecepatan", "gerbang", "melaju"],
      ketidaksesuaian: "DDP : Kelayakan Kendaraan",
      sub_ketidaksesuaian: "Kecepatan melebihi batas",
      quick_action: "Warning",
      deskripsi_temuan: "Kendaraan melaju kencang di area gerbang.",
      deskripsi_overlap_pct: 78,
      lexical_reason: "Deskripsi sangat mirip.",
      status: 'done'
    },
    semantic_analysis: {
      semantic_score: 90,
      visual_context_match: true,
      detected_objects: ["vehicle", "gate", "speed_sign"],
      scene_context: "mine_entrance",
      hazard_type: "speeding",
      image_urls: ["/placeholder.svg"],
      semantic_reason: "Gambar menunjukkan situasi yang sama.",
      status: 'done'
    },
    candidates: [
      {
        report_id: "HR-2025-041",
        timestamp: "2025-01-09T07:30:00Z",
        reporter: "Bambang Suryadi",
        site: "MINING PIT",
        lokasi: "Hauling Road",
        detail_lokasi: "Gerbang Utama Site",
        deskripsi_temuan: "LV melaju kencang melewati gerbang.",
        geo_score: 92,
        lexical_score: 85,
        semantic_score: 88,
        overall_score: 88,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'duplicate',
    ai_explanation: [
      "Lokasi identik (jarak 85m)",
      "Deskripsi sangat mirip (78% overlap)",
      "Gambar menunjukkan kejadian yang sama"
    ]
  },
  {
    report_id: "HR-2025-041",
    timestamp: "2025-01-09T07:30:00Z",
    reporter: "Bambang Suryadi",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Gerbang Utama Site",
    latitude: -2.9855,
    longitude: 115.4295,
    ketidaksesuaian: "DDP : Kelayakan Kendaraan",
    sub_ketidaksesuaian: "Kecepatan melebihi batas",
    quick_action: "Warning Letter",
    deskripsi_temuan: "LV melaju kencang melewati gerbang, estimasi 50 km/jam.",
    keterangan_lokasi: "Pos jaga gerbang utama",
    image_urls: ["/placeholder.svg"],
    stage_status: 'final',
    processing_status: 'done',
    duplicate_score: 88,
    geo_score: 92,
    lexical_score: 85,
    semantic_score: 88,
    cluster_id: "CL-001",
    candidates: [],
    ai_recommendation: 'duplicate',
    ai_explanation: []
  }
];

// Duplicate Clusters
export const duplicateClusters: DuplicateCluster[] = [
  {
    cluster_id: "CL-001",
    name: "Pelanggaran Kecepatan Area Gerbang",
    representative_report_id: "HR-2025-040",
    member_report_ids: ["HR-2025-040", "HR-2025-041"],
    member_count: 2,
    geo_score: 93,
    lexical_score: 86,
    semantic_score: 89,
    final_score: 89,
    decision_status: 'pending',
    created_at: "2025-01-09T08:00:00Z",
    updated_at: "2025-01-09T10:00:00Z"
  },
  {
    cluster_id: "CL-002",
    name: "Helm Safety Area Konstruksi",
    representative_report_id: "HR-2025-020",
    member_report_ids: ["HR-2025-020", "HR-2025-021"],
    member_count: 2,
    geo_score: 92,
    lexical_score: 78,
    semantic_score: 82,
    final_score: 84,
    decision_status: 'confirmed_duplicate',
    created_at: "2025-01-11T09:00:00Z",
    updated_at: "2025-01-11T11:00:00Z"
  }
];

// Audit Logs
export const auditLogs: AuditLogEntry[] = [
  {
    id: "LOG-001",
    cluster_id: "CL-002",
    action: 'confirm_duplicate',
    user: "Admin Evaluator",
    timestamp: "2025-01-11T11:00:00Z",
    before_status: "pending",
    after_status: "confirmed_duplicate",
    notes: "Verified as same incident from different reporters."
  },
  {
    id: "LOG-002",
    cluster_id: "CL-001",
    report_id: "HR-2025-041",
    action: 'rerun_analysis',
    user: "Admin Evaluator",
    timestamp: "2025-01-09T09:30:00Z",
    before_status: "processing",
    after_status: "done",
    notes: "Re-run to update scores."
  }
];

// All reports combined
export const allDuplicateReports: DuplicateReport[] = [
  ...queueReports,
  ...geoReports,
  ...lexicalReports,
  ...semanticReports,
  ...finalReports
];
