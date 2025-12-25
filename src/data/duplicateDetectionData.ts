// AI Duplicate Detection - Enhanced Data Model for 3-Stage Analysis

export type DuplicateAnalysisStatus = 'waiting' | 'processing' | 'done' | 'error';

export interface GeoAnalysis {
  geo_cluster_id: string;
  geo_similarity_score: number;
  site_match: boolean;
  lokasi_match: boolean;
  detail_lokasi_match: boolean;
  distance_meters?: number;
  latitude?: number;
  longitude?: number;
  reason: string;
  status: DuplicateAnalysisStatus;
}

export interface LexicalAnalysis {
  lexical_score: number;
  matched_phrases: string[];
  ketidaksesuaian_match: boolean;
  sub_ketidaksesuaian_match: boolean;
  quick_action_match: boolean;
  deskripsi_overlap_pct: number;
  reason: string;
  status: DuplicateAnalysisStatus;
}

export interface SemanticAnalysis {
  semantic_score: number;
  visual_context_match: boolean;
  key_visual_signals: string[];
  vlm_objects_detected: string[];
  vlm_conditions_detected: string[];
  vlm_scene_type: string;
  has_image: boolean;
  reason: string;
  status: DuplicateAnalysisStatus;
}

export interface DuplicateCandidate {
  report_id: string;
  timestamp: string;
  pelapor: string;
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
  member_count: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'merged' | 'split';
}

export interface DuplicateReport {
  report_id: string;
  timestamp: string;
  pelapor: string;
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
  
  // Overall scores
  duplicate_score: number;
  geo_score: number;
  lexical_score: number;
  semantic_score: number;
  
  // Status
  status: 'waiting' | 'processing' | 'done' | 'error';
  error_message?: string;
  
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
  report_id: string;
  action: 'confirm_duplicate' | 'mark_non_duplicate' | 'merge_cluster' | 'split_cluster' | 'rerun_analysis' | 'change_representative';
  user_name: string;
  timestamp: string;
  previous_status: string;
  new_status: string;
  notes?: string;
}

// Mock Data
export const duplicateClusters: DuplicateCluster[] = [
  {
    cluster_id: "CL-001",
    name: "Pelanggaran Kecepatan Area Gerbang",
    representative_report_id: "HR-2025-336-23924",
    member_count: 3,
    created_at: "2025-12-10T08:00:00Z",
    updated_at: "2025-12-11T10:30:00Z",
    status: 'active'
  },
  {
    cluster_id: "CL-002",
    name: "Helm Safety Area Konstruksi",
    representative_report_id: "HR-2025-336-23920",
    member_count: 2,
    created_at: "2025-12-11T08:00:00Z",
    updated_at: "2025-12-11T09:00:00Z",
    status: 'active'
  },
  {
    cluster_id: "CL-003",
    name: "Kondisi Jalan Berlubang Pit 3",
    representative_report_id: "HR-2025-336-23922",
    member_count: 1,
    created_at: "2025-12-11T09:00:00Z",
    updated_at: "2025-12-11T09:00:00Z",
    status: 'active'
  }
];

export const duplicateReports: DuplicateReport[] = [
  {
    report_id: "HR-2025-336-23920",
    timestamp: "2025-12-11T08:00:00Z",
    pelapor: "Rudi Hartono",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Jalur Angkut Pit Selatan",
    latitude: -2.9876,
    longitude: 115.4321,
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    sub_ketidaksesuaian: "Tidak menggunakan APD sesuai standard",
    quick_action: "Warning",
    deskripsi_temuan: "Pekerja tidak menggunakan helm safety di area konstruksi. Terlihat 2 orang pekerja sedang melakukan loading material tanpa APD kepala.",
    keterangan_lokasi: "Dekat loading point utama, sebelah timur crusher",
    image_urls: ["/placeholder.svg"],
    duplicate_score: 85,
    geo_score: 92,
    lexical_score: 78,
    semantic_score: 82,
    status: 'done',
    geo_analysis: {
      geo_cluster_id: "GEO-001",
      geo_similarity_score: 92,
      site_match: true,
      lokasi_match: true,
      detail_lokasi_match: true,
      distance_meters: 42,
      latitude: -2.9876,
      longitude: 115.4321,
      reason: "Site sama (MINING PIT), lokasi sama (Hauling Road), detail lokasi identik. Jarak koordinat hanya 42 meter dari laporan serupa.",
      status: 'done'
    },
    lexical_analysis: {
      lexical_score: 78,
      matched_phrases: ["tidak menggunakan helm", "area konstruksi", "APD", "pekerja", "safety"],
      ketidaksesuaian_match: true,
      sub_ketidaksesuaian_match: true,
      quick_action_match: false,
      deskripsi_overlap_pct: 72,
      reason: "Ketidaksesuaian dan sub-ketidaksesuaian sama. Deskripsi memiliki 72% kesamaan kata dengan laporan HR-2025-336-23921. Frasa 'tidak menggunakan helm' dan 'area konstruksi' ditemukan di kedua laporan.",
      status: 'done'
    },
    semantic_analysis: {
      semantic_score: 82,
      visual_context_match: true,
      key_visual_signals: ["pekerja tanpa helm", "area loading", "material handling"],
      vlm_objects_detected: ["worker", "construction site", "loader", "materials"],
      vlm_conditions_detected: ["missing_helmet", "active_work", "daylight"],
      vlm_scene_type: "construction_loading_area",
      has_image: true,
      reason: "Gambar menunjukkan situasi serupa: pekerja tanpa helm di area konstruksi. VLM mendeteksi objek dan kondisi yang sangat mirip dengan laporan CL-002.",
      status: 'done'
    },
    cluster_id: "CL-002",
    candidates: [
      {
        report_id: "HR-2025-336-23921",
        timestamp: "2025-12-11T08:15:00Z",
        pelapor: "Sinta Dewi",
        site: "MINING PIT",
        lokasi: "Hauling Road",
        detail_lokasi: "Jalur Angkut Pit Selatan",
        deskripsi_temuan: "Karyawan tidak memakai helm saat bekerja di area konstruksi.",
        geo_score: 95,
        lexical_score: 82,
        semantic_score: 80,
        overall_score: 86,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'duplicate',
    ai_explanation: [
      "Lokasi identik dengan laporan HR-2025-336-23921 (jarak hanya 42m)",
      "Deskripsi temuan sangat mirip: keduanya melaporkan pekerja tanpa helm di area konstruksi",
      "Timestamp hanya berbeda 15 menit, kemungkinan besar kejadian yang sama"
    ]
  },
  {
    report_id: "HR-2025-336-23921",
    timestamp: "2025-12-11T08:15:00Z",
    pelapor: "Sinta Dewi",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Jalur Angkut Pit Selatan",
    latitude: -2.9878,
    longitude: 115.4323,
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    sub_ketidaksesuaian: "Tidak menggunakan APD sesuai standard",
    quick_action: "Safety Briefing",
    deskripsi_temuan: "Karyawan tidak memakai helm saat bekerja di area konstruksi. Satu orang terlihat di dekat excavator.",
    keterangan_lokasi: "Area loading, dekat excavator CAT 390",
    image_urls: ["/placeholder.svg"],
    duplicate_score: 86,
    geo_score: 95,
    lexical_score: 82,
    semantic_score: 80,
    status: 'waiting',
    cluster_id: "CL-002",
    candidates: [
      {
        report_id: "HR-2025-336-23920",
        timestamp: "2025-12-11T08:00:00Z",
        pelapor: "Rudi Hartono",
        site: "MINING PIT",
        lokasi: "Hauling Road",
        detail_lokasi: "Jalur Angkut Pit Selatan",
        deskripsi_temuan: "Pekerja tidak menggunakan helm safety di area konstruksi.",
        geo_score: 95,
        lexical_score: 82,
        semantic_score: 80,
        overall_score: 86,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'duplicate',
    ai_explanation: [
      "Laporan ini sangat mirip dengan HR-2025-336-23920",
      "Kemungkinan besar melaporkan kejadian yang sama dari sudut pandang berbeda",
      "Rekomendasi: gabungkan ke dalam cluster CL-002"
    ]
  },
  {
    report_id: "HR-2025-336-23922",
    timestamp: "2025-12-11T09:00:00Z",
    pelapor: "Ahmad Fauzi",
    site: "MINING PIT",
    lokasi: "Pit Area",
    detail_lokasi: "Pit 3 Section A",
    latitude: -2.9912,
    longitude: 115.4567,
    ketidaksesuaian: "Standar Road Management",
    sub_ketidaksesuaian: "Jalan berlubang pada hauling road",
    quick_action: "Road Maintenance",
    deskripsi_temuan: "Terdapat lubang di jalan hauling sekitar 40cm diameter dan 15cm kedalaman. Berpotensi membahayakan unit yang melintas.",
    keterangan_lokasi: "300m dari disposal, arah ke loading point",
    image_urls: ["/placeholder.svg"],
    duplicate_score: 58,
    geo_score: 72,
    lexical_score: 55,
    semantic_score: 48,
    status: 'processing',
    geo_analysis: {
      geo_cluster_id: "GEO-003",
      geo_similarity_score: 72,
      site_match: true,
      lokasi_match: false,
      detail_lokasi_match: false,
      distance_meters: 890,
      latitude: -2.9912,
      longitude: 115.4567,
      reason: "Site sama (MINING PIT), namun lokasi berbeda (Pit Area vs Hauling Road). Jarak 890m dari laporan lubang jalan sebelumnya.",
      status: 'done'
    },
    lexical_analysis: {
      lexical_score: 55,
      matched_phrases: ["jalan", "lubang", "hauling"],
      ketidaksesuaian_match: true,
      sub_ketidaksesuaian_match: true,
      quick_action_match: true,
      deskripsi_overlap_pct: 45,
      reason: "Ketidaksesuaian sama, namun deskripsi detail berbeda. Ukuran lubang (40cm vs 50cm) dan lokasi spesifik berbeda.",
      status: 'done'
    },
    semantic_analysis: {
      semantic_score: 48,
      visual_context_match: false,
      key_visual_signals: ["lubang jalan", "hauling road"],
      vlm_objects_detected: ["road", "pothole", "dust"],
      vlm_conditions_detected: ["road_damage", "dry_condition"],
      vlm_scene_type: "mining_road",
      has_image: true,
      reason: "Gambar menunjukkan lubang jalan berbeda - lokasi dan karakteristik visual tidak cocok dengan laporan sebelumnya.",
      status: 'processing'
    },
    cluster_id: "CL-003",
    candidates: [],
    ai_recommendation: 'potential_duplicate',
    ai_explanation: [
      "Kemungkinan laporan berbeda karena lokasi spesifik berbeda",
      "Namun tipe hazard sama (jalan berlubang) di area yang berdekatan",
      "Perlu validasi manual untuk memastikan"
    ]
  },
  {
    report_id: "HR-2025-336-23923",
    timestamp: "2025-12-10T10:30:00Z",
    pelapor: "Budi Santoso",
    site: "OFFICE AREA",
    lokasi: "Workshop",
    detail_lokasi: "Workshop Utama",
    ketidaksesuaian: "Perlengkapan Keselamatan",
    sub_ketidaksesuaian: "APD tidak lengkap",
    quick_action: "APD Check",
    deskripsi_temuan: "Teknisi tidak menggunakan sarung tangan saat bekerja dengan oli dan chemical.",
    keterangan_lokasi: "Workshop maintenance, bay 3",
    image_urls: [],
    duplicate_score: 35,
    geo_score: 28,
    lexical_score: 42,
    semantic_score: 35,
    status: 'done',
    geo_analysis: {
      geo_cluster_id: "GEO-004",
      geo_similarity_score: 28,
      site_match: false,
      lokasi_match: false,
      detail_lokasi_match: false,
      reason: "Site berbeda (OFFICE AREA vs MINING PIT). Tidak ada laporan serupa di area Workshop dalam 7 hari terakhir.",
      status: 'done'
    },
    lexical_analysis: {
      lexical_score: 42,
      matched_phrases: ["tidak menggunakan", "APD"],
      ketidaksesuaian_match: false,
      sub_ketidaksesuaian_match: false,
      quick_action_match: false,
      deskripsi_overlap_pct: 25,
      reason: "Hanya ada kesamaan umum dalam penggunaan kata APD. Konteks dan detail berbeda.",
      status: 'done'
    },
    semantic_analysis: {
      semantic_score: 35,
      visual_context_match: false,
      key_visual_signals: [],
      vlm_objects_detected: [],
      vlm_conditions_detected: [],
      vlm_scene_type: "unknown",
      has_image: false,
      reason: "Tidak ada gambar tersedia. Analisis semantic hanya berdasarkan teks, menunjukkan konteks yang berbeda.",
      status: 'done'
    },
    candidates: [],
    ai_recommendation: 'non_duplicate',
    ai_explanation: [
      "Lokasi berbeda (Workshop vs area mining)",
      "Tidak ada laporan serupa dalam radius dan timeframe yang relevan",
      "Laporan ini unik dan bukan duplicate"
    ]
  },
  {
    report_id: "HR-2025-336-23924",
    timestamp: "2025-12-10T11:00:00Z",
    pelapor: "Eka Putra",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Gerbang Utama Site",
    latitude: -2.9850,
    longitude: 115.4290,
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    sub_ketidaksesuaian: "Kecepatan melebihi batas",
    quick_action: "Warning",
    deskripsi_temuan: "Kendaraan LV melaju kencang di area gerbang, estimasi 45 km/jam di zona 30 km/jam.",
    keterangan_lokasi: "100m sebelum gerbang utama, arah masuk site",
    image_urls: ["/placeholder.svg"],
    duplicate_score: 91,
    geo_score: 94,
    lexical_score: 88,
    semantic_score: 90,
    status: 'done',
    geo_analysis: {
      geo_cluster_id: "GEO-001",
      geo_similarity_score: 94,
      site_match: true,
      lokasi_match: true,
      detail_lokasi_match: true,
      distance_meters: 85,
      latitude: -2.9850,
      longitude: 115.4290,
      reason: "Lokasi identik dengan HR-2025-336-23925. Kedua laporan di area gerbang utama, jarak hanya 85m.",
      status: 'done'
    },
    lexical_analysis: {
      lexical_score: 88,
      matched_phrases: ["kecepatan", "km/jam", "zona 30", "gerbang", "LV", "melaju"],
      ketidaksesuaian_match: true,
      sub_ketidaksesuaian_match: true,
      quick_action_match: true,
      deskripsi_overlap_pct: 78,
      reason: "Ketidaksesuaian, sub-ketidaksesuaian, dan quick action sama. Deskripsi sangat mirip dengan 78% kesamaan kata.",
      status: 'done'
    },
    semantic_analysis: {
      semantic_score: 90,
      visual_context_match: true,
      key_visual_signals: ["speeding vehicle", "gate area", "speed limit sign"],
      vlm_objects_detected: ["vehicle", "road", "gate", "speed_sign"],
      vlm_conditions_detected: ["speeding", "restricted_zone"],
      vlm_scene_type: "mine_entrance",
      has_image: true,
      reason: "Gambar menunjukkan situasi yang sangat mirip dengan HR-2025-336-23925. Kedua gambar menangkap kendaraan di area gerbang.",
      status: 'done'
    },
    cluster_id: "CL-001",
    candidates: [
      {
        report_id: "HR-2025-336-23925",
        timestamp: "2025-12-10T11:30:00Z",
        pelapor: "Agus Wijaya",
        site: "MINING PIT",
        lokasi: "Hauling Road",
        detail_lokasi: "Jalur Angkut Pit Utara",
        deskripsi_temuan: "LV melaju 50 km/jam di zona 30 km/jam dekat gerbang.",
        geo_score: 88,
        lexical_score: 90,
        semantic_score: 92,
        overall_score: 90,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'duplicate',
    ai_explanation: [
      "Laporan ini sangat mirip dengan HR-2025-336-23925 (skor 91%)",
      "Kemungkinan besar melaporkan insiden yang sama atau kendaraan yang sama",
      "Waktu laporan hanya berbeda 30 menit, lokasi sangat berdekatan"
    ]
  },
  {
    report_id: "HR-2025-336-23925",
    timestamp: "2025-12-10T11:30:00Z",
    pelapor: "Agus Wijaya",
    site: "MINING PIT",
    lokasi: "Hauling Road",
    detail_lokasi: "Jalur Angkut Pit Utara",
    latitude: -2.9855,
    longitude: 115.4295,
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    sub_ketidaksesuaian: "Kecepatan melebihi batas",
    quick_action: "Warning Letter",
    deskripsi_temuan: "LV melaju 50 km/jam di zona 30 km/jam dekat gerbang. Plat nomor tercatat B 1234 XYZ.",
    keterangan_lokasi: "Dekat pos jaga gerbang utama",
    image_urls: ["/placeholder.svg"],
    duplicate_score: 90,
    geo_score: 88,
    lexical_score: 90,
    semantic_score: 92,
    status: 'waiting',
    cluster_id: "CL-001",
    candidates: [
      {
        report_id: "HR-2025-336-23924",
        timestamp: "2025-12-10T11:00:00Z",
        pelapor: "Eka Putra",
        site: "MINING PIT",
        lokasi: "Hauling Road",
        detail_lokasi: "Gerbang Utama Site",
        deskripsi_temuan: "Kendaraan LV melaju kencang di area gerbang.",
        geo_score: 94,
        lexical_score: 88,
        semantic_score: 90,
        overall_score: 91,
        image_url: "/placeholder.svg"
      }
    ],
    ai_recommendation: 'duplicate',
    ai_explanation: [
      "Sangat mirip dengan HR-2025-336-23924",
      "Laporan mengacu pada insiden yang sama (speeding di gerbang)",
      "Rekomendasi: konfirmasi sebagai duplicate dan gabungkan cluster"
    ]
  },
  {
    report_id: "HR-2025-336-23926",
    timestamp: "2025-12-09T14:00:00Z",
    pelapor: "Dian Sari",
    site: "MARINE",
    lokasi: "Jetty",
    detail_lokasi: "Jetty Utama",
    ketidaksesuaian: "Bahaya Elektrikal",
    sub_ketidaksesuaian: "Kabel tidak terlindungi",
    quick_action: "Isolasi Area",
    deskripsi_temuan: "Kabel listrik terkelupas di area jetty, berpotensi kontak dengan air saat pasang.",
    keterangan_lokasi: "Sisi timur jetty, dekat crane 2",
    image_urls: ["/placeholder.svg"],
    duplicate_score: 22,
    geo_score: 18,
    lexical_score: 25,
    semantic_score: 24,
    status: 'error',
    error_message: "Gagal mengambil data gambar dari storage. Error: Connection timeout after 30s.",
    candidates: [],
    ai_recommendation: 'non_duplicate',
    ai_explanation: [
      "Analisis tidak lengkap karena error",
      "Berdasarkan data parsial, tidak ditemukan laporan serupa",
      "Perlu di-retry untuk hasil lengkap"
    ]
  }
];

export const auditLogs: AuditLogEntry[] = [
  {
    id: "LOG-001",
    report_id: "HR-2025-336-23920",
    action: 'confirm_duplicate',
    user_name: "Andi Supervisor",
    timestamp: "2025-12-11T10:30:00Z",
    previous_status: "potential_duplicate",
    new_status: "confirmed_duplicate",
    notes: "Dikonfirmasi setelah validasi visual dengan laporan HR-2025-336-23921"
  },
  {
    id: "LOG-002",
    report_id: "HR-2025-336-23924",
    action: 'merge_cluster',
    user_name: "Budi Evaluator",
    timestamp: "2025-12-10T15:00:00Z",
    previous_status: "CL-001",
    new_status: "CL-001 (merged with CL-005)",
    notes: "Menggabungkan cluster kecepatan area gerbang"
  }
];
