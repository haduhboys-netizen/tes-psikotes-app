'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  RotateCcw,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Upload,
  LayoutDashboard,
  Send,
} from 'lucide-react';
import { questions as pgQuestions } from '@/data/questions';
import { problemSolvingQuestions } from '@/data/problemSolvingQuestions';
import { supabase } from '@/lib/supabase';

// 5 SOAL ESAI TETAP / LANGSUNG 1 - 5 TANPA GELOMBANG
const directEssayQuestions = [
  {
    id: 1,
    question: "Jelaskan bagaimana konsep kedaulatan Tuhan memengaruhi cara pandang Anda dalam menghadapi krisis atau masalah pelik dalam kehidupan sehari-hari.",
  },
  {
    id: 2,
    question: "Menurut pandangan teologis Anda, apa esensi dari pengampunan, dan bagaimana seseorang dapat menerapkannya secara nyata ketika menghadapi konflik interpersonal yang berat?",
  },
  {
    id: 3,
    question: "Bagaimana Anda memahami keseimbangan antara anugerah (grace) dan tanggung jawab moral (works) dalam pertumbuhan rohani seorang beriman?",
  },
  {
    id: 4,
    question: "Jelaskan makna pelayanan yang dilandasi oleh kasih agape, serta berikan contoh aplikasinya di tengah masyarakat majemuk.",
  },
  {
    id: 5,
    question: "Bagaimana doa dapat mengubah perspektif seseorang dalam menghadapi penderitaan atau pergumulan hidup yang berkepanjangan?",
  },
];

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const stepParam = searchParams.get('step');

  const [activeStep, setActiveStep] = useState(1);

  // STATE TAHAP 1: PILIHAN GANDA
  const [pgAnswers, setPgAnswers] = useState<{ [key: number]: number }>({});
  const [pgScore, setPgScore] = useState(0);

  // STATE TAHAP 2: ESAI TEOLOGIS (1 - 5 LANGSUNG)
  const [essayAnswers, setEssayAnswers] = useState<{ [key: number]: string }>({});
  const [essayScore, setEssayScore] = useState(0);

  // STATE TAHAP 3: PROBLEM SOLVING CHALLENGE
  const [psAnswers, setPsAnswers] = useState<{ [key: number]: string }>({});
  const [psScore, setPsScore] = useState<number | null>(null);
  const [isEvaluatingPs, setIsEvaluatingPs] = useState(false);

  // STATE COMMON & MODAL GAGAL
  const [nama, setNama] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedScore, setFailedScore] = useState(0);
  const [failedType, setFailedType] = useState<'essay' | 'ps'>('essay');
  const [isUploading, setIsUploading] = useState(false);

  // STATE KHUSUS FORM BATCH 2
  const [fileBatch2, setFileBatch2] = useState<File | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [abstractNote, setAbstractNote] = useState('');
  const [isStatementChecked, setIsStatementChecked] = useState(false);
  const [isSubmittedBatch2, setIsSubmittedBatch2] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('user_nama') || '';
    if (savedName) setNama(savedName);

    if (modeParam === 'upload') {
      setActiveStep(6);
      setFileBatch2(null);
    } else {
      if (stepParam) {
        const parsedStep = parseInt(stepParam, 10);
        // Map step param ke step baru (step 3 sekarang problem solving)
        if ([1, 2, 3].includes(parsedStep)) {
          setActiveStep(parsedStep);
          return;
        }
      }
      setActiveStep(1);
    }
    setPgAnswers({});
    setEssayAnswers({});
    setPsAnswers({});
    setIsSubmittedBatch2(false);
  }, [modeParam, stepParam]);

  // HANDLER TAHAP 1 (PG)
  const handleSelectPg = (qId: number, optionIdx: number) => {
    setPgAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleFinishPg = () => {
    if (Object.keys(pgAnswers).length < pgQuestions.length) {
      alert('Mohon jawab semua pertanyaan pilihan ganda terlebih dahulu.');
      return;
    }
    let totalPoints = 0;
    let maxPossiblePoints = 0;

    pgQuestions.forEach((q) => {
      const selectedOptIdx = pgAnswers[q.id];
      const selectedOption = q.options[selectedOptIdx];

      if (typeof selectedOption === 'object' && selectedOption !== null && 'score' in selectedOption) {
        totalPoints += Number((selectedOption as any).score) || 0;
        const maxOptScore = Math.max(...q.options.map((o: any) => (typeof o === 'object' ? Number(o.score) || 0 : 0)));
        maxPossiblePoints += maxOptScore > 0 ? maxOptScore : 1;
      } else {
        const scoreWeight = selectedOptIdx === 0 ? 1.0 : selectedOptIdx === 1 ? 0.75 : selectedOptIdx === 2 ? 0.5 : 0.25;
        totalPoints += scoreWeight;
        maxPossiblePoints += 1.0;
      }
    });

    const calculatedScore = maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100) : 0;
    setPgScore(calculatedScore);
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // HANDLER TAHAP 2 (ESAI 1 - 5 DENGAN PENILAIAN AKUMULASI AI)
  const handleEssayChange = (qId: number, val: string) => {
    setEssayAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const evaluateAllEssaysWithAI = async () => {
    const isAnyEmpty = directEssayQuestions.some((q) => !(essayAnswers[q.id] || '').trim());
    if (isAnyEmpty) {
      alert('Mohon lengkapi ke-5 jawaban esai terlebih dahulu.');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      alert('API Key Gemini belum terpasang di .env.local!');
      return;
    }

    setIsEvaluating(true);
    let promptText = 'Kamu adalah penguji teologi profesional. Evaluasi ke-5 jawaban esai berikut secara objektif dan berikan rata-rata nilai total skala 0-100.\n\n';
    directEssayQuestions.forEach((q, idx) => {
      promptText += `Soal ${idx + 1}: ${q.question}\nJawaban Peserta: ${essayAnswers[q.id]}\n\n`;
    });
    promptText += 'BALAS DALAM FORMAT JSON SAJA: {"score": 85}';

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
        }
      );
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      
      let finalScore = 75;
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.score === 'number') finalScore = parsed.score;
      }

      setIsEvaluating(false);

      if (finalScore < 60) {
        setFailedScore(finalScore);
        setFailedType('essay');
        setShowFailedModal(true);
        return;
      }

      setEssayScore(finalScore);
      // LANGSUNG MASUK KE TAHAP PROBLEM SOLVING (TAHAP 3)
      setActiveStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error AI Essay:', err);
      setIsEvaluating(false);
      setEssayScore(70);
      setActiveStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // HANDLER TAHAP 3 (PROBLEM SOLVING)
  const handlePsAnswerChange = (qId: number, val: string) => {
    setPsAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleEvaluateProblemSolvingAndSubmit = async () => {
    const isAllFilled = problemSolvingQuestions.every((q) => (psAnswers[q.id] || '').trim().length > 0);
    if (!isAllFilled) {
      alert('Mohon lengkapi semua jawaban studi kasus problem solving.');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      alert('API Key Gemini belum terpasang di .env.local!');
      return;
    }

    setIsEvaluatingPs(true);
    let promptText = 'Evaluasi jawaban studi kasus problem solving teologis berikut dan berikan nilai skala 0-100:\n\n';
    problemSolvingQuestions.forEach((q, idx) => {
      promptText += `Studi Kasus ${idx + 1}: ${q.question}\nJawaban Peserta: ${psAnswers[q.id]}\n\n`;
    });
    promptText += 'BALAS DALAM FORMAT JSON SAJA: {"score": 80}';

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
        }
      );
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);

      let psVal = 75;
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.score === 'number') psVal = parsed.score;
      }

      setIsEvaluatingPs(false);

      if (psVal < 60) {
        setFailedScore(psVal);
        setFailedType('ps');
        setShowFailedModal(true);
        return;
      }

      setPsScore(psVal);
      await saveBatch1ToSupabase(psVal);
    } catch (err) {
      console.error('Error PS Evaluation:', err);
      setIsEvaluatingPs(false);
      setPsScore(70);
      await saveBatch1ToSupabase(70);
    }
  };

  const saveBatch1ToSupabase = async (finalPsScore: number) => {
    setIsUploading(true);
    try {
      const userNamaSaved = localStorage.getItem('user_nama') || 'Peserta';
      const email = localStorage.getItem('user_email') || 'peserta@gmail.com';
      const batch = localStorage.getItem('user_batch') || 'Batch 1 - Dasar Teologis';

      const { error } = await supabase.from('psikotes_reports').insert([
        {
          nama: userNamaSaved,
          email,
          batch,
          score_part1: pgScore,
          score_part2: essayScore,
          problem_solving_score: finalPsScore,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert('Selamat! Rangkaian Tes Batch 1 berhasil diselesaikan dan disimpan.');
      router.push('/dashboard');
    } catch (err) {
      console.error('Gagal menyimpan ke Supabase:', err);
      alert('Terjadi kesalahan saat menyimpan data ke database.');
      setIsUploading(false);
    }
  };

  // HANDLER BATCH 2 UPLOAD
  const handleSubmitBatch2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !abstractNote.trim() || !isStatementChecked) {
      alert('Mohon lengkapi judul, ringkasan, dan centang pernyataan keaslian laporan.');
      return;
    }

    setIsUploading(true);
    try {
      const savedName = localStorage.getItem('user_nama') || 'Peserta';
      const email = localStorage.getItem('user_email') || 'peserta@gmail.com';

      const { error } = await supabase.from('psikotes_reports').insert([
        {
          nama: savedName,
          email,
          batch: 'Batch 2 - Lanjutan & Praktika',
          score_part1: 100,
          score_part2: 100,
          problem_solving_score: 100,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      localStorage.setItem(`batch2_submitted_${savedName}`, 'true');
      setIsSubmittedBatch2(true);
      alert('Laporan Praktika Batch 2 berhasil dikirim!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error Batch 2:', err);
      alert('Gagal mengirim laporan Batch 2.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER PROGRESS */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-white">Ujian Psikotes Teologis</h1>
            <p className="text-xs text-slate-400 font-mono">
              {activeStep <= 3 ? `Tahap ${activeStep} dari 3 (Batch 1)` : 'Formulir Laporan Lapangan (Batch 2)'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
            <span>Kembali ke Dashboard</span>
          </button>
        </div>

        {/* TAHAP 1: PILIHAN GANDA */}
        {activeStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Tahap 1
                </span>
                <h2 className="text-xl font-bold text-white mt-2">Pilihan Ganda Teologis</h2>
                <p className="text-xs text-slate-400">Pilih jawaban yang paling tepat sesuai pemahaman teologis Anda.</p>
              </div>

              <div className="space-y-6">
                {pgQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <p className="text-sm font-bold text-white">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const optText = typeof opt === 'string' ? opt : (opt as any).text;
                        const isSelected = pgAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectPg(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition flex items-center gap-3 ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{optText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinishPg}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Evaluasi Esai</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAHAP 2: ESAI TEOLOGIS (1 - 5 NOMOR LANGSUNG) */}
        {activeStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Tahap 2
                </span>
                <h2 className="text-xl font-bold text-white mt-2">Esai Teologis (1 - 5)</h2>
                <p className="text-xs text-slate-400">Jawab kelima pertanyaan esai di bawah ini dengan narasi yang mendalam.</p>
              </div>

              <div className="space-y-6">
                {directEssayQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <label className="text-sm font-bold text-white flex items-start gap-2">
                      <span className="text-blue-400 font-mono">#{idx + 1}</span>
                      <span>{q.question}</span>
                    </label>
                    <textarea
                      rows={4}
                      value={essayAnswers[q.id] || ''}
                      onChange={(e) => handleEssayChange(q.id, e.target.value)}
                      placeholder="Tuliskan jawaban naratif Anda di sini..."
                      className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={evaluateAllEssaysWithAI}
                disabled={isEvaluating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Sedang Menganalisis Esai...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim & Nilai Esai via AI</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAHAP 3: PROBLEM SOLVING */}
        {activeStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Tahap 3
                </span>
                <h2 className="text-xl font-bold text-white mt-2">Studi Kasus Problem Solving</h2>
                <p className="text-xs text-slate-400">Analisis skenario kasus teologis di bawah ini secara mendalam.</p>
              </div>

              <div className="space-y-6">
                {problemSolvingQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <p className="text-sm font-bold text-white">
                      {idx + 1}. {q.question}
                    </p>
                    <textarea
                      rows={4}
                      value={psAnswers[q.id] || ''}
                      onChange={(e) => handlePsAnswerChange(q.id, e.target.value)}
                      placeholder="Tuliskan analisis dan solusi praktis Anda..."
                      className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleEvaluateProblemSolvingAndSubmit}
                disabled={isEvaluatingPs || isUploading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEvaluatingPs || isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menilai & Menyimpan Hasil Ujian...</span>
                  </>
                ) : (
                  <>
                    <span>Selesaikan & Kirim Ujian Batch 1</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAHAP 6: FORMULIR BATCH 2 */}
        {activeStep === 6 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Batch 2
                </span>
                <h2 className="text-xl font-bold text-white mt-2">Upload Laporan Lanjutan & Praktika</h2>
                <p className="text-xs text-slate-400">Unggah berkas laporan studi kasus lapangan Anda untuk penilaian lanjutan.</p>
              </div>

              <form onSubmit={handleSubmitBatch2} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Judul Topik / Proyek</label>
                  <input
                    type="text"
                    required
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    placeholder="Contoh: Analisis Pelayanan Kontekstual di Daerah X"
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Abstraksi / Ringkasan Singkat</label>
                  <textarea
                    rows={3}
                    required
                    value={abstractNote}
                    onChange={(e) => setAbstractNote(e.target.value)}
                    placeholder="Tuliskan ringkasan dari laporan Anda..."
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">File Laporan (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setFileBatch2(e.target.files?.[0] || null)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="statement"
                    checked={isStatementChecked}
                    onChange={(e) => setIsStatementChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="statement" className="text-xs text-slate-300 cursor-pointer">
                    Saya menyatakan bahwa laporan ini disusun berdasarkan hasil pengamatan autentik.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Laporan...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Kirim Laporan Batch 2</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </div>

      {/* MODAL GAGAL / NILAI DI BAWAH 60 */}
      {showFailedModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Nilai Belum Mencukupi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Skor Anda pada tahap ini adalah <strong className="text-rose-400">{failedScore}</strong>. Anda memerlukan minimal skor <strong className="text-emerald-400">60</strong> untuk dapat melanjutkan ke tahap berikutnya.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowFailedModal(false)}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-blue-400" />
                <span>Ulangi & Perbaiki Jawaban</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">Memuat Halaman Tes...</div>}>
      <TestContent />
    </Suspense>
  );
}