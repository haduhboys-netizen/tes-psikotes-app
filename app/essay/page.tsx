'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, Sparkles, RefreshCw } from 'lucide-react';
import { ESSAY_QUESTIONS } from '@/data/essayQuestions';

export default function EssayPage() {
  const router = useRouter();
  const [userNama, setUserNama] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('user_nama') || 'Peserta';
    const savedEmail = localStorage.getItem('user_email') || '';

    if (!savedEmail) {
      router.push('/login');
      return;
    }

    setUserNama(savedName);
    setUserEmail(savedEmail);

    const cleanEmail = savedEmail.trim().toLowerCase();
    const savedAnswers = localStorage.getItem(`essay_answers_${cleanEmail}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error(e);
      }
    }
  }, [router]);

  const handleTextChange = (text: string) => {
    const qId = ESSAY_QUESTIONS[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleNext = () => {
    if (currentIndex < ESSAY_QUESTIONS.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).filter((k) => answers[Number(k)]?.trim().length > 0).length;
    if (answeredCount < ESSAY_QUESTIONS.length) {
      const confirmSubmit = window.confirm(
        `Anda baru mengisi ${answeredCount} dari ${ESSAY_QUESTIONS.length} esai. Yakin ingin menyimpan?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    const cleanEmail = userEmail.trim().toLowerCase();

    try {
      // KIRIM KE BACKEND API AI EVALUATOR (/api/submit-test)
      const res = await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: userNama,
          email: cleanEmail,
          type: 'essay',
          answers: answers
        })
      });

      const result = await res.json();
      const finalScore = result.success && result.data?.totalSkor !== undefined ? result.data.totalSkor : 40;

      localStorage.setItem(`essay_answers_${cleanEmail}`, JSON.stringify(answers));
      localStorage.setItem(`essay_completed_${cleanEmail}`, 'true');
      localStorage.setItem(`essay_score_${cleanEmail}`, finalScore.toString());

      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/dashboard');
      }, 800);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim jawaban esai ke server.');
      setIsSubmitting(false);
    }
  };

  const currentQ = ESSAY_QUESTIONS[currentIndex];
  const currentText = answers[currentQ.id] || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">Tes Esai Pemahaman</h1>
              <p className="text-[10px] text-slate-400 font-mono">Tahap 2 (5 Soal Refleksi)</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Esai {currentIndex + 1} / {ESSAY_QUESTIONS.length}
          </span>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 w-fit flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> {currentQ.title}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          <textarea
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Tuliskan pemikiran dan analisis Anda secara rinci di sini..."
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
          />
          <div className="flex justify-end text-[10px] font-mono text-slate-500">
            {currentText.length} Karakter
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>

          {currentIndex < ESSAY_QUESTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Simpan Esai</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}