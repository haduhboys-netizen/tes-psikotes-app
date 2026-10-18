'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TestScores {
  scorePg: number;
  scoreEssay: number;
  scorePs: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userNama, setUserNama] = useState('Peserta');
  const [userEmail, setUserEmail] = useState('peserta@example.com');
  const [userBatch, setUserBatch] = useState('Batch 1');
  
  // STATE STATUS & SKOR PESERTA
  const [isBatch2Unlocked, setIsBatch2Unlocked] = useState(false);
  const [hasSubmittedBatch1, setHasSubmittedBatch1] = useState(false);
  const [batch1Scores, setBatch1Scores] = useState<TestScores | null>(null);
  const [hasSubmittedBatch2, setHasSubmittedBatch2] = useState(false);

  // STATE POPUP MODAL RETAKE BATCH 1
  const [showRetakeModal, setShowRetakeModal] = useState(false);

  // STATE POPUP E-BOOK
  const [selectedEbookUrl, setSelectedEbookUrl] = useState<string | null>(null);
  const [selectedEbookTitle, setSelectedEbookTitle] = useState<string>('');

  useEffect(() => {
    const savedName = localStorage.getItem('user_nama') || 'Peserta';
    const savedEmail = localStorage.getItem('user_email') || 'peserta@example.com';
    const savedBatch = localStorage.getItem('user_batch') || 'Batch 1';
    
    setUserNama(savedName);
    setUserEmail(savedEmail);
    setUserBatch(savedBatch);

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

    checkGatingAndSubmission();
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

  const handleOpenEbookModal = (fileName: string, title: string) => {
    setSelectedEbookUrl(`/ebooks/${fileName}`);
    setSelectedEbookTitle(title);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">

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
              className="px-3.5 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
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
              ? 'Silakan selesaikan rangkaian Tes Psikotes Teologis (Pilihan Ganda, Evaluasi Esai AI, Upload Laporan PDF, & Problem Solving) untuk mengukur tingkat pemahaman spiritual Anda.'
              : 'Unggah laporan hasil pengamatan studi kasus lapangan Anda untuk evaluasi praktika teologi lanjutan.'}
          </p>
        </div>

        {/* SECTION EVALUASI UTAMA */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluasi & Tugas Utama</h3>

          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    {userBatch === 'Batch 1' ? 'EVALUASI UTAMA' : 'TUGAS LAPORAN'}
                  </span>
                  {(userBatch === 'Batch 1' ? hasSubmittedBatch1 : hasSubmittedBatch2) && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> SUDAH SELESAI
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-extrabold text-white">
                  {userBatch === 'Batch 1' ? 'Tes Psikotes Teologis' : 'Pengumpulan Laporan Praktika (Batch 2)'}
                </h4>
                <p className="text-xs text-slate-400 max-w-lg">
                  {userBatch === 'Batch 1'
                    ? hasSubmittedBatch1
                      ? 'Anda telah menyelesaikan seluruh rangkaian tes Batch 1. Rincian hasil nilai evaluasi Anda tercantum di bawah ini.'
                      : 'Kerjakan tes evaluasi teologis pilihan ganda, esai pemahaman, serta analisis studi kasus problem solving.'
                    : hasSubmittedBatch2
                      ? 'Laporan PDF praktika Batch 2 Anda telah berhasil diunggah dan disimpan di sistem.'
                      : 'Unggah berkas dokumen PDF laporan hasil observasi lapangan Anda.'}
                </p>
              </div>

              <button
                onClick={handleStartTestClick}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
                  (userBatch === 'Batch 1' ? hasSubmittedBatch1 : hasSubmittedBatch2)
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                <span>
                  {userBatch === 'Batch 1'
                    ? hasSubmittedBatch1
                      ? 'Kerjakan Ulang Tes'
                      : 'Mulai Tes Evaluasi'
                    : hasSubmittedBatch2
                      ? 'Unggah Ulang Laporan'
                      : 'Mulai Unggah Laporan'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* CARD METRIK SKOR BATCH 1 (HANYA MENAMPILKAN SKOR BATCH 1 LENGKAP BILA SUDAH SUBMIT) */}
            {userBatch === 'Batch 1' && hasSubmittedBatch1 && batch1Scores && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  HASIL NILAI EVALUASI ANDA (BATCH 1):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* SKOR PILIHAN GANDA */}
                  <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PILIHAN GANDA</p>
                      <p className="text-2xl font-black text-blue-400">
                        {batch1Scores.scorePg} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                      </p>
                    </div>
                    <ListOrdered className="w-5 h-5 text-blue-400/50" />
                  </div>

                  {/* SKOR ESAI AI */}
                  <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RATA-RATA ESAI AI</p>
                      <p className="text-2xl font-black text-emerald-400">
                        {batch1Scores.scoreEssay} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                      </p>
                    </div>
                    <Award className="w-5 h-5 text-emerald-400/50" />
                  </div>

                  {/* SKOR PROBLEM SOLVING */}
                  <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROBLEM SOLVING</p>
                      <p className="text-2xl font-black text-amber-400">
                        {batch1Scores.scorePs} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                      </p>
                    </div>
                    <BrainCircuit className="w-5 h-5 text-amber-400/50" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODUL PEMBELAJARAN (E-BOOK) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modul Pembelajaran ({userBatch})</h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
              {userBatch === 'Batch 1' ? '2 Modul' : '1 Modul'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userBatch === 'Batch 1' ? (
              <>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">E-Book: Fondasi Teologi Dasar</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Panduan komprehensif mengenai konsep-konsep kunci keimanan teologis, sejarah doktrin, dan dasar-dasar hermeneutika.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenEbookModal('fondasi-teologi-dasar.pdf', 'E-Book: Fondasi Teologi Dasar')}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Baca E-Book</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">Panduan Refleksi Spiritual</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Panduan praktis langkah demi langkah untuk membangun kedisiplinan doa pribadi dan jurnal refleksi keimanan harian.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenEbookModal('panduan-refleksi-spiritual.pdf', 'Panduan Refleksi Spiritual')}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Baca E-Book</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between sm:col-span-2">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Modul Lanjutan: Praktika & Kepemimpinan Teologis</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    Materi panduan studi kasus lapangan, etika kepemimpinan spiritual, serta metode pengamatan dan pelayanan masyarakat lanjutan.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenEbookModal('praktika-kepemimpinan-teologis.pdf', 'Modul Lanjutan: Praktika & Kepemimpinan Teologis')}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Baca Modul Lanjutan</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL PILIHAN BAGIAN TES YANG MAU DIULANG (STEP SINKRON DENGAN ALUR REVISI) */}
      {showRetakeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Kerjakan Ulang Bagian Tes</h3>
                  <p className="text-xs text-slate-400">Pilih tahapan spesifik yang ingin Anda ulangi.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRetakeModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* OPSI 1: PILIHAN GANDA (STEP 1) */}
              <button
                onClick={() => handleNavigateRetake(1)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition">Tahap 1: Pilihan Ganda</h4>
                    <p className="text-[11px] text-slate-500">20 Soal Pemahaman Doktrin & Teologi Dasar</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
              </button>

              {/* OPSI 2: ESAI TEOLOGIS (STEP 2) */}
              <button
                onClick={() => handleNavigateRetake(2)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Tahap 2: Evaluasi Esai AI</h4>
                    <p className="text-[11px] text-slate-500">5 Pertanyaan Refleksi & Penilaian AI</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </button>

              {/* OPSI 3: UNGGAH LAPORAN PDF (STEP 3) */}
              <button
                onClick={() => handleNavigateRetake(3)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition">Tahap 3: Unggah Laporan PDF</h4>
                    <p className="text-[11px] text-slate-500">Berkas Portofolio / Laporan Tambahan</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
              </button>

              {/* OPSI 4: PROBLEM SOLVING (STEP 4) */}
              <button
                onClick={() => handleNavigateRetake(4)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">Tahap 4: Problem Solving (Tahap Akhir)</h4>
                    <p className="text-[11px] text-slate-500">5 Studi Kasus Analisis & Evaluasi AI</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BACA E-BOOK */}
      {selectedEbookUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">{selectedEbookTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedEbookUrl(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-950 p-2">
              <iframe
                src={selectedEbookUrl}
                className="w-full h-full rounded-2xl border border-slate-800"
                title="E-Book Viewer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}