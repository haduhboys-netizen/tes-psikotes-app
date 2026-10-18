export interface ProblemSolvingQuestion {
  id: number;
  scenario: string;
  question: string;
}

export const problemSolvingQuestions: ProblemSolvingQuestion[] = [
  {
    id: 1,
    scenario: "Skenario 1: Konflik Internal Organisasi",
    question: "Sebuah tim pelayanan mengalami perpecahan komunikasi karena perbedaan pandangan kepemimpinan. Langkah taktis dan prinsip kepemimpinan teologis apa yang akan Anda ambil untuk memulihkan sinergi tim?"
  },
  {
    id: 2,
    scenario: "Skenario 2: Dilema Etika & Integritas",
    question: "Anda menemukan adanya ketidaksesuaian laporan keuangan dalam proyek lapangan yang melibatkan senior Anda. Bagaimana Anda menyikapi hal ini secara bijak, kritis, dan berintegritas tanpa merusak hubungan?"
  },
  {
    id: 3,
    scenario: "Skenario 3: Krisis Respon Komunitas",
    question: "Masyarakat lokal menolak program observasi/pelayanan kelompok Anda karena kesalahpahaman budaya lokal. Bagaimana strategi pendekatan sosial-kultural yang akan Anda lakukan?"
  },
  {
    id: 4,
    scenario: "Skenario 4: Efisiensi & Prioritas Sumber Daya",
    question: "Proyek observasi lapangan Anda mengalami pemotongan anggaran mendadak sebesar 50% menjelang eksekusi. Keputusan prioritas apa yang Anda ambil agar tujuan utama proyek tetap tercapai?"
  },
  {
    id: 5,
    scenario: "Skenario 5: Evaluasi Dampak Praktis",
    question: "Bagaimana Anda mengukur bahwa hasil studi kasus dan rekomendasi yang Anda buat benar-benar memberikan dampak nyata (impactful) bagi komunitas sasaran?"
  }
];