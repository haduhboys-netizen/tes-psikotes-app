'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  GraduationCap, 
  LogOut, 
  Sparkles, 
  User, 
  X,
  Download,
  ArrowRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface Ebook {
  id: number;
  judul: string;
  deskripsi: string;
  estimasiBaca: string;
  file: string;
  isNew?: boolean;
}

const ebookData: { [key: string]: Ebook[] } = {
  'Batch 1': [
    {
      id: 1,
      judul: 'Modul 1: Pengantar Teologi & Dasar Spiritual',
      deskripsi: 'Membahas konsep dasar teologi dan pemahaman pondasi spiritualitas.',
      estimasiBaca: '15 Menit',
      file: '/ebook-batch-1.pdf',
      isNew: true,
    },
    {
      id: 2,
      judul: 'Modul 2: Etiologi & Biomekanika Pemahaman',
      deskripsi: 'Pendalaman materi fisiologis dan respons spiritual lanjutan.',
      estimasiBaca: '20 Menit',
      file: '/ebook-sample.pdf',
    },
  ],
  'Batch 2': [
    {
      id: 1,
      judul: 'Modul 1: Kepemimpinan & Etika Pelayanan',
      deskripsi: 'Prinsip-prinsip etika dan penerapan kepemimpinan teologis.',
      estimasiBaca: '25 Menit',
      file: '/ebook-batch-2.pdf',
      isNew: true,
    },
  ],
  'Batch 3': [
    {
      id: 1,
      judul: 'Modul 1: Kematangan Spiritual & Praktika Lanjutan',
      deskripsi: 'Penerapan praktis kematangan spiritual dalam kehidupan sehari-hari.',
      estimasiBaca: '30 Menit',
      file: '/ebook-batch-3.pdf',
      isNew: true,
    },
  ],
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ nama: string; batch: string } | null>(null);
  const [testResult, setTestResult] = useState<{ score: number; date: string } | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ judul: string; file: string } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user_psikotes');
    if (!savedUser) {
      router.push('/login');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // Ambil skor khusus berdasarkan username yang sedang login
      const savedResult = localStorage.getItem(`user_psikotes_score_${parsedUser.nama}`);
      if (savedResult) {
        setTestResult(JSON.parse(savedResult));
      } else {
        setTestResult(null);
      }
    }
  }, [router]);

  const confirmLogout = () => {
    localStorage.removeItem('user_psikotes');
    setUser(null);
    setTestResult(null);
    router.push('/login');
  };

  // Pengecekan agar TypeScript paham 'user' tidak null di bawah ini
  if (!user) return null;

  const userEbooks = ebookData[user.batch] || ebookData['Batch 1'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Navbar Glassmorphism */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-3.5"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-100 tracking-tight block text-base leading-none">Psikotes Teologis</span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">Portal Learning</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-md">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-200 font-medium">{user.nama}</span>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-xs font-semibold px-3.5 py-2 bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 border border-slate-700 text-slate-300 rounded-xl transition duration-200 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-8 my-2">
        
        {/* Banner Welcome Glow */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/50 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl group"
        >
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Akses Aktif: {user.batch}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">{user.nama}</span>!
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Pelajari modul materi e-book sesuai gelombang Anda dan selesaikan tes evaluasi psikotes untuk mengukur kematangan spiritual.
            </p>
          </div>
        </motion.section>

        {/* Card Akses Kuis Dengan Status Dynamic */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl hover:border-blue-500/60 transition duration-300"
        >
          <div className="space-y-1.5 z-10">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Evaluasi Utama
              </span>
              {testResult ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai (Skor: {testResult.score}/100)
                </span>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> 25 Soal Belum Dikerjakan
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Tes Psikotes Teologis</h2>
            <p className="text-xs text-slate-300">Uji tingkat kematangan teologis dan dapatkan analisis skor instan.</p>
          </div>

          <Link
            href="/test"
            className="w-full sm:w-auto z-10 text-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2 group"
          >
            {testResult ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Tes Ulang / Lihat Skor</span>
              </>
            ) : (
              <>
                <span>Mulai Kerjakan Tes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </>
            )}
          </Link>
        </motion.section>

        {/* Section Modul */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-100">Modul Pembelajaran</h2>
                <p className="text-xs text-slate-400">Pilih e-book yang ingin Anda baca hari ini</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-800/80 text-slate-300 rounded-full border border-slate-700">
              {userEbooks.length} Modul
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {userEbooks.map((ebook) => (
              <motion.div 
                key={ebook.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-slate-900/90 hover:bg-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition duration-200 flex flex-col justify-between space-y-5 shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> {ebook.estimasiBaca}
                    </span>
                    {ebook.isNew && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Terbaru
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-100 text-base group-hover:text-blue-400 transition">
                    {ebook.judul}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ebook.deskripsi}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPdf({ judul: ebook.judul, file: ebook.file })}
                  className="w-full py-2.5 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-xl text-xs font-bold border border-slate-700 group-hover:border-blue-500 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Baca E-Book</span>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </main>

      {/* Modal PDF Viewer */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[90vh] rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hidden sm:block">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base truncate">
                  {selectedPdf.judul}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedPdf.file}
                  download
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </a>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="p-1.5 sm:px-3 sm:py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Tutup</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={selectedPdf.file}
                className="w-full h-full border-none"
                title={selectedPdf.judul}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Confirm Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-2xl"
          >
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Konfirmasi Keluar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Apakah Anda yakin ingin keluar dari akun portal Psikotes Teologis?</p>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-600/20"
              >
                Ya, Keluar
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}