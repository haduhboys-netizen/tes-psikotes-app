export interface EssayQuestion {
  id: number;
  question: string;
}

export interface QuestionGroup {
  groupId: number;
  title: string;
  subTitle: string;
  questions: EssayQuestion[];
}

export const fontEssayGroups: QuestionGroup[] = [
  {
    groupId: 1,
    title: "Kelompok 1",
    subTitle: "Eksistensi Mendahului Esensi",
    questions: [
      { id: 1, question: "Apa yang akan anda lakukan untuk membangkitkan kesadaran jiwa yang penuh makna dan sirat akan tujuan hidup di tengah kehidupan yang penuh cobaan?" },
      { id: 2, question: "Apa solusi anda dalam mengembangkan kesadaran spiritual dengan tanggung jawab sosial?" },
      { id: 3, question: "Apa sikap anda dalam menentukan jalan kebebasan yang telah diberikan Tuhan untuk berkembang, guna menciptakan jati diri yang mempunyai mentalitas tangguh?" },
      { id: 4, question: "Apa yang membuat seseorang tidak perlu terkenal untuk dikenal, dan apa bahaya validasi yang berlebihan bagi keimanan?" },
      { id: 5, question: "Apa ciri seseorang yang memiliki karakteristik autentik dan tidak terkunci oleh norma sosial atau lingkungan?" },
    ],
  },
  {
    groupId: 2,
    title: "Kelompok 2",
    subTitle: "Keimanan untuk Mengenali Diri / Tazkiyatun Nafs",
    questions: [
      { id: 1, question: "Apa dua unsur kepemilikan yang Tuhan ciptakan pada setiap manusia, dan apa kaitannya dengan proses mengenali diri?" },
      { id: 2, question: "Apa saja hal yang merusak diri menurut materi tazkiyatun nafs?" },
      { id: 3, question: "Apa peran ilmu agama dalam menjaga hati dari kebodohan, syubhat, dan bisikan setan?" },
      { id: 4, question: "Apa dampak teman dan lingkungan yang buruk terhadap ruh seseorang?" },
      { id: 5, question: "Apa makna ungkapan \"perjalanan mengenali diri sendiri adalah pulang\", dan apa arti Tuhan lebih dekat dari urat nadi?" },
    ],
  },
  {
    groupId: 3,
    title: "Kelompok 3",
    subTitle: "Penyebab Kehilangan Semangat dan Solusi Etos Usaha",
    questions: [
      { id: 1, question: "Apa perbedaan System 1 dan System 2 dalam teori Daniel Kahneman, dan bagaimana keduanya memengaruhi pola pikir generasi muda?" },
      { id: 2, question: "Apa penyebab anak muda mudah terjebak budaya instan, dan apa dampaknya terhadap standar sosial modern?" },
      { id: 3, question: "Apa yang dimaksud dengan tameng kognitif, dan mengapa disebut sebagai bentuk krisis keimanan?" },
      { id: 4, question: "Apa langkah melatih otak berpikir logis serta menekan dampak buruk media sosial dan logical fallacy?" },
      { id: 5, question: "Apa cara mengurangi stres dan depresi akibat standar sosial modern melalui pemahaman diri dan lingkungan positif?" },
    ],
  },
  {
    groupId: 4,
    title: "Kelompok 4",
    subTitle: "Kebangkitan Jiwa dan Transendensi Spiritual",
    questions: [
      { id: 1, question: "Apa alasan stimulus luar seperti seminar atau tren gagal membangkitkan kesadaran sejati, dan mengapa kebangkitan harus dilakukan secara individual (ego death)?" },
      { id: 2, question: "Apa tiga pertanyaan yang perlu diajukan manusia agar menjadi sadar?" },
      { id: 3, question: "Apa peran niat, doa, dan altruisme transendental dalam mengaktifkan System 2 dan melawan rasa malas?" },
      { id: 4, question: "Apa maksud ungkapan \"jiwa sebagai nahkoda, otak sebagai mesin\"?" },
      { id: 5, question: "Apa tahapan Action Epistemologi (teleologi, etika, dan teknis) dalam retrograde propulsive thinking, dan bagaimana tahapan itu membantu menghalau crisis of faith?" },
    ],
  },
  {
    groupId: 5,
    title: "Kelompok 5",
    subTitle: "Realisasi kepada Lingkungan Sekitar",
    questions: [
      { id: 1, question: "Apa yang dimaksud dengan mengembangkan kajian teologis berlandaskan teori psikososial dan nilai ajaran teologi Islam?" },
      { id: 2, question: "Apa itu planning fallacy, dan mengapa rencana kontinjensi diperlukan dalam sebuah program?" },
      { id: 3, question: "Apa peran filosofi Sankofa dalam membangun strategi ajaran dan manajemen krisis?" },
      { id: 4, question: "Apa saja yang perlu dipetakan dalam pemetaan ruang digital publik untuk memahami hal yang mengisolasi jiwa generasi muda?" },
      { id: 5, question: "Apa bentuk kontribusi nyata dan dampak berkelanjutan dari pengajaran batiniah (bukan dogma kosong) bagi humanisme sosial masyarakat?" },
    ],
  }
];