'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  LogOut, 
  BookOpen, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Download,
  Award,
  BrainCircuit,
  ListOrdered,
  RotateCcw,
  FileQuestion,
  Upload,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TestScores {
  scorePg: number;
  scoreEssay: number;
  scorePs: number;
}

interface EbookItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userNama, setUserNama] = useState('Peserta');
  const [userEmail, setUserEmail] = useState('peserta@gmail.com');
  const [userBatch, setUserBatch] = useState('Batch 1');
  
  // STATE STATUS & SKOR PESERTA
  const [isBatch2Unlocked, setIsBatch2Unlocked] = useState(false);
  const [hasSubmittedBatch1, setHasSubmittedBatch1] = useState(false);
  const [batch1Scores, setBatch1Scores] = useState<TestScores | null>(null);
  const [hasSubmittedBatch2, setHasSubmittedBatch2] = useState(false);

  // STATE POPUP MODAL RETAKE BATCH 1
  const [showRetakeModal, setShowRetakeModal] = useState(false);

  // STATE POPUP E-BOOK & LIST E-BOOK DINAMIS SUPABASE
  const [ebookList, setEbookList] = useState<EbookItem[]>([]);
  const [loadingEbooks, setLoadingEbooks] = useState(true);
  const [selectedEbookUrl, setSelectedEbookUrl] = useState<string | null>(null);
  const [selectedEbookTitle, setSelectedEbookTitle] = useState<string>('');

  useEffect(() => {
    const savedName = localStorage.getItem('user_nama') || 'Peserta';
    const savedEmail = localStorage.getItem('user_email') || 'peserta@gmail.com';
    const savedBatch = localStorage.getItem('user_batch') || 'Batch 1';
    
    setUserNama(savedName);
    setUserEmail(savedEmail);
    setUserBatch(savedBatch);

    // 1. FETCH STATUS GATING PESERTA DARI SUPABASE
    const checkGatingAndSubmission = async () => {
      try {
        if (savedName && savedName !== 'Peserta') {
          const { data, error } = await supabase
            .from('psikotes_reports')
            .select('*')
            .eq('nama', savedName)
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            // Cek Riwayat Batch 1
            const batch1Record = data.find((r) => r.batch?.includes('Batch 1'));
            if (batch1Record) {
              setHasSubmittedBatch1(true);
              setBatch1Scores({
                scorePg: batch1Record.score_part1 ?? 0,
                scoreEssay: batch1Record.score_part2 ?? 0,
                scorePs: batch1Record.problem_solving_score ?? 0,
              });

              if ((batch1Record.problem_solving_score ?? 0) >= 60) {
                setIsBatch2Unlocked(true);
              }
            }

            // Cek Riwayat Batch 2
            const isBatch2Done = data.some((r) => r.batch?.includes('Batch 2'));
            const localBatch2Done = localStorage.getItem(`batch2_submitted_${savedName}`) === 'true';
            
            if (isBatch2Done || localBatch2Done) {
              setHasSubmittedBatch2(true);
            }
          }
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    // 2. FETCH E-BOOK DINAMIS DARI SUPABASE
    const fetchEbooks = async () => {
      try {
        setLoadingEbooks(true);
        const { data, error } = await supabase
          .from('ebooks')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setEbookList(data);
        }
      } catch (err) {
        console.error('Error fetching ebooks:', err);
      } finally {
        setLoadingEbooks(false);
      }
    };

    checkGatingAndSubmission();
    fetchEbooks();
  }, []);

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'Batch 2' && !isBatch2Unlocked) {
      alert('🔒 Batch 2 Masih Terkunci!\n\nAnda harus menyelesaikan Tes Psikotes Batch 1 dan meraih nilai Problem Solving minimal 60 terlebih dahulu.');
      return;
    }
    setUserBatch(selected);
    localStorage.setItem('user_batch', selected);
  };

  // HANDLER MULAI / ULANGI TES
  const handleStartTestClick = () => {
    if (userBatch === 'Batch 2') {
      router.push('/test?mode=upload');
    } else {
      if (hasSubmittedBatch1) {
        setShowRetakeModal(true);
      } else {
        router.push('/test?mode=test');
      }
    }
  };

  const handleNavigateRetake = (step: number) => {
    setShowRetakeModal(false);
    router.push(`/test?mode=test&step=${step}`);
  };

  const handleOpenEbookModal = (url: string, title: string) => {
    setSelectedEbookUrl(url);
    setSelectedEbookTitle(title);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      
      {/* ELEMEN LENGKUNGAN BIRU YANG MENYUSUT MELENGKUNG KE ATAS PAS MASUK DASHBOARD */}
      <motion.div
        initial={{ height: '100%' }}
        animate={{ height: '0%' }}
        transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
        className="fixed top-0 left-0 right-0 bg-[#6366f1] z-50 pointer-events-none rounded-b-[100%] scale-x-125"
      />

      {/* KONTEN UTAMA DASHBOARD DENGAN EFEK CARD SHEET SLIDE-UP */}
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 relative z-10"
      >
        {/* HEADER NAVBAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center font-black">
              PT
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Psikotes Teologis</h1>
              <p className="text-xs text-slate-400 font-mono">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative">
              <select
                value={userBatch}
                onChange={handleBatchChange}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold py-2.5 px-4 pr-9 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-inner"
              >
                <option value="Batch 1">Batch 1 - Dasar Teologis</option>
                <option value="Batch 2" disabled={!isBatch2Unlocked}>
                  {!isBatch2Unlocked 
                    ? '🔒 Batch 2 - Lanjutan & Praktika (Terkunci)' 
                    : '🔓 Batch 2 - Lanjutan & Praktika'}
                </option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.clear();
                router.push('/');
              }}
              className="px-3.5 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* WELCOME BANNER */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {userBatch === 'Batch 1' ? 'BATCH 1 - DASAR TEOLOGIS' : 'BATCH 2 - LANJUTAN & PRAKTIKA'}
            </span>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">Selamat Datang, {userNama}!</h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {userBatch === 'Batch 1'
              ? 'Silakan selesaikan rangkaian Tes Psikotes Teologis (Pilihan Ganda, Evaluasi Esai AI, & Problem Solving) untuk mengukur tingkat pemahaman spiritual Anda.'
              : 'Unggah laporan hasil pengamatan studi kasus lapangan Anda untuk evaluasi praktika teologi lanjutan.'}
          </p>
        </div>

        {/* SECTION EVALUASI UTAMA */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluasi & Tugas Utama</h3>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                  {userBatch === 'Batch 1' ? 'EVALUASI UTAMA' : 'TUGAS PRAKTIKA'}
                </span>
                {userBatch === 'Batch 1' && hasSubmittedBatch1 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </span>
                )}
                {userBatch === 'Batch 2' && hasSubmittedBatch2 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Laporan Terkirim
                  </span>
                )}
              </div>

              <h4 className="text-xl font-extrabold text-white">
                {userBatch === 'Batch 1' ? 'Tes Psikotes Teologis' : 'Upload Laporan Lanjutan (Batch 2)'}
              </h4>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                {userBatch === 'Batch 1'
                  ? 'Kerjakan tes evaluasi teologis pilihan ganda, esai pemahaman, serta analisis studi kasus problem solving.'
                  : 'Unggah laporan hasil analisis praktika teologis lapangan Anda untuk dinilai oleh tim penilai.'}
              </p>

              {userBatch === 'Batch 1' && hasSubmittedBatch1 && batch1Scores && (
                <div className="pt-2 grid grid-cols-3 gap-2 max-w-md">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Pilihan Ganda</p>
                    <p className="text-sm font-black text-blue-400">{batch1Scores.scorePg}</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Esai AI</p>
                    <p className="text-sm font-black text-blue-400">{batch1Scores.scoreEssay}</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Problem Solving</p>
                    <p className={`text-sm font-black ${batch1Scores.scorePs >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {batch1Scores.scorePs}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStartTestClick}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {userBatch === 'Batch 2' ? (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{hasSubmittedBatch2 ? 'Upload Ulang Laporan' : 'Mulai Upload Laporan'}</span>
                </>
              ) : (
                <>
                  <span>{hasSubmittedBatch1 ? 'Ulangi / Modifikasi Tes' : 'Mulai Tes Evaluasi'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION MODUL LEARNING (E-BOOK DINAMIS SUPABASE) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Modul Pembelajaran ({userBatch})
            </h3>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              {ebookList.length} Modul
            </span>
          </div>

          {loadingEbooks ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Memuat modul e-book...
            </div>
          ) : ebookList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-xs text-slate-400">
              Belum ada modul e-book yang dipublikasikan saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ebookList.map((eb) => (
                <div
                  key={eb.id}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-slate-700 transition group"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-white">{eb.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {eb.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenEbookModal(eb.file_url, eb.title)}
                    className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca E-Book</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </motion.div>

      {/* MODAL POPUP RETAKE BATCH 1 */}
      {showRetakeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowRetakeModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-xs font-bold bg-slate-950 p-2 rounded-xl border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Pilih Bagian Tes yang Ingin Diulangi</h3>
              <p className="text-xs text-slate-400">
                Anda sudah menyelesaikan Batch 1. Silakan pilih tahap spesifik yang ingin diperbaiki atau ulangi dari awal.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleNavigateRetake(1)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ListOrdered className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-bold text-white">1. Pilihan Ganda (PG)</p>
                    <p className="text-[10px] text-slate-400">Tes pemahaman dasar teologi</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => handleNavigateRetake(2)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileQuestion className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-bold text-white">2. Evaluasi Esai AI</p>
                    <p className="text-[10px] text-slate-400">Penilaian pemahaman naratif</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => handleNavigateRetake(3)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-bold text-white">3. Problem Solving</p>
                    <p className="text-[10px] text-slate-400">Studi kasus & analisis teologis</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP VIEW E-BOOK (PDF VIEWER) */}
      {selectedEbookUrl && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {selectedEbookTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedEbookUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh PDF</span>
                </a>

                <button
                  onClick={() => setSelectedEbookUrl(null)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={`${selectedEbookUrl}#toolbar=0`}
                className="w-full h-full border-none"
                title={selectedEbookTitle}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}