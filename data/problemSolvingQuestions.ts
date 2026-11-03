export interface ProblemSolvingItem {
  id: number;
  title: string;
  case: string;
  question: string;
}

export const PROBLEM_SOLVING_QUESTIONS: ProblemSolvingItem[] = [
  {
    id: 1,
    title: "Kasus 1: Konflik Internal Tim",
    case: "Dua anggota tim Anda mengalami perselisihan pendapat yang tajam terkait arah program kerja. Satu pihak menginginkan pendekatan konservatif, sementara pihak lain menuntut inovasi radikal. Akibatnya, proyek terhenti selama dua minggu.",
    question: "Langkah-langkah taktis dan penyelesaian seperti apa yang akan Anda ambil untuk menyelesaikan konflik ini secara adil?"
  },
  {
    id: 2,
    title: "Kasus 2: Pelanggaran Etika & Kejujuran",
    case: "Anda menemukan fakta bahwa rekan kerja senior yang dipercaya melakukan manipulasi data laporan demi menjaga reputasi organisasi di mata donatur/publik.",
    question: "Bagaimana Anda mengambil keputusan antara menjaga loyalitas kelompok dengan menegakkan etika dan kejujuran?"
  },
  {
    id: 3,
    title: "Kasus 3: Ketersediaan Sumber Daya Terbatas",
    case: "Organisasi Anda diamanahkan menjalankan program pelayanan di daerah terpencil dengan dana dan SDM yang mendadak dipangkas hingga 50% menjelang eksekusi.",
    question: "Bagaimana strategi penyesuaian (prioritas & kompromi) yang akan Anda terapkan agar tujuan utama program tetap tercapai?"
  },
  {
    id: 4,
    title: "Kasus 4: Penolakan Komunitas Lokal",
    case: "Rencana program sosial/kemanusiaan yang sudah disusun matang mendapat penolakan keras dari tokoh atau sebagian masyarakat setempat karena isu miskomunikasi budaya.",
    question: "Pendekatan komunikasi dan sosialisasi seperti apa yang akan Anda lakukan untuk meredam ketegangan dan membangun kepercayaan ulang?"
  },
  {
    id: 5,
    title: "Kasus 5: Krisis Kepemimpinan & Tekanan Waktu",
    case: "Ketua pelaksana mendadak mengundurkan diri 3 hari sebelum acara puncak karena kendala pribadi, sementara seluruh anggota tim kehilangan arah dan merasa panik.",
    question: "Langkah kepemimpinan krisis apa yang akan Anda ambil dalam 24 jam pertama untuk memulihkan kendali dan koordinasi tim?"
  }
];