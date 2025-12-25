export interface KetidaksesuaianItem {
  ketidaksesuaian: string;
  sub_ketidaksesuaian: string[];
}

export const ketidaksesuaianData: KetidaksesuaianItem[] = [
  {
    ketidaksesuaian: "Pembelian, Penanganan bahan dan kendali bahan",
    sub_ketidaksesuaian: ["Penyimpanan bahan tidak tepat"]
  },
  {
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    sub_ketidaksesuaian: ["Tidak menggunakan APD sesuai standard"]
  },
  {
    ketidaksesuaian: "Kelayakan/Penggunaan Tools",
    sub_ketidaksesuaian: ["Kesesuaian penggunaan Supporting Tools"]
  },
  {
    ketidaksesuaian: "Pengelolaan Sampah",
    sub_ketidaksesuaian: ["[ENV] Sampah dibuang tidak pada tempat sampah"]
  },
  {
    ketidaksesuaian: "Perlengkapan_Mesin_atau_Peralatan",
    sub_ketidaksesuaian: [
      "Pelepasan komponen-komponen yang tidak memadai",
      "Penggantian komponen yang tidak sesuai",
      "Penyesuaian / perbaikan / pemeliharaan yang tidak memadai"
    ]
  },
  {
    ketidaksesuaian: "Kelengkapan tanggap darurat",
    sub_ketidaksesuaian: ["Alat Tanggap Darurat belum dilakukan inspeksi"]
  },
  {
    ketidaksesuaian: "Standar Road Management",
    sub_ketidaksesuaian: ["Drainase tersumbat pada jalan angkut"]
  },
  {
    ketidaksesuaian: "Perawatan Jalan",
    sub_ketidaksesuaian: ["Boulder"]
  },
  {
    ketidaksesuaian: "Bahaya Elektrikal",
    sub_ketidaksesuaian: ["Pengamanan peralatan listrik tidak memadai"]
  }
];
