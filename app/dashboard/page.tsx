'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  ArrowRight, 
  LogOut, 
  Brain,
  Award,
  Lock,
  Download,
  FileText,
  CheckCircle2,
  ChevronRight,
  Upload,
  Video,
  Link as LinkIcon,
  Save,
  RefreshCw,
  File,
  X,
  AlertCircle
} from 'lucide-react';

interface Ebook {
  id: string;
  title: string;
  description: string;
  url: string;
  batch: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userNama, setUserNama] = useState('Peserta');
  const [userEmail, setUserEmail] = useState('');
  const [userBatch, setUserBatch] = useState('Batch 1');
  const [selectedBatchTab, setSelectedBatchTab] = useState<'batch1' | 'batch2'>('batch2');

  const [isLoading, setIsLoading] = useState(false);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);

  // Status Module & Skor Batch 1
  const [hasCompletedMainTest, setHasCompletedMainTest] = useState(false);
  const [hasCompletedEssay, setHasCompletedEssay] = useState(false);
  const [hasCompletedProblemSolving, setHasCompletedProblemSolving] = useState(false);

  const [psikotesScore, setPsikotesScore] = useState<string | null>(null);
  const [combinedEssayScore, setCombinedEssayScore] = useState<number | null>(null);

  // Form Batch 2 State - PDF Upload
  const [laporanTitle, setLaporanTitle] = useState('');
  const [laporanFile, setLaporanFile] = useState<{ name: string; size: string } | null>(null);
  const [laporanNotes, setLaporanNotes] = useState('');
  const [isLaporanSubmitted, setIsLaporanSubmitted] = useState(false);
  const [isSubmittingLaporan, setIsSubmittingLaporan] = useState(false);
  const [fileError, setFileError] = useState('');

  // Form Batch 2 State - Video Link
  const [videoLink, setVideoLink] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [isVideoSubmitted, setIsVideoSubmitted] = useState(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  const PASSING_GRADE_BATCH2 = 70;

  useEffect(() => {
    setIsLoading(false);

    const isReflectionDone = localStorage.getItem('reflection_completed');
    if (!isReflectionDone) {
      router.push('/reflection');
      return;
    }

    const savedName = localStorage.getItem('user_nama') || 'Peserta';
    const savedEmail = localStorage.getItem('user_email') || '';
    const savedBatch = localStorage.getItem('user_batch') || 'Batch 1';

    setUserNama(savedName);
    setUserEmail(savedEmail);
    setUserBatch(savedBatch);

    const cleanEmail = savedEmail.trim().toLowerCase();

    // Load Data Batch 1
    const testStatus = localStorage.getItem(`test_completed_${cleanEmail}`);
    if (testStatus === 'true') {
      setHasCompletedMainTest(true);
      const score = localStorage.getItem(`psikotes_score_${cleanEmail}`) || 'Selesai';
      setPsikotesScore(score);
    }

    const essayDone = localStorage.getItem(`essay_completed_${cleanEmail}`) === 'true';
    const psDone = localStorage.getItem(`problem_solving_completed_${cleanEmail}`) === 'true';
    setHasCompletedEssay(essayDone);
    setHasCompletedProblemSolving(psDone);

    const eScore = parseInt(localStorage.getItem(`essay_score_${cleanEmail}`) || '0');
    const psScore = parseInt(localStorage.getItem(`problem_solving_score_${cleanEmail}`) || '0');
    if (essayDone || psDone) {
      setCombinedEssayScore(eScore + psScore);
    }

    // Load Data Submit PDF Batch 2
    const savedLaporan = localStorage.getItem(`batch2_laporan_${cleanEmail}`);
    if (savedLaporan) {
      try {
        const parsed = JSON.parse(savedLaporan);
        setLaporanTitle(parsed.title || '');
        if (parsed.fileName) {
          setLaporanFile({ name: parsed.fileName, size: parsed.fileSize || 'PDF Document' });
        }
        setLaporanNotes(parsed.notes || '');
        setIsLaporanSubmitted(true);
      } catch (e) { console.error(e); }
    }

    // Load Data Video Batch 2
    const savedVideo = localStorage.getItem(`batch2_video_${cleanEmail}`);
    if (savedVideo) {
      try {
        const parsed = JSON.parse(savedVideo);
        setVideoLink(parsed.link || '');
        setVideoNotes(parsed.notes || '');
        setIsVideoSubmitted(true);
      } catch (e) { console.error(e); }
    }

    try {
      const savedEbooks = localStorage.getItem('admin_ebooks');
      if (savedEbooks) setEbooks(JSON.parse(savedEbooks));
    } catch (e) { console.error(e); }
  }, [router]);

  // Handler Upload File PDF (Maks 10 MB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFileError('File harus berupa dokumen PDF (.pdf)');
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError('Ukuran file PDF melebihi batas maksimal 10 MB');
      return;
    }

    const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setLaporanFile({ name: file.name, size: formattedSize });
  };

  // Submit Handler Laporan PDF
  const handleSubmitLaporan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!laporanFile) {
      setFileError('Silakan pilih file PDF laporan terlebih dahulu!');
      return;
    }

    setIsSubmittingLaporan(true);
    const cleanEmail = userEmail.trim().toLowerCase();

    const laporanData = {
      title: laporanTitle,
      fileName: laporanFile.name,
      fileSize: laporanFile.size,
      notes: laporanNotes,
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem(`batch2_laporan_${cleanEmail}`, JSON.stringify(laporanData));
    
    setTimeout(() => {
      setIsSubmittingLaporan(false);
      setIsLaporanSubmitted(true);
      alert('Dokumen PDF Laporan berhasil diunggah!');
    }, 800);
  };

  // Submit Handler Link Video
  const handleSubmitVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoLink.trim()) {
      alert('Silakan masukkan link video Anda!');
      return;
    }

    setIsSubmittingVideo(true);
    const cleanEmail = userEmail.trim().toLowerCase();

    const videoData = {
      link: videoLink,
      notes: videoNotes,
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem(`batch2_video_${cleanEmail}`, JSON.stringify(videoData));
    
    setTimeout(() => {
      setIsSubmittingVideo(false);
      setIsVideoSubmitted(true);
      alert('Link video berhasil dikirim dan tersimpan!');
    }, 600);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 flex justify-center items-start">
      <div className="max-w-4xl w-full space-y-6 py-6">
        
        {/* HEADER NAVBAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center font-black text-base shadow-inner">
              {userNama.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{userNama}</h1>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                  {selectedBatchTab === 'batch1' ? 'Batch 1 Active' : 'Batch 2 Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{userEmail || 'Peserta Terdaftar'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setSelectedBatchTab('batch1')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedBatchTab === 'batch1'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white cursor-pointer'
                }`}
              >
                Batch 1
              </button>

              <button
                onClick={() => setSelectedBatchTab('batch2')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedBatchTab === 'batch2'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white cursor-pointer'
                }`}
              >
                <span>Batch 2</span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-950 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {selectedBatchTab === 'batch1' ? (
          /* TAMPILAN DASHBOARD BATCH 1 */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Modul 1</span>
                  <Brain className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-slate-400">Nilai Psikotes Utama (20 PG)</p>
                <p className="text-xl font-extrabold text-white">
                  {hasCompletedMainTest ? (psikotesScore || 'Selesai') : 'Belum Dikerjakan'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Modul 2 & 3</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400">Nilai Gabungan (Esai + Problem Solving)</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-xl font-extrabold text-emerald-400">
                    {combinedEssayScore !== null ? `${combinedEssayScore} Poin` : 'Belum Dikerjakan'}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">Target Min: {PASSING_GRADE_BATCH2} Poin</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rangkaian Evaluasi Batch 1</h2>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">TAHAP 1</span>
                    <h3 className="text-base font-bold text-white">Psikotes Utama (20 Soal PG)</h3>
                  </div>
                  <p className="text-xs text-slate-400">Mengukur kepribadian & kecenderungan sikap dengan Skala Likert.</p>
                </div>
                <button
                  onClick={() => router.push('/test')}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  {hasCompletedMainTest ? 'Koreksi Psikotes' : 'Mulai Psikotes'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className={`bg-slate-900 border rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${hasCompletedMainTest ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">TAHAP 2</span>
                    <h3 className="text-base font-bold text-white">Tes Esai Pemahaman (5 Soal)</h3>
                  </div>
                  <p className="text-xs text-slate-400">Analisis pemahaman teologis dan pemikiran reflektif mendalam.</p>
                </div>
                {hasCompletedMainTest ? (
                  <button
                    onClick={() => router.push('/essay')}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    {hasCompletedEssay ? 'Koreksi Esai' : 'Mulai Tes Esai'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-slate-950 text-slate-500 text-xs font-bold rounded-xl border border-slate-800 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Selesaikan Tahap 1
                  </div>
                )}
              </div>

              <div className={`bg-slate-900 border rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${hasCompletedMainTest ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">TAHAP 3</span>
                    <h3 className="text-base font-bold text-white">Problem Solving (5 Kasus)</h3>
                  </div>
                  <p className="text-xs text-slate-400">Studi kasus pengambilan keputusan dalam kondisi krisis.</p>
                </div>
                {hasCompletedMainTest ? (
                  <button
                    onClick={() => router.push('/problem-solving')}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    {hasCompletedProblemSolving ? 'Koreksi Problem Solving' : 'Mulai Problem Solving'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-slate-950 text-slate-500 text-xs font-bold rounded-xl border border-slate-800 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Selesaikan Tahap 1
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl border bg-emerald-950/30 border-emerald-500/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Status Kelulusan Batch 2</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Akses Batch 2 telah terbuka. Anda dapat melanjutkan ke modul penyerahan laporan PDF & video.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBatchTab('batch2')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <span>Masuk Ke Batch 2</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* TAMPILAN DASHBOARD BATCH 2 */
          <div className="space-y-6">
            
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                  BATCH 2 UNLOCKED
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Selamat Datang di Penugasan Akhir Batch 2</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Silakan selesaikan dua penugasan di bawah ini serta unduh Kuesioner Evaluasi Program untuk pengisian akhir.
              </p>
            </div>

            {/* FORM MODUL 1: SUBMIT LAPORAN PDF (MAKS 10 MB) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">1. Submit Laporan (PDF Maks. 10 MB)</h3>
                    <p className="text-xs text-slate-400">Unggah berkas dokumen laporan dalam format PDF</p>
                  </div>
                </div>

                {isLaporanSubmitted && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitLaporan} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Judul / Topik Laporan</label>
                  <input
                    type="text"
                    value={laporanTitle}
                    onChange={(e) => setLaporanTitle(e.target.value)}
                    placeholder="Contoh: Laporan Akhir Evaluasi Kepemimpinan & Program Kerja"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">File Dokumen PDF <span className="text-red-400">*</span></label>
                  
                  {laporanFile ? (
                    <div className="bg-slate-950 border border-blue-500/40 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                          <File className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{laporanFile.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{laporanFile.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLaporanFile(null)}
                        className="p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition space-y-2 group">
                      <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition" />
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-300 group-hover:text-white transition">
                          Klik untuk memilih file PDF
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Format .pdf • Ukuran Maksimal 10 MB</p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {fileError && (
                    <div className="flex items-center gap-1.5 text-red-400 text-[11px] pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Catatan Tambahan (Opsional)</label>
                  <textarea
                    value={laporanNotes}
                    onChange={(e) => setLaporanNotes(e.target.value)}
                    placeholder="Ringkasan poin penting dari laporan ini..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLaporan}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  {isSubmittingLaporan ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengunggah PDF...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isLaporanSubmitted ? 'Perbarui PDF Laporan' : 'Unggah PDF Laporan'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* FORM MODUL 2: SUBMIT LINK VIDEO */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">2. Submit Link Video</h3>
                    <p className="text-xs text-slate-400">Kirimkan link video presentasi atau refleksi (YouTube, Drive, TikTok, dsb.)</p>
                  </div>
                </div>

                {isVideoSubmitted && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitVideo} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Link Video Presentasi / Dokumentasi <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      required
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... atau https://drive.google.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Keterangan Singkat Video (Opsional)</label>
                  <textarea
                    value={videoNotes}
                    onChange={(e) => setVideoNotes(e.target.value)}
                    placeholder="Deskripsi singkat konten video yang Anda unggah..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingVideo}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  {isSubmittingVideo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Link Video...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isVideoSubmitted ? 'Perbarui Link Video' : 'Kirimkan Link Video'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* FITUR 3: MODUL PEMBELAJARAN & DOWNLOAD KUESIONER EVALUASI PROGRAM */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">3. Modul & Berkas Unduhan (Batch 2)</h3>
                    <p className="text-xs text-slate-400">Unduh dokumen kuesioner evaluasi resmi untuk pengisian akhir</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  1 Berkas Resmi
                </span>
              </div>

              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    FORMULIR EVALUASI (PDF)
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">Kuesioner Evaluasi Program</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dokumen evaluasi objektif berisi 10 pertanyaan mengenai pelaksanaan, efektivitas, dan sarana penunjang program.
                  </p>
                </div>

                <a
                  href="/files/kuesioner.pdf"
                  download="kuesioner.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer inline-flex"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Kuesioner (PDF)</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}