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
  Briefcase,
  BookOpen,
  FileText,
  Trash2,
  Send,
  BrainCircuit,
  Unlock,
  Award,
  ListOrdered
} from 'lucide-react';
import { fontEssayGroups } from '@/data/essayQuestions';
import { questions as pgQuestions } from '@/data/questions';
import { problemSolvingQuestions } from '@/data/problemSolvingQuestions';
import { supabase } from '@/lib/supabase';

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get('mode');
  const stepParam = searchParams.get('step');

  // Step 1: PG | Step 2: Esai Teologis | Step 3: Upload PDF Batch 1 | Step 4: Problem Solving (Tahap Akhir) | Step 5: Hasil | Step 6: Form Batch 2
  const [activeStep, setActiveStep] = useState(1);

  // --- STATE TAHAP 1: PILIHAN GANDA ---
  const [pgAnswers, setPgAnswers] = useState<{ [key: number]: number }>({});
  const [pgScore, setPgScore] = useState(0);

  // --- STATE TAHAP 2: ESAI TEOLOGIS ---
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [essayAnswers, setEssayAnswers] = useState<{ [key: string]: string }>({});
  const [groupScores, setGroupScores] = useState<{ [groupIdx: number]: number }>({});

  // --- STATE TAHAP 3: UPLOAD PDF BATCH 1 ---
  const [nama, setNama] = useState('');
  const [fileBatch1, setFileBatch1] = useState<File | null>(null);

  // --- STATE TAHAP 4: PROBLEM SOLVING CHALLENGE ---
  const [psAnswers, setPsAnswers] = useState<{ [key: number]: string }>({});
  const [psScore, setPsScore] = useState<number | null>(null);
  const [isEvaluatingPs, setIsEvaluatingPs] = useState(false);

  // --- STATE COMMON & MODAL GAGAL ---
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedScore, setFailedScore] = useState(0);
  const [failedType, setFailedType] = useState<'essay' | 'ps'>('essay');
  const [isUploading, setIsUploading] = useState(false);

  // --- STATE KHUSUS FORM BATCH 2 ---
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
        if ([1, 2, 3, 4].includes(parsedStep)) {
          setActiveStep(parsedStep);
          return;
        }
      }
      setActiveStep(1);
      setCurrentGroupIdx(0);
      setPgAnswers({});
      setEssayAnswers({});
      setPsAnswers({});
      setFileBatch1(null);
      setIsSubmittedBatch2(false);
    }
  }, [modeParam, stepParam]);

  // --- HANDLER TAHAP 1 (PG - AKURAT DENGAN ATAU TANPA SKOR KHUSUS) ---
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
        totalPoints += Number(selectedOption.score) || 0;
        const maxOptScore = Math.max(...q.options.map((o: any) => (typeof o === 'object' ? Number(o.score) || 0 : 0)));
        maxPossiblePoints += maxOptScore > 0 ? maxOptScore : 1;
      } else {
        // PERBAIKAN: Jika opsi A, B, C, D bernilai bobot opsional (misal A=100%, B=75%, C=50%, D=25%)
        // Jika tidak ada correctAnswer eksplisit, beri bobot bertingkat A=100%, B=75%, C=50%, D=25%
        const scoreWeight = selectedOptIdx === 0 ? 1.0 : selectedOptIdx === 1 ? 0.75 : selectedOptIdx === 2 ? 0.50 : 0.25;
        totalPoints += scoreWeight;
        maxPossiblePoints += 1.0;
      }
    });

    const calculatedScore = maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100) : 0;
    setPgScore(calculatedScore);
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HANDLER TAHAP 2 (ESAI TEOLOGIS) ---
  const handleAnswerChange = (qIdx: number, val: string) => {
    setEssayAnswers((prev) => ({
      ...prev,
      [`${currentGroupIdx}_${qIdx}`]: val,
    }));
  };

  const evaluateEssayWithAI = async (questions: any[]) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      alert('API Key Gemini belum terpasang di .env.local!');
      return 70;
    }

    let promptText = `Kamu adalah seorang penguji teologi dan psikotes profesional.
Tugasmu adalah memberikan nilai (skala 0 - 100) secara presisi untuk esai berikut:\n\n`;

    questions.forEach((q, idx) => {
      const ans = essayAnswers[`${currentGroupIdx}_${idx}`] || '';
      promptText += `Pertanyaan ${idx + 1}: ${q.question}\nJawaban Peserta: ${ans}\n\n`;
    });

    promptText += `BALAS DALAM FORMAT JSON SAJA: {"score": 85}`;

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

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.score === 'number') return parsed.score;
      }
      return 75;
    } catch (err) {
      console.error('Error AI:', err);
      return 70;
    }
  };

  const handleNextGroup = async () => {
    const currentQuestions = fontEssayGroups[currentGroupIdx].questions;
    const isAnyEmpty = currentQuestions.some(
      (_, idx) => !(essayAnswers[`${currentGroupIdx}_${idx}`] || '').trim()
    );

    if (isAnyEmpty) {
      alert('Mohon isi semua pertanyaan esai sebelum melanjutkan.');
      return;
    }

    setIsEvaluating(true);
    const score = await evaluateEssayWithAI(currentQuestions);
    setIsEvaluating(false);

    if (score < 60) {
      setFailedScore(score);
      setFailedType('essay');
      setShowFailedModal(true);
      return;
    }

    setGroupScores((prev) => ({ ...prev, [currentGroupIdx]: score }));

    if (currentGroupIdx < fontEssayGroups.length - 1) {
      setCurrentGroupIdx((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // PINDAH KE TAHAP 3 (UPLOAD PDF DULU SEBELUM PROBLEM SOLVING)
      setActiveStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- HANDLER TAHAP 3 (UPLOAD PDF BATCH 1) ---
  const handleProceedToProblemSolving = () => {
    if (!nama.trim()) {
      alert('Mohon masukkan nama Anda.');
      return;
    }

    setActiveStep(4); // PINDAH KE TAHAP 4 (PROBLEM SOLVING TAHAP AKHIR)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HANDLER TAHAP 4 (PROBLEM SOLVING TAHAP AKHIR) ---
  const handlePsAnswerChange = (qId: number, val: string) => {
    setPsAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleEvaluateProblemSolvingAndSubmit = async () => {
    const isAllFilled = problemSolvingQuestions.every((q) => (psAnswers[q.id] || '').trim().length > 10);
    if (!isAllFilled) {
      alert('Mohon isi seluruh 5 soal problem solving secara rinci (minimal 10 karakter per soal).');
      return;
    }

    setIsEvaluatingPs(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let promptText = `Kamu adalah seorang asesor kepemimpinan & problem solving profesional.
Evaluasi jawaban studi kasus berikut dan berikan nilai rata-rata keseluruhan (0-100):\n\n`;

    problemSolvingQuestions.forEach((q, idx) => {
      const ans = psAnswers[q.id] || '';
      promptText += `Kasus ${idx + 1} (${q.scenario}): ${q.question}\nJawaban Peserta: ${ans}\n\n`;
    });

    promptText += `BALAS DALAM FORMAT JSON SAJA: {"score": 80}`;

    let evaluatedPsScore = 75;

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

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.score === 'number') evaluatedPsScore = parsed.score;
      }
    } catch (err) {
      console.error('Error PS AI:', err);
    }

    setIsEvaluatingPs(false);

    if (evaluatedPsScore < 60) {
      setFailedScore(evaluatedPsScore);
      setFailedType('ps');
      setShowFailedModal(true);
      return;
    }

    setPsScore(evaluatedPsScore);

    // KARENA INI TAHAP TERAKHIR, LANGSUNG UPLOAD & SIMPAN SEMUA DATA BATCH 1 KE SUPABASE
    await handleFinalSubmitBatch1(evaluatedPsScore);
  };

  // --- SUBMIT UTAMA SEMUA DATA BATCH 1 KE SUPABASE ---
  const handleFinalSubmitBatch1 = async (finalPsScore: number) => {
    setIsUploading(true);

    try {
      let uploadedPdfUrl = '';
      let uploadedPdfName = '';

      // Upload file PDF jika diunggah pada tahap 3
      if (fileBatch1) {
        const fileExt = fileBatch1.name.split('.').pop();
        const fileName = `${Date.now()}_batch1_${nama.replace(/\s+/g, '_')}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('psikotes-docs')
          .upload(filePath, fileBatch1);

        if (uploadErr) {
          console.error('Upload PDF Storage Error:', uploadErr);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('psikotes-docs')
            .getPublicUrl(filePath);

          uploadedPdfUrl = publicUrlData.publicUrl;
          uploadedPdfName = fileBatch1.name;
        }
      }

      // Hitung Rata-Rata Esai
      const scoreValues = Object.values(groupScores);
      const avgEssayScore = scoreValues.length > 0
        ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
        : 75;

      const userEmail = localStorage.getItem('user_email') || 'peserta@example.com';

      // SIMPAN REKAP DATABASE BATCH 1
      const { error: dbErr } = await supabase.from('psikotes_reports').insert([
        {
          nama: nama,
          email: userEmail,
          batch: 'Batch 1 - Dasar Teologis',
          score_part1: pgScore,
          score_part2: avgEssayScore,
          problem_solving_score: finalPsScore,
          pdf_file_name: uploadedPdfName || null,
          pdf_url: uploadedPdfUrl || null,
          essay_answers: essayAnswers,
          pg_answers: pgAnswers,
          problem_solving_answers: psAnswers,
        },
      ]);

      if (dbErr) {
        console.error('Database Error:', dbErr);
        alert('Gagal menyimpan data laporan ke database: ' + dbErr.message);
      } else {
        localStorage.setItem(`batch1_submitted_${nama}`, 'true');
        setActiveStep(5); // LANDING DI LAYAR PENGUMPULAN BERHASIL (TAHAP 5)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      alert('Terjadi kesalahan submit: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- SUBMIT TUGAS BATCH 2 ---
  const handleSubmitBatch2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBatch2) {
      alert('Mohon unggah berkas PDF laporan Anda.');
      return;
    }
    if (!isStatementChecked) {
      alert('Mohon centang konfirmasi keaslian laporan.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = fileBatch2.name.split('.').pop();
      const fileName = `${Date.now()}_batch2_${nama.replace(/\s+/g, '_')}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('psikotes-docs')
        .upload(filePath, fileBatch2);

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from('psikotes-docs')
        .getPublicUrl(filePath);

      const userEmail = localStorage.getItem('user_email') || 'peserta@example.com';

      const { error: dbErr } = await supabase.from('psikotes_reports').insert([
        {
          nama: nama,
          email: userEmail,
          batch: 'Batch 2 - Lanjutan & Praktika',
          score_part1: 0,
          score_part2: 0,
          problem_solving_score: 0,
          pdf_file_name: fileBatch2.name,
          pdf_url: publicUrlData.publicUrl,
        },
      ]);

      if (dbErr) throw dbErr;

      localStorage.setItem(`batch2_submitted_${nama}`, 'true');
      setIsSubmittedBatch2(true);
    } catch (err: any) {
      alert('Gagal mengunggah laporan Batch 2: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // CALC RATA-RATA ESAI
  const scoreValues = Object.values(groupScores);
  const avgEssayScoreCalculated = scoreValues.length > 0
    ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
    : 75;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      
      <div className="max-w-3xl mx-auto w-full space-y-6">

        {/* HEADER INDICATOR */}
        {activeStep <= 4 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {activeStep === 1 && 'Tahap 1: Pilihan Ganda'}
              {activeStep === 2 && `Tahap 2: Evaluasi Esai (${currentGroupIdx + 1}/${fontEssayGroups.length})`}
              {activeStep === 3 && 'Tahap 3: Unggah Laporan Portofolio'}
              {activeStep === 4 && 'Tahap 4: Seleksi Problem Solving Lanjutan'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Langkah {activeStep} dari 4
            </span>
          </div>
        )}

        {/* ==========================================
            TAHAP 1: PILIHAN GANDA (PG)
        ========================================== */}
        {activeStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
              <h2 className="text-2xl font-black text-white">Tes Pilihan Ganda Teologis</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Jawablah 20 pertanyaan pilihan ganda berikut untuk mengukur pemahaman dasar doktrin dan wawasan keagamaan Anda.
              </p>
            </div>

            <div className="space-y-4">
              {pgQuestions.map((q, qIdx) => (
                <div key={q.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg">
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = pgAnswers[q.id] === optIdx;
                      const optText = typeof opt === 'object' ? opt.text : opt;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectPg(q.id, optIdx)}
                          className={`w-full p-4 rounded-2xl text-left text-xs font-semibold transition border ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {optText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinishPg}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <span>Selesaikan Pilihan Ganda &amp; Lanjut ke Esai</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ==========================================
            TAHAP 2: ESAI TEOLOGIS
        ========================================== */}
        {activeStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                GELOMBANG ESAI #{currentGroupIdx + 1}
              </span>
              <h2 className="text-2xl font-black text-white">{fontEssayGroups[currentGroupIdx].title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tuliskan penjelasan dan pemikiran reflektif Anda untuk setiap pertanyaan di bawah ini secara mendalam.
              </p>
            </div>

            <div className="space-y-6">
              {fontEssayGroups[currentGroupIdx].questions.map((q, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-lg">
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {idx + 1}. {q.question}
                  </p>
                  <textarea
                    rows={4}
                    value={essayAnswers[`${currentGroupIdx}_${idx}`] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder="Tuliskan jawaban lengkap dan reflektif Anda..."
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleNextGroup}
              disabled={isEvaluating}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sistem AI Sedang Mengevaluasi Jawaban Anda...</span>
                </>
              ) : (
                <>
                  <span>
                    {currentGroupIdx < fontEssayGroups.length - 1
                      ? 'Evaluasi Esai & Lanjut Gelombang Berikutnya'
                      : 'Evaluasi Esai & Lanjut ke Unggah Berkas'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* ==========================================
            TAHAP 3: UNGGAH LAPORAN PORTFOLIO (PDR BATCH 1)
        ========================================== */}
        {activeStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl text-center"
          >
            <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Tahap 3: Unggah Laporan PDF (Opsional)</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Anda dapat mengunggah berkas portofolio atau laporan PDF tambahan sebelum melangkah ke tahap evaluasi problem solving terakhir.
              </p>
            </div>

            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Nama Lengkap Peserta</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Berkas Laporan PDF (Opsional / Batch 1)</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 p-6 rounded-2xl text-center transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFileBatch1(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">
                    {fileBatch1 ? fileBatch1.name : 'Klik atau seret file PDF laporan ke sini'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Format yang didukung: Dokumen PDF (Maksimal 10MB)</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToProblemSolving}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-4"
            >
              <span>Lanjut ke Tahap Terakhir (Problem Solving)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ==========================================
            TAHAP 4: SELEKSI PROBLEM SOLVING LANJUTAN (TAHAP TERAKHIR)
        ========================================== */}
        {activeStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                GATING TEST: PROBLEM SOLVING
              </span>
              <h2 className="text-2xl font-black text-white">Studi Kasus &amp; Analisis Solusi</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Selesaikan 5 tantangan studi kasus di bawah ini. Anda wajib meraih skor minimal <strong>60</strong> dari sistem evaluasi AI untuk membuka akses ke Batch 2.
              </p>
            </div>

            <div className="space-y-6">
              {problemSolvingQuestions.map((q, idx) => (
                <div key={q.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {q.scenario}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {idx + 1}. {q.question}
                  </p>
                  <textarea
                    rows={4}
                    value={psAnswers[q.id] || ''}
                    onChange={(e) => handlePsAnswerChange(q.id, e.target.value)}
                    placeholder="Tuliskan solusi praktis dan langkah taktis Anda..."
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleEvaluateProblemSolvingAndSubmit}
              disabled={isEvaluatingPs || isUploading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isEvaluatingPs || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sistem AI Sedang Mengevaluasi Solusi &amp; Menyimpan Data...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim &amp; Selesaikan Seluruh Data Tes</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* ==========================================
            TAHAP 5: HALAMAN PENGUMPULAN BERHASIL (LENGKAP SEMUA SKOR)
        ========================================== */}
        {activeStep === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Pengumpulan Berhasil!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Terima kasih, data dan berkas laporan Batch 1 Anda telah berhasil tersimpan di sistem.
              </p>
            </div>

            {/* CARD RINGKASAN SEMUA SKOR HASIL TES BATCH 1 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                RINGKASAN SKOR HASIL TES EVALUASI BATCH 1
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {/* SKOR PILIHAN GANDA */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKOR PILIHAN GANDA</p>
                  <p className="text-2xl font-black text-blue-400 mt-1">
                    {pgScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </p>
                </div>

                {/* SKOR ESAI AI */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RATA-RATA ESAI AI</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {avgEssayScoreCalculated} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </p>
                </div>

                {/* SKOR PROBLEM SOLVING */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROBLEM SOLVING</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {psScore ?? 0} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Selesai &amp; Kembali ke Dashboard</span>
            </button>
          </motion.div>
        )}

        {/* ==========================================
            TAHAP 6: FORM KHUSUS UNGGAH LAPORAN BATCH 2
        ========================================== */}
        {activeStep === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-3 shadow-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
                BATCH 2 - LANJUTAN &amp; PRAKTIKA
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">Formulir Pengumpulan Laporan Praktika</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Silakan unggah dokumen laporan hasil studi kasus lapangan dan pengamatan teologi praktika Anda di bawah ini.
              </p>
            </div>

            {isSubmittedBatch2 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl text-center">
                <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white">Laporan Batch 2 Terkirim!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Berkas laporan praktika teologi lanjutan Anda telah tersimpan. Pengawas akan melakukan peninjauan terhadap dokumen Anda.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Kembali ke Dashboard</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBatch2} className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Nama Lengkap Peserta</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda..."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Judul / Topik Laporan Praktika</label>
                  <input
                    type="text"
                    required
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    placeholder="Contoh: Analisis Pelayanan Sosial di Komunitas Lokal..."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Catatan Ringkas / Abstrak Laporan</label>
                  <textarea
                    rows={3}
                    value={abstractNote}
                    onChange={(e) => setAbstractNote(e.target.value)}
                    placeholder="Tuliskan ringkasan singkat isi laporan Anda..."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Unggah Berkas PDF Laporan Batch 2</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 p-6 rounded-2xl text-center transition cursor-pointer relative">
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileBatch2(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-300">
                      {fileBatch2 ? fileBatch2.name : 'Klik atau seret file PDF laporan ke sini'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Format yang didukung: Dokumen PDF (Maksimal 10MB)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="confirmStatement"
                    checked={isStatementChecked}
                    onChange={(e) => setIsStatementChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="confirmStatement" className="text-xs text-slate-400 cursor-pointer selection:bg-none">
                    Saya menyatakan bahwa laporan ini adalah hasil karya asli observasi pribadi saya.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengunggah Berkas Laporan Batch 2...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Laporan Praktika Batch 2</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}

      </div>

      {/* MODAL POPUP JIKA SKOR KURA DARI 60 (GAGAL ESAI / PROBLEM SOLVING) */}
      {showFailedModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-600/20">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Nilai Belum Memenuhi Syarat</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Skor evaluasi {failedType === 'essay' ? 'esai' : 'problem solving'} Anda adalah{' '}
                <strong className="text-rose-400 font-black">{failedScore}/100</strong>. Anda membutuhkan minimal skor{' '}
                <strong className="text-white font-bold">60</strong> untuk dapat lolos ke tahap berikutnya.
              </p>
            </div>

            <button
              onClick={() => {
                setShowFailedModal(false);
                if (failedType === 'essay') {
                  setCurrentGroupIdx(0);
                }
              }}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Ulangi Bagian Ini</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <TestContent />
    </Suspense>
  );
}