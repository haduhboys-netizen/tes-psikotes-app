export interface ReflectionOption {
  label: string;
  text: string;
  type: 'Self-Protector' | 'Deep Thinker' | 'Meaning Seeker' | 'Overthinker' | 'Action Builder';
}

export interface ReflectionQuestion {
  id: number;
  dimension: 'Inner World' | 'Reality & Limits' | 'Action & Growth' | 'Faith & Meaning' | 'Self & Others';
  question: string;
  options: ReflectionOption[];
}

export const reflectionQuestions: ReflectionQuestion[] = [
  // --- DIMENSI 1: INNER WORLD (Soal 1-5) ---
  {
    id: 1,
    dimension: 'Inner World',
    question: 'Saat sendirian dengan pikiranku, aku biasanya...',
    options: [
      { label: 'A', text: 'Menggali makna di balik perasaanku', type: 'Meaning Seeker' },
      { label: 'B', text: 'Memutar ulang hal yang sama berulang kali', type: 'Overthinker' },
      { label: 'C', text: 'Mengalihkan diri agar tidak merasa rapuh', type: 'Self-Protector' },
      { label: 'D', text: 'Menyusun hal konkret yang bisa kulakukan', type: 'Action Builder' },
      { label: 'E', text: 'Bertanya apa pesan mendalam di baliknya', type: 'Deep Thinker' },
    ]
  },
  {
    id: 2,
    dimension: 'Inner World',
    question: 'Ketika suasana hatiku tiba-tiba turun...',
    options: [
      { label: 'A', text: 'Kubayangkan hal terburuk yang bisa terjadi', type: 'Overthinker' },
      { label: 'B', text: 'Kupendam dan tampil biasa saja di luar', type: 'Self-Protector' },
      { label: 'C', text: 'Kubergerak dulu agar suasana hati membaik', type: 'Action Builder' },
      { label: 'D', text: 'Kuberi waktu untuk merenung dan berdoa', type: 'Meaning Seeker' },
      { label: 'E', text: 'Kucari pemicunya dengan tenang dan rasional', type: 'Deep Thinker' },
    ]
  },
  {
    id: 3,
    dimension: 'Inner World',
    question: 'Suara di kepalaku paling sering berkata...',
    options: [
      { label: 'A', text: '"Lebih aman jangan terlalu berharap."', type: 'Self-Protector' },
      { label: 'B', text: '"Mulai saja, perbaiki sambil jalan."', type: 'Action Builder' },
      { label: 'C', text: '"Apa arti semua perjalanan ini bagiku?"', type: 'Meaning Seeker' },
      { label: 'D', text: '"Pahami dulu lebih dalam sebelum melangkah."', type: 'Deep Thinker' },
      { label: 'E', text: '"Bagaimana kalau aku mengambil keputusan yang salah?"', type: 'Overthinker' },
    ]
  },
  {
    id: 4,
    dimension: 'Inner World',
    question: 'Perasaan yang sulit kuungkapkan biasanya kuhadapi dengan...',
    options: [
      { label: 'A', text: 'Mencari solusi praktis dan eksekusi langsung', type: 'Action Builder' },
      { label: 'B', text: 'Menyerahkannya lewat doa atau ibadah', type: 'Meaning Seeker' },
      { label: 'C', text: 'Menulis atau merenungkannya secara mendalam', type: 'Deep Thinker' },
      { label: 'D', text: 'Memikirkannya terus-menerus sampai lelah', type: 'Overthinker' },
      { label: 'E', text: 'Menutupinya dengan candaan atau kesibukan', type: 'Self-Protector' },
    ]
  },
  {
    id: 5,
    dimension: 'Inner World',
    question: 'Malam sebelum tidur, aku cenderung...',
    options: [
      { label: 'A', text: 'Bersyukur dan mencari hikmah dari hari ini', type: 'Meaning Seeker' },
      { label: 'B', text: 'Mengurai detail kejadian hari ini satu per satu', type: 'Deep Thinker' },
      { label: 'C', text: 'Cemas memikirkan hal-hal esok hari', type: 'Overthinker' },
      { label: 'D', text: 'Menggulir ponsel agar tidak memikirkan apa pun', type: 'Self-Protector' },
      { label: 'E', text: 'Menyiapkan rencana & target aksi besok', type: 'Action Builder' },
    ]
  },

  // --- DIMENSI 2: REALITY & LIMITS (Soal 6-10) ---
  {
    id: 6,
    dimension: 'Reality & Limits',
    question: 'Ketika ada batasan nyata (waktu, biaya, kondisi), aku...',
    options: [
      { label: 'A', text: 'Mempelajarinya dengan jernih dan objektif', type: 'Deep Thinker' },
      { label: 'B', text: 'Merasa batasannya jauh lebih besar dari kenyataan', type: 'Overthinker' },
      { label: 'C', text: 'Menjadikannya alasan aman untuk tidak mencoba', type: 'Self-Protector' },
      { label: 'D', text: 'Mencari celah praktis yang masih bisa digerakkan', type: 'Action Builder' },
      { label: 'E', text: 'Menerimanya sambil mencari nilai pembelajaran di dalamnya', type: 'Meaning Seeker' },
    ]
  },
  {
    id: 7,
    dimension: 'Reality & Limits',
    question: 'Kalimat yang paling mirip dengan keyakinanku saat ini...',
    options: [
      { label: 'A', text: '"Aku belum cukup siap untuk melangkah."', type: 'Overthinker' },
      { label: 'B', text: '"Lebih baik tidak usah jika ada risiko gagal."', type: 'Self-Protector' },
      { label: 'C', text: '"Batas bisa digeser lewat kerja keras konkret."', type: 'Action Builder' },
      { label: 'D', text: '"Ada hal di luar kendaliku, dan itu tak apa."', type: 'Meaning Seeker' },
      { label: 'E', text: '"Banyak hal tak sesederhana kelihatannya."', type: 'Deep Thinker' },
    ]
  },
  {
    id: 8,
    dimension: 'Reality & Limits',
    question: 'Saat rencanaku gagal di tengah jalan...',
    options: [
      { label: 'A', text: 'Kuanggap memang bukan takdirku', type: 'Self-Protector' },
      { label: 'B', text: 'Kuperbaiki taktiknya dan kucoba lagi', type: 'Action Builder' },
      { label: 'C', text: 'Kucari pelajaran spiritualnya lalu ikhlas', type: 'Meaning Seeker' },
      { label: 'D', text: 'Kuanalisis faktor apa yang sebenarnya terjadi', type: 'Deep Thinker' },
      { label: 'E', text: 'Kusalahkan diriku berlarut-larut', type: 'Overthinker' },
    ]
  },
  {
    id: 9,
    dimension: 'Reality & Limits',
    question: 'Aku menganggap sesuatu "mustahil" ketika...',
    options: [
      { label: 'A', text: 'Hampir tidak pernah, selama belum kucoba langsung', type: 'Action Builder' },
      { label: 'B', text: 'Tampak bertentangan dengan prinsip atau nilai hidupku', type: 'Meaning Seeker' },
      { label: 'C', text: 'Datanya belum kupahami secara komprehensif', type: 'Deep Thinker' },
      { label: 'D', text: 'Aku membayangkan terlalu banyak potensi risiko', type: 'Overthinker' },
      { label: 'E', text: 'Aku takut dinilai gagal oleh orang lain', type: 'Self-Protector' },
    ]
  },
  {
    id: 10,
    dimension: 'Reality & Limits',
    question: 'Menghadapi ketidakpastian hidup, aku...',
    options: [
      { label: 'A', text: 'Berusaha tenang dan percaya pada proses Tuhan', type: 'Meaning Seeker' },
      { label: 'B', text: 'Menimbang berbagai kemungkinan skenario logika', type: 'Deep Thinker' },
      { label: 'C', text: 'Sulit tenang sebelum semuanya serba jelas', type: 'Overthinker' },
      { label: 'D', text: 'Menjaga jarak agar tidak terlalu kecewa', type: 'Self-Protector' },
      { label: 'E', text: 'Mengambil langkah kecil dulu untuk menguji', type: 'Action Builder' },
    ]
  },

  // --- DIMENSI 3: ACTION & GROWTH (Soal 11-15) ---
  {
    id: 11,
    dimension: 'Action & Growth',
    question: 'Ketika punya ide atau gagasan baru...',
    options: [
      { label: 'A', text: 'Kurenungkan dari banyak sudut pandang dulu', type: 'Deep Thinker' },
      { label: 'B', text: 'Kutunda karena khawatir belum matang sepenuhnya', type: 'Overthinker' },
      { label: 'C', text: 'Kusimpan sendiri agar tidak dikritik orang', type: 'Self-Protector' },
      { label: 'D', text: 'Langsung kubuat versi kecilnya untuk dites', type: 'Action Builder' },
      { label: 'E', text: 'Kutanya apakah ide ini membawa kebaikan bagi sesama', type: 'Meaning Seeker' },
    ]
  },
  {
    id: 12,
    dimension: 'Action & Growth',
    question: 'Kebiasaan yang paling sering menghambat pertumbuhanku...',
    options: [
      { label: 'A', text: 'Terlalu banyak membayangkan scenario "bagaimana jika"', type: 'Overthinker' },
      { label: 'B', text: 'Menghindari situasi baru yang berisiko', type: 'Self-Protector' },
      { label: 'C', text: 'Terlalu cepat bergerak tanpa jeda evaluasi', type: 'Action Builder' },
      { label: 'D', text: 'Menunggu "tanda" atau momen yang benar-benar pas', type: 'Meaning Seeker' },
      { label: 'E', text: 'Terlalu lama menganalisis teori', type: 'Deep Thinker' },
    ]
  },
  {
    id: 13,
    dimension: 'Action & Growth',
    question: 'Saat mendapat masukan atau kritik keras...',
    options: [
      { label: 'A', text: 'Kutup diri agar tidak terlalu terluka', type: 'Self-Protector' },
      { label: 'B', text: 'Kuambil bagian yang praktis lalu perbaiki', type: 'Action Builder' },
      { label: 'C', text: 'Kulihat sebagai bahan pendewasaan diri', type: 'Meaning Seeker' },
      { label: 'D', text: 'Kupertimbangkan isinya secara rasional dan objektif', type: 'Deep Thinker' },
      { label: 'E', text: 'Teringat terus dan kupikirkan berhari-hari', type: 'Overthinker' },
    ]
  },
  {
    id: 14,
    dimension: 'Action & Growth',
    question: 'Target jangka panjangku biasanya...',
    options: [
      { label: 'A', text: 'Kupech jadi langkah-langkah mingguan konkret', type: 'Action Builder' },
      { label: 'B', text: 'Kuselaras kan dengan tujuan hidup yang lebih besar', type: 'Meaning Seeker' },
      { label: 'C', text: 'Jelas di kepala, tapi jarang kutuliskan spesifik', type: 'Deep Thinker' },
      { label: 'D', text: 'Sering berubah karena aku sering ragu', type: 'Overthinker' },
      { label: 'E', text: 'Kubuat sangat minim risiko agar tetap aman', type: 'Self-Protector' },
    ]
  },
  {
    id: 15,
    dimension: 'Action & Growth',
    question: 'Jika energiku rendah tetapi tugas menumpuk...',
    options: [
      { label: 'A', text: 'Kuistirahatkan diri dulu lalu kuluruskan niat', type: 'Meaning Seeker' },
      { label: 'B', text: 'Kupilah mana yang benar-benar prioritas kritis', type: 'Deep Thinker' },
      { label: 'C', text: 'Kewalahan dan bingung harus mulai dari mana', type: 'Overthinker' },
      { label: 'D', text: 'Kutarik diri sementara dari hiruk-pikuk', type: 'Self-Protector' },
      { label: 'E', text: 'Kukerjakan satu hal terkecil dulu tanpa pikir panjang', type: 'Action Builder' },
    ]
  },

  // --- DIMENSI 4: FAITH & MEANING (Soal 16-20) ---
  {
    id: 16,
    dimension: 'Faith & Meaning',
    question: 'Saat menghadapi masalah besar, pertanyaan pertamaku...',
    options: [
      { label: 'A', text: '"Apa akar utama permasalahannya?"', type: 'Deep Thinker' },
      { label: 'B', text: '"Kenapa hal sulit ini harus terjadi padaku?"', type: 'Overthinker' },
      { label: 'C', text: '"Bagaimana agar diriku tidak terlalu terdampak?"', type: 'Self-Protector' },
      { label: 'D', text: '"Langkah konkret apa yang bisa kulakukan hari ini?"', type: 'Action Builder' },
      { label: 'E', text: '"Apa hikmah yang ingin diajarkan lewat peristiwa ini?"', type: 'Meaning Seeker' },
    ]
  },
  {
    id: 17,
    dimension: 'Faith & Meaning',
    question: 'Bagiku, doa paling sering menjadi...',
    options: [
      { label: 'A', text: 'Tempat mengadu saat kecemasan memuncak', type: 'Overthinker' },
      { label: 'B', text: 'Pelarian saat merasa tak ada jalan lain lagi', type: 'Self-Protector' },
      { label: 'C', text: 'Pengiring dan penguat setelah aku berusaha keras', type: 'Action Builder' },
      { label: 'D', text: 'Sumber kekuatan utama dan pemandu arah hidup', type: 'Meaning Seeker' },
      { label: 'E', text: 'Ruang tenang untuk merenung dan kontemplasi', type: 'Deep Thinker' },
    ]
  },
  {
    id: 18,
    dimension: 'Faith & Meaning',
    question: 'Soal konsep tawakal/berserah diri, menurutku...',
    options: [
      { label: 'A', text: 'Kadang jadi alasan pasrah tanpa usaha maksimal', type: 'Self-Protector' },
      { label: 'B', text: 'Dilakukan setelah ikhtiar fisik selesai dilakukan', type: 'Action Builder' },
      { label: 'C', text: 'Ketenangan menyerahkan hasil setelah berjuang', type: 'Meaning Seeker' },
      { label: 'D', text: 'Perlu dipahami hubungan sebab-akibatnya secara utuh', type: 'Deep Thinker' },
      { label: 'E', text: 'Sulit, karena aku ingin semuanya berada di bawah kendaliku', type: 'Overthinker' },
    ]
  },
  {
    id: 19,
    dimension: 'Faith & Meaning',
    question: 'Saat kehidupan terasa "datar" atau membosankan...',
    options: [
      { label: 'A', text: 'Kucari tantangan atau proyek baru', type: 'Action Builder' },
      { label: 'B', text: 'Kucari kembali tujuan dan makna keberadaanku', type: 'Meaning Seeker' },
      { label: 'C', text: 'Kupertanyakan nilai dan sudut pandang yang kupegang', type: 'Deep Thinker' },
      { label: 'D', text: 'Kuragukan apakah pilihan hidupku selama ini sudah benar', type: 'Overthinker' },
      { label: 'E', text: 'Kuhindari memikirkannya dan jalani saja apa adanya', type: 'Self-Protector' },
    ]
  },
  {
    id: 20,
    dimension: 'Faith & Meaning',
    question: 'Arti rasa syukur bagiku adalah...',
    options: [
      { label: 'A', text: 'Fondasi utama dalam menjalani setiap hari', type: 'Meaning Seeker' },
      { label: 'B', text: 'Hasil menyadari dan mengamati hal-hal kecil', type: 'Deep Thinker' },
      { label: 'C', text: 'Sulit hadir saat pikiran sedang sangat ramai', type: 'Overthinker' },
      { label: 'D', text: 'Kadang kupakai untuk menekan keluhan di dalam', type: 'Self-Protector' },
      { label: 'E', text: 'Dorongan nyata untuk berbuat lebih baik lagi', type: 'Action Builder' },
    ]
  },

  // --- DIMENSI 5: SELF & OTHERS (Soal 21-25) ---
  {
    id: 21,
    dimension: 'Self & Others',
    question: 'Dalam kelompok atau lingkungan baru, aku biasanya...',
    options: [
      { label: 'A', text: 'Mengamati dulu pola & karakter sebelum banyak bicara', type: 'Deep Thinker' },
      { label: 'B', text: 'Menebak-nebak penilaian orang lain terhadapku', type: 'Overthinker' },
      { label: 'C', text: 'Menjaga jarak sampai merasa benar-benar aman', type: 'Self-Protector' },
      { label: 'D', text: 'Langsung mengambil peran dan memulai percakapan', type: 'Action Builder' },
      { label: 'E', text: 'Mencari kedalaman dan nilai bersama dalam komunikasi', type: 'Meaning Seeker' },
    ]
  },
  {
    id: 22,
    dimension: 'Self & Others',
    question: 'Ketika temanku berhasil lebih dulu...',
    options: [
      { label: 'A', text: 'Membandingkan diri dan merasa tertinggal jauh', type: 'Overthinker' },
      { label: 'B', text: 'Menjauh sementara agar tidak merasa kecil', type: 'Self-Protector' },
      { label: 'C', text: 'Termotivasi untuk ikut mengejar pencapaian', type: 'Action Builder' },
      { label: 'D', text: 'Ikut bersyukur dan percaya tiap orang punya waktunya', type: 'Meaning Seeker' },
      { label: 'E', text: 'Kutelaah apa strategi atau kunci yang bisa kupelajari', type: 'Deep Thinker' },
    ]
  },
  {
    id: 23,
    dimension: 'Self & Others',
    question: 'Saat harus meminta bantuan orang lain...',
    options: [
      { label: 'A', text: 'Lebih memilih menanggung dan menyelesaikan sendiri', type: 'Self-Protector' },
      { label: 'B', text: 'Langsung kuminta secara jelas dan efektif', type: 'Action Builder' },
      { label: 'C', text: 'Kuyakini saling menolong adalah bagian dari kebaikan', type: 'Meaning Seeker' },
      { label: 'D', text: 'Kupikirkan cara terbaik menyampaikan agar efisien', type: 'Deep Thinker' },
      { label: 'E', text: 'Ragu dan takut karena khawatir merepotkan orang lain', type: 'Overthinker' },
    ]
  },
  {
    id: 24,
    dimension: 'Self & Others',
    question: 'Penilaian orang lain terhadap diriku...',
    options: [
      { label: 'A', text: 'Kujadikan umpan balik untuk perbaikan bertindak', type: 'Action Builder' },
      { label: 'B', text: 'Kuingat bahwa harga diriku tidak ditentukan orang lain', type: 'Meaning Seeker' },
      { label: 'C', text: 'Kuoamati tanpa terlalu terbawa perasaan', type: 'Deep Thinker' },
      { label: 'D', text: 'Sangat mempengaruhi pikiranku dalam waktu lama', type: 'Overthinker' },
      { label: 'E', text: 'Membuatku cenderung menutup sisi asliku', type: 'Self-Protector' },
    ]
  },
  {
    id: 25,
    dimension: 'Self & Others',
    question: 'Bentuk hubungan atau relasi yang paling kuinginkan...',
    options: [
      { label: 'A', text: 'Yang saling menguatkan dalam nilai kebaikan', type: 'Meaning Seeker' },
      { label: 'B', text: 'Yang bermakna, mendalam, dan jujur', type: 'Deep Thinker' },
      { label: 'C', text: 'Yang membuatku merasa aman dan tidak cemas', type: 'Overthinker' },
      { label: 'D', text: 'Yang tak menuntutku terlalu terbuka berlebihan', type: 'Self-Protector' },
      { label: 'E', text: 'Yang saling mendorong untuk tumbuh & beraksi', type: 'Action Builder' },
    ]
  }
];