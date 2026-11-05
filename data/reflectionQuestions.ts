export interface ReflectionOption {
  label: string;
  text: string;
  type: string;
}

export interface ReflectionQuestion {
  id: number;
  category: string;
  text: string;
  options: ReflectionOption[];
}

export const reflectionQuestions: ReflectionQuestion[] = [
  {
    id: 1,
    category: "Refleksi Diri",
    text: "Saat sendirian dengan pikiran saya, saya cenderung merenungkan makna mendalam di balik kejadian yang saya alami.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Meaning Seeker' },
      { label: 'B', text: 'Setuju', type: 'Meaning Seeker' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Self-Protector' }
    ]
  },
  {
    id: 2,
    category: "Refleksi Diri",
    text: "Saya merasa lebih nyaman menganalisis segala risiko sebelum mengambil tindakan nyata.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Overthinker' },
      { label: 'B', text: 'Setuju', type: 'Deep Thinker' },
      { label: 'C', text: 'Netral', type: 'Action Builder' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Self-Protector' }
    ]
  },
  {
    id: 3,
    category: "Refleksi Diri",
    text: "Ketika terjadi perubahan mendadak, fokus utama saya adalah memastikan posisi dan peran saya tetap aman.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Self-Protector' },
      { label: 'B', text: 'Setuju', type: 'Self-Protector' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Meaning Seeker' }
    ]
  },
  {
    id: 4,
    category: "Refleksi Diri",
    text: "Saya lebih menyukai eksekusi tindakan cepat di lapangan ketimbang perdebatan teori yang panjang.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Action Builder' },
      { label: 'B', text: 'Setuju', type: 'Action Builder' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Deep Thinker' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Meaning Seeker' }
    ]
  },
  {
    id: 5,
    category: "Refleksi Diri",
    text: "Saya sering memutar ulang kejadian masa lalu di dalam pikiran untuk menemukan di mana letak kesalahan saya.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Overthinker' },
      { label: 'B', text: 'Setuju', type: 'Overthinker' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Self-Protector' }
    ]
  },
  {
    id: 6,
    category: "Refleksi Diri",
    text: "Bagi saya, kejujuran pada nilai etika dan moral jauh lebih utama dibanding sekadar mencapai target cepat.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Meaning Seeker' },
      { label: 'B', text: 'Setuju', type: 'Meaning Seeker' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Self-Protector' }
    ]
  },
  {
    id: 7,
    category: "Refleksi Diri",
    text: "Saya cenderung berhati-hati dalam menyampaikan pandangan agar tidak memicu perbedaan pendapat.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Self-Protector' },
      { label: 'B', text: 'Setuju', type: 'Self-Protector' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Action Builder' }
    ]
  },
  {
    id: 8,
    category: "Refleksi Diri",
    text: "Saat menghadapi masalah rumit, saya selalu mencoba memecahnya menjadi bagian-bagian logis secara sistematis.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Deep Thinker' },
      { label: 'B', text: 'Setuju', type: 'Deep Thinker' },
      { label: 'C', text: 'Netral', type: 'Meaning Seeker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Overthinker' }
    ]
  },
  {
    id: 9,
    category: "Refleksi Diri",
    text: "Saya mudah merasa cemas jika rencana kerja yang sudah disusun mengalami hambatan yang tidak terduga.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Overthinker' },
      { label: 'B', text: 'Setuju', type: 'Overthinker' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Action Builder' }
    ]
  },
  {
    id: 10,
    category: "Refleksi Diri",
    text: "Membantu orang lain menemukan tujuan dan motivasi hidup memberikan kepuasan batin yang mendalam bagi saya.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Meaning Seeker' },
      { label: 'B', text: 'Setuju', type: 'Meaning Seeker' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Self-Protector' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Self-Protector' }
    ]
  },
  {
    id: 11,
    category: "Refleksi Diri",
    text: "Saya merasa lebih berenergi ketika langsung mempraktikkan ide baru daripada sekadar membacanya.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Action Builder' },
      { label: 'B', text: 'Setuju', type: 'Action Builder' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Deep Thinker' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Overthinker' }
    ]
  },
  {
    id: 12,
    category: "Refleksi Diri",
    text: "Saya butuh waktu lebih lama dari orang lain untuk memastikan bahwa keputusan yang saya buat sudah benar-benar aman.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Self-Protector' },
      { label: 'B', text: 'Setuju', type: 'Self-Protector' },
      { label: 'C', text: 'Netral', type: 'Overthinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Action Builder' }
    ]
  },
  {
    id: 13,
    category: "Refleksi Diri",
    text: "Kritik dari orang lain sering kali membuat saya terus memikirkan kekurangan diri dalam waktu yang cukup lama.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Overthinker' },
      { label: 'B', text: 'Setuju', type: 'Overthinker' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Self-Protector' }
    ]
  },
  {
    id: 14,
    category: "Refleksi Diri",
    text: "Saya meyakini bahwa setiap kesulitan hidup selalu membawa hikmah besar yang mendewasakan.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Meaning Seeker' },
      { label: 'B', text: 'Setuju', type: 'Meaning Seeker' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Self-Protector' }
    ]
  },
  {
    id: 15,
    category: "Refleksi Diri",
    text: "Saya mengandalkan data empiris dan fakta objektif sebagai dasar utama dalam menilai suatu fenomena.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Deep Thinker' },
      { label: 'B', text: 'Setuju', type: 'Deep Thinker' },
      { label: 'C', text: 'Netral', type: 'Meaning Seeker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Overthinker' }
    ]
  },
  {
    id: 16,
    category: "Refleksi Diri",
    text: "Saya lebih memilih bertahan pada metode yang sudah teruji aman daripada mengambil risiko mencoba hal baru.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Self-Protector' },
      { label: 'B', text: 'Setuju', type: 'Self-Protector' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Action Builder' }
    ]
  },
  {
    id: 17,
    category: "Refleksi Diri",
    text: "Bagi saya, keberhasilan suatu proyek diukur langsung dari wujud hasil nyata yang diselesaikan.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Action Builder' },
      { label: 'B', text: 'Setuju', type: 'Action Builder' },
      { label: 'C', text: 'Netral', type: 'Deep Thinker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Meaning Seeker' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Meaning Seeker' }
    ]
  },
  {
    id: 18,
    category: "Refleksi Diri",
    text: "Saya sering merasa ragu untuk melangkah karena membayangkan berbagai kemungkinan skenario buruk.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Overthinker' },
      { label: 'B', text: 'Setuju', type: 'Overthinker' },
      { label: 'C', text: 'Netral', type: 'Self-Protector' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Action Builder' }
    ]
  },
  {
    id: 19,
    category: "Refleksi Diri",
    text: "Saya merasa penting untuk terus memperdalam struktur teori dan keilmuan sebelum terjun ke praktek.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Deep Thinker' },
      { label: 'B', text: 'Setuju', type: 'Deep Thinker' },
      { label: 'C', text: 'Netral', type: 'Meaning Seeker' },
      { label: 'D', text: 'Tidak Setuju', type: 'Action Builder' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Action Builder' }
    ]
  },
  {
    id: 20,
    category: "Refleksi Diri",
    text: "Keharmonisan dan rasa saling menghargai dalam kelompok jauh lebih berharga daripada memenangkan perdebatan.",
    options: [
      { label: 'A', text: 'Sangat Setuju', type: 'Meaning Seeker' },
      { label: 'B', text: 'Setuju', type: 'Meaning Seeker' },
      { label: 'C', text: 'Netral', type: 'Self-Protector' },
      { label: 'D', text: 'Tidak Setuju', type: 'Deep Thinker' },
      { label: 'E', text: 'Sangat Tidak Setuju', type: 'Action Builder' }
    ]
  }
];