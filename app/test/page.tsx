'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { questions } from '@/data/questions';
import { 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Award, 
  HelpCircle, 
  User, 
  GraduationCap,
  ListCheck,
  RotateCcw,
  X
} from 'lucide-react';

export default function TestPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ nama: string; batch: string } | null>(null);
  const [namaInput, setNamaInput] = useState('');
  const [batchInput, setBatchInput] = useState('Batch 1');
  const [isIdentityStep, setIsIdentityStep] = useState(true);

  // Soal dan Jawaban
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user_psikotes');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentUser(parsed);
      setNamaInput(parsed.nama);
      setBatchInput(parsed.batch);
      setIsIdentityStep(false);
    }
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaInput.trim()) {
      alert('Mohon masukkan nama lengkap Anda.');
      return;
    }
    const userObj = { nama: namaInput, batch: batchInput };
    localStorage.setItem('user_psikotes', JSON.stringify(userObj));
    setCurrentUser(userObj);
    setIsIdentityStep(false);
  };

  const handleSelectOption = (score: number) => {
    setAnswers({
      ...answers,
      [currentIdx]: score,
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    let sum = 0;
    questions.forEach((_, idx) => {
      sum += answers[idx] || 0;
    });
    setTotalScore(sum);
    setIsSubmitted(true);

    // Simpan skor dengan key spesifik per nama user
    if (currentUser?.nama) {
      localStorage.setItem(`user_psikotes_score_${currentUser.nama}`, JSON.stringify({
        score: sum,
        date: new Date().toLocaleDateString('id-ID')
      }));
    }
  };

  // Fungsi untuk Reset/Tes Ulang
  const handleRestartTest = () => {
    setAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setShowReviewModal(false);
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const getCategory = (score: number) => {
    if (score >= 85) return { label: 'Tinggi (Sangat Matang)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Anda menunjukkan kedalaman rohani yang luar biasa, integritas etis yang kuat, dan pemahaman teologis yang sangat matang.' };
    if (score >= 60) return { label: 'Sedang (Cukup Matang)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', desc: 'Anda memiliki pondasi iman yang baik, meskipun masih memerlukan pertumbuhan di beberapa aspek etika dan spiritual.' };
    return { label: 'Perlu Pendampingan', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'Disarankan untuk lebih banyak melakukan refleksi, pendampingan, serta memperkaya literatur teologis.' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-8 px-4 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-2xl w-full">
        
        {/* STEP 1: Form Identitas */}
        {isIdentityStep && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mx-auto">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Tes Psikotes Teologis</h1>
              <p className="text-xs sm:text-sm text-slate-400">Lengkapi data diri Anda untuk memulai evaluasi 25 pertanyaan.</p>
            </div>

            <form onSubmit={handleStart} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={namaInput}
                  onChange={(e) => setNamaInput(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-400" /> Gelombang / Batch
                </label>
                <select
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
                >
                  <option value="Batch 1">Batch 1 - Dasar Teologis</option>
                  <option value="Batch 2">Batch 2 - Lanjutan & Praktika</option>
                  <option value="Batch 3">Batch 3 - Kematangan Spiritual</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/20"
              >
                Mulai Tes Sekarang →
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2: Main Quiz Interface */}
        {!isIdentityStep && !isSubmitted && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800/80 px-5 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Pertanyaan</span>
                  <span className="text-base font-extrabold text-white">{currentIdx + 1} <span className="text-xs text-slate-500">dari 25</span></span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Progres Terjawab</span>
                <span className="text-xs font-extrabold text-blue-400">{answeredCount}/25 Soal ({progressPercent}%)</span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6"
              >
                <h2 className="text-lg font-bold text-slate-100 leading-relaxed">
                  {questions[currentIdx].question}
                </h2>

                <div className="space-y-3.5">
                  {questions[currentIdx].options.map((opt, i) => {
                    const isSelected = answers[currentIdx] === opt.score;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(opt.score)}
                        className={`w-full p-4 rounded-xl text-left border text-sm transition flex items-start space-x-3 ${
                          isSelected 
                            ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/5' 
                            : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                          isSelected ? 'border-blue-400 bg-blue-500 text-white' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-850 disabled:opacity-30 rounded-xl text-sm font-semibold border border-slate-800 text-slate-300 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={answers[currentIdx] === undefined}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/10 transition flex items-center gap-1.5"
                >
                  Berikutnya <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={answeredCount < questions.length}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Selesai & Kirim
                </button>
              )}
            </div>

            {answeredCount < questions.length && (
              <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1 bg-slate-900/40 py-2 rounded-lg border border-slate-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Jawab semua pertanyaan ({answeredCount}/25) untuk mengaktifkan tombol kirim.
              </p>
            )}
          </div>
        )}

        {/* STEP 3: Halaman Hasil */}
        {isSubmitted && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Tes Berhasil Diselesaikan</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Laporan Hasil Psikotes Teologis</h2>
              <p className="text-xs text-slate-400">Atas Nama: <strong className="text-slate-200">{currentUser?.nama}</strong> ({currentUser?.batch})</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm mx-auto space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Skor Kematangan Spiritual</span>
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{totalScore} <span className="text-sm font-medium text-slate-500">/ 100</span></span>
              
              <div className="pt-2">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${getCategory(totalScore).color}`}>
                  Kategori: {getCategory(totalScore).label}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              {getCategory(totalScore).desc}
            </p>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <ListCheck className="w-4 h-4 text-blue-400" />
                <span>Lihat Review Jawaban</span>
              </button>

              <button
                onClick={handleRestartTest}
                className="px-5 py-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/30 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tes Ulang</span>
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {/* Modal Review Jawaban */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListCheck className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-base">Evaluasi Jawaban (25 Pertanyaan)</h3>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {questions.map((q, idx) => {
                  const userScore = answers[idx] || 0;
                  const selectedOpt = q.options.find(o => o.score === userScore);
                  return (
                    <div key={idx} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-blue-400">Soal #{idx + 1}</span>
                        <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20">
                          Poin: {userScore}/4
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{q.question}</p>
                      <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
                        <strong className="text-slate-300">Jawaban Anda:</strong> {selectedOpt ? selectedOpt.text : 'Belum Dijawab'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}