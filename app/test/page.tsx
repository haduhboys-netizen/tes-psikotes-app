'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Save, RefreshCw, Sparkles, ArrowLeft as BackIcon } from 'lucide-react';

const MAIN_QUESTIONS = [
  {
    id: 1,
    text: "Saat menghadapi situasi bertekanan tinggi atau krisis mendadak, pendekatan utama Anda adalah:",
    options: [
      { label: 'A', text: 'Menganalisis akar penyebab masalah secara tenang dan rasional.' },
      { label: 'B', text: 'Mengambil tindakan cepat untuk meredakan dampak krisis.' },
      { label: 'C', text: 'Menjaga ketenangan emosi dan mencari hikmah di balik situasi.' },
      { label: 'D', text: 'Memikirkan dampak risiko terburuk yang mungkin terjadi.' },
      { label: 'E', text: 'Mengamankan posisi dan memastikan tanggung jawab pribadi terpenuhi.' }
    ]
  },
  {
    id: 2,
    text: "Dalam mengambil keputusan penting yang berdampak panjang, pertimbangan utama Anda adalah:",
    options: [
      { label: 'A', text: 'Kesesuaian dengan data, logika rasional, dan fakta objektif.' },
      { label: 'B', text: 'Kecepatan eksekusi dan efisiensi hasil yang dicapai.' },
      { label: 'C', text: 'Prinsip etika, moralitas, dan nilai-nilai kebaikan bersama.' },
      { label: 'D', text: 'Menghindari kemungkinan kesalahan yang memicu penyesalan.' },
      { label: 'E', text: 'Meminimalisir risiko yang berpotensi merugikan posisi Anda.' }
    ]
  },
  {
    id: 3,
    text: "Ketika harus beradaptasi dengan aturan atau lingkungan kelompok yang baru:",
    options: [
      { label: 'A', text: 'Mempelajari struktur dan logika di balik aturan baru tersebut.' },
      { label: 'B', text: 'Langsung menyesuaikan diri melalui penyesuaian praktik kerja.' },
      { label: 'C', text: 'Mencari nilai positif yang bisa memajukan perkembangan diri.' },
      { label: 'D', text: 'Berhati-hati agar tidak membuat kesalahan di awal penyesuaian.' },
      { label: 'E', text: 'Mengamati situasi terlebih dahulu sebelum mengambil tindakan.' }
    ]
  },
  {
    id: 4,
    text: "Saat mengalami kegagalan dalam target kerja atau studi, reaksi pertama Anda adalah:",
    options: [
      { label: 'A', text: 'Mengevaluasi variabel kesalahan untuk perbaikan strategi.' },
      { label: 'B', text: 'Segera bangkit dan mencoba metode perbaikan baru.' },
      { label: 'C', text: 'Menerima sebagai proses pembelajaran dan pendewasaan karakter.' },
      { label: 'D', text: 'Memikirkan kekecewaan tersebut dalam waktu yang cukup lama.' },
      { label: 'E', text: 'Memastikan reputasi dan kredibilitas diri tetap terjaga.' }
    ]
  },
  {
    id: 5,
    text: "Gaya kepemimpinan yang paling nyaman Anda terapkan dalam sebuah tim adalah:",
    options: [
      { label: 'A', text: 'Mengarahkan tim berdasarkan analisis data dan perencanaan terstruktur.' },
      { label: 'B', text: 'Mendorong anggota tim untuk langsung mengeksekusi pembagian tugas.' },
      { label: 'C', text: 'Menginspirasi tim melalui pendekatan personal dan kepedulian.' },
      { label: 'D', text: 'Memastikan seluruh anggota tim terhindar dari potensi kesalahan.' },
      { label: 'E', text: 'Menjaga kestabilan tim agar terhindar dari benturan internal.' }
    ]
  },
  {
    id: 6,
    text: "Saat dihadapkan pada dilema antara nilai prinsip pribadi dan target realistis:",
    options: [
      { label: 'A', text: 'Mencari kompromi logis yang secara rasional dapat dipertanggungjawabkan.' },
      { label: 'B', text: 'Mengutamakan pencapaian target agar hasil cepat wujud.' },
      { label: 'C', text: 'Kukuh memegang prinsip etika terlepas dari konsekuensi target.' },
      { label: 'D', text: 'Merasa cemas dan bingung menentukan prioritas keputusan.' },
      { label: 'E', text: 'Memilih jalan paling aman yang aman dari sanksi eksternal.' }
    ]
  },
  {
    id: 7,
    text: "Ketika menerima masukan atau kritik tajam atas kinerja Anda dari orang lain:",
    options: [
      { label: 'A', text: 'Memilah secara kritis fakta objektif yang berguna untuk perbaikan.' },
      { label: 'B', text: 'Menjadikan kritik sebagai pemacu untuk membuktikan kinerja nyata.' },
      { label: 'C', text: 'Menerima dengan rendah hati sebagai cermin introspeksi diri.' },
      { label: 'D', text: 'Terus terbayang kritik tersebut dan ragu pada kemampuan diri.' },
      { label: 'E', text: 'Menyiapkan penjelasan agar tidak terkesan sepenuhnya bersalah.' }
    ]
  },
  {
    id: 8,
    text: "Dalam bekerja sama dengan anggota tim yang memiliki latar belakang berbeda:",
    options: [
      { label: 'A', text: 'Fokus pada relevansi keahlian dan efisiensi pembagian tugas.' },
      { label: 'B', text: 'Menyamakan ritme kerja agar proyek selesai tepat waktu.' },
      { label: 'C', text: 'Membangun empati dan keterbukaan komunikasi antar anggota.' },
      { label: 'D', text: 'Cenderung ragu mengemukakan pendapat di tengah perbedaan.' },
      { label: 'E', text: 'Menjaga jarak aman dan fokus pada tugas pribadi.' }
    ]
  },
  {
    id: 9,
    text: "Saat menghadapi tenggat waktu mendesak dengan beban kerja menumpuk:",
    options: [
      { label: 'A', text: 'Membuat alokasi prioritas berdasarkan tingkat urgensi tugas.' },
      { label: 'B', text: 'Bekerja secara cepat tanpa distraksi hingga tugas tuntas.' },
      { label: 'C', text: 'Menjaga ketenangan batin agar kualitas pekerjaan tidak menurun.' },
      { label: 'D', text: 'Merasa kewalahan dan cemas pekerjaan tidak selesai tepat waktu.' },
      { label: 'E', text: 'Menyelesaikan bagian inti minimal yang terpenting aman.' }
    ]
  },
  {
    id: 10,
    text: "Dorongan terbesar Anda untuk mempelajari hal baru di luar bidang keahlian adalah:",
    options: [
      { label: 'A', text: 'Keinginan memperluas struktur pengetahuan teoritis dan konseptual.' },
      { label: 'B', text: 'Kebutuhan praktis untuk menyelesaikan tantangan kerja nyata.' },
      { label: 'C', text: 'Pencarian makna dan pengembangan potensi diri secara utuh.' },
      { label: 'D', text: 'Kekhawatiran tertinggal dari perkembangan kompetensi orang lain.' },
      { label: 'E', text: 'Tuntutan regulasi untuk menjaga stabilitas posisi kerja.' }
    ]
  },
  {
    id: 11,
    text: "Saat menemukan masalah rumit dalam pekerjaan yang belum pernah ditemui:",
    options: [
      { label: 'A', text: 'Melakukan riset mendalam dan membedah problem secara sistematis.' },
      { label: 'B', text: 'Mencoba berbagai eksperimen solusi praktis di lapangan.' },
      { label: 'C', text: 'Merenungkan esensi problem dan mendiskusikan nilai solusinya.' },
      { label: 'D', text: 'Kepikiran skenario terburuk jika masalah tersebut gagal ditangani.' },
      { label: 'E', text: 'Menggunakan prosedur standar lama yang terbukti aman.' }
    ]
  },
  {
    id: 12,
    text: "Dalam menjaga komitmen kerja jangka panjang saat titik kejenuhan melanda:",
    options: [
      { label: 'A', text: 'Mengevaluasi kembali metode kerja agar lebih efisien dan terstruktur.' },
      { label: 'B', text: 'Membuat target-target kecil baru untuk menjaga dinamika kerja.' },
      { label: 'C', text: 'Mengingat kembali niat awal dan dampak positif dari pekerjaan Anda.' },
      { label: 'D', text: 'Merasa cemas akan penurunan performa diri yang berkepanjangan.' },
      { label: 'E', text: 'Bertahan pada rutinitas harian agar tanggung jawab tetap terpenuhi.' }
    ]
  },
  {
    id: 13,
    text: "Melihat pencapaian dan keberhasilan besar yang diraih oleh rekan sejawat:",
    options: [
      { label: 'A', text: 'Menganalisis faktor dan strategi keberhasilan rekan untuk dipelajari.' },
      { label: 'B', text: 'Tersulut motivasi untuk mengejar pencapaian nyata serupa.' },
      { label: 'C', text: 'Merasa ikut bahagia dan bersyukur atas pertumbuhan bersama.' },
      { label: 'D', text: 'Membandingkan diri dan cemas akan posisi kompetensi pribadi.' },
      { label: 'E', text: 'Tetap fokus pada pencapaian target pribadi tanpa terpengaruh.' }
    ]
  },
  {
    id: 14,
    text: "Pendekatan Anda dalam menyusun perencanaan target mingguan adalah:",
    options: [
      { label: 'A', text: 'Menyusun jadwal terperinci dengan estimasi alokasi waktu terukur.' },
      { label: 'B', text: 'Menuliskan daftar tindakan nyata yang harus dieksekusi setiap hari.' },
      { label: 'C', text: 'Menentukan fokus prioritas yang memberi dampak nilai terbesar.' },
      { label: 'D', text: 'Merasa ragu apakah seluruh target mingguan sanggup diselesaikan.' },
      { label: 'E', text: 'Menyusun target minimal yang realistis dan aman dari risiko gagal.' }
    ]
  },
  {
    id: 15,
    text: "Sikap Anda ketika diminta berkorban waktu dan tenaga ekstra demi tim:",
    options: [
      { label: 'A', text: 'Bersedia jika ada kalkulasi rasional dan kejelasan dampak proyek.' },
      { label: 'B', text: 'Langsung menyanggupi demi percepatan penyelesaian tugas bersama.' },
      { label: 'C', text: 'Dengan tulus membantu sebagai wujud solidaritas dan nilai bersama.' },
      { label: 'D', text: 'Khawatir pengorbanan ekstra tersebut mengganggu beban tugas lain.' },
      { label: 'E', text: 'Memastikan batasan peran pribadi tidak dimanfaatkan secara berlebihan.' }
    ]
  },
  {
    id: 16,
    text: "Dalam situasi ketidakpastian tinggi saat informasi belum lengkap:",
    options: [
      { label: 'A', text: 'Mengumpulkan data tambahan sebanyak mungkin sebelum melangkah.' },
      { label: 'B', text: 'Tetap mengambil tindakan terukur untuk menguji arah perkembangan.' },
      { label: 'C', text: 'Mempercayai intuisi moral dan prinsip dasar yang diyakini.' },
      { label: 'D', text: 'Menunda keputusan karena cemas mengambil langkah yang salah.' },
      { label: 'E', text: 'Menunggu arahan resmi atau keputusan dari pihak berwenang.' }
    ]
  },
  {
    id: 17,
    text: "Pandangan Anda mengenai integritas dan kejujuran dalam proses kerja:",
    options: [
      { label: 'A', text: 'Integritas adalah konsistensi rasional antara prinsip dan tindakan.' },
      { label: 'B', text: 'Kejujuran menjadi pondasi penting dalam pencapaian hasil kerja nyata.' },
      { label: 'C', text: 'Nilai moral tertinggi yang tidak boleh dikompromikan demi apa pun.' },
      { label: 'D', text: 'Selalu berhati-hati agar tindakan pribadi tidak melanggar etika.' },
      { label: 'E', text: 'Aturan wajib yang harus dipatuhi demi keamanan bersama.' }
    ]
  },
  {
    id: 18,
    text: "Saat mendengarkan perbedaan pandangan yang bertolak belakang dalam forum:",
    options: [
      { label: 'A', text: 'Menganalisis argumen masing-masing pihak secara logis dan objektif.' },
      { label: 'B', text: 'Menawarkan opsi kompromi praktis yang dapat diterima semua pihak.' },
      { label: 'C', text: 'Menghargai keberagaman sudut pandang dengan empati tinggi.' },
      { label: 'D', text: 'Merasa tidak nyaman dengan ketegangan perdebatan yang terjadi.' },
      { label: 'E', text: 'Bersikap netral dan mengamati arah kesepakatan terbanyak.' }
    ]
  },
  {
    id: 19,
    text: "Reaksi Anda saat menyadari strategi yang Anda rencanakan ternyata keliru:",
    options: [
      { label: 'A', text: 'Mengakui kesalahan secara terbuka dan merevisi variabel perencanaan.' },
      { label: 'B', text: 'Segera mengganti strategi dengan alternatif tindakan yang lebih cepat.' },
      { label: 'C', text: 'Mengambil pelajaran berharga dari kesalahan untuk pembenahan batin.' },
      { label: 'D', text: 'Merasa bersalah dan terus memikirkan dampak dari kecerobohan tersebut.' },
      { label: 'E', text: 'Menyusun langkah mitigasi agar dampak keliru tidak meluas.' }
    ]
  },
  {
    id: 20,
    text: "Prinsip Anda terhadap hubungan antara usaha maksimal dan hasil akhir:",
    options: [
      { label: 'A', text: 'Usaha yang terencana dengan baik akan menghasilkan keluaran yang terukur.' },
      { label: 'B', text: 'Fokus pada eksekusi maksimal karena hasil ditentukan oleh kerja nyata.' },
      { label: 'C', text: 'Usaha maksimal adalah kewajiban, sedangkan hasil diserahkan pada Takdir.' },
      { label: 'D', text: 'Selalu berharap hasil sesuai ekspektasi meski dibayangi kecemasan.' },
      { label: 'E', text: 'Memastikan usaha terpenuhi sesuai standar aman minimal.' }
    ]
  }
];

export default function TestPage() {
  const router = useRouter();
  const [userNama, setUserNama] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('user_nama') || 'Peserta';
    const savedEmail = localStorage.getItem('user_email') || 'peserta@sankofa.com';

    setUserNama(savedName);
    setUserEmail(savedEmail);

    const cleanEmail = savedEmail.trim().toLowerCase();
    const savedAnswers = localStorage.getItem(`test_answers_${cleanEmail}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error('Failed to parse answers', e);
      }
    }
  }, []);

  const handleSelectOption = (questionId: number, optionText: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const handleNext = () => {
    if (currentIndex < MAIN_QUESTIONS.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < MAIN_QUESTIONS.length) {
      const confirmSubmit = window.confirm(
        `Anda baru menjawab ${answeredCount} dari ${MAIN_QUESTIONS.length} soal. Yakin ingin menyimpan?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    const cleanEmail = userEmail.trim().toLowerCase();

    try {
      localStorage.setItem(`test_answers_${cleanEmail}`, JSON.stringify(answers));
      localStorage.setItem(`test_completed_${cleanEmail}`, 'true');
      setIsSaved(true);
      router.push('/dashboard');
    } catch (err) {
      alert('Gagal menyimpan jawaban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = MAIN_QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQ.id] || '';
  const progressPercent = Math.round(((currentIndex + 1) / MAIN_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 flex justify-center items-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* HEADER NAVBAR */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <BackIcon className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Psikotes Batch 1</h1>
              <p className="text-[10px] text-slate-400 font-mono">Evaluasi Utama (20 Soal PG)</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-mono">
            Soal {currentIndex + 1} / {MAIN_QUESTIONS.length}
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Progress Pengerjaan</span>
            <span>{Object.keys(answers).length} / {MAIN_QUESTIONS.length} Terjawab ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* TEKS SOAL */}
        <div className="space-y-5 pt-1">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> SOAL NOMOR {currentIndex + 1}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{currentQ.text}</h2>
          </div>

          {/* OPSI JAWABAN DESKRIPSI SIKAP */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = currentAnswer === opt.text;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.text)}
                  className={`w-full p-4 rounded-2xl text-left text-xs font-medium transition flex items-center gap-3 border cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-md' 
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}>
                    {opt.label}
                  </span>
                  <span className="leading-relaxed font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NAVIGASI TOMBOL */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < MAIN_QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isSaved}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Selesai & Simpan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}